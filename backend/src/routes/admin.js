import express from 'express';
import db from '../models/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Stats
router.get('/stats', (req, res) => {
  try {
    const doctors = db.prepare('SELECT COUNT(*) as count FROM users WHERE role="doctor"').get();
    const patients = db.prepare('SELECT COUNT(*) as count FROM users WHERE role="patient"').get();
    const appointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get();
    const invoices = db.prepare('SELECT COUNT(*) as count FROM invoices').get();
    const revenue = db.prepare('SELECT * FROM invoices WHERE status="paid"').all();
    const totalRevenue = revenue.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    res.json({
      doctors: doctors.count,
      patients: patients.count,
      appointments: appointments.count,
      invoices: invoices.count,
      totalRevenue,
      pendingAppointments: db.prepare('SELECT COUNT(*) as count FROM appointments WHERE status="pending"').get().count
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All users
router.get('/users', (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, phone, age, gender, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

// All appointments
router.get('/appointments', (req, res) => {
  const appts = db.prepare('SELECT * FROM appointments ORDER BY created_at DESC').all();
  res.json(appts);
});

// All doctors with verification
router.get('/doctors', (req, res) => {
  const doctors = db.prepare(`
    SELECT u.id, u.name, u.email, u.phone, d.specialization, d.qualification, d.experience, d.fee, d.rating, d.is_verified
    FROM users u JOIN doctors d ON u.id = d.user_id
    ORDER BY d.rating DESC
  `).all();
  res.json(doctors);
});

export default router;
