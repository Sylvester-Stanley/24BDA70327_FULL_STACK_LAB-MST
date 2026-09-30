import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all doctors with filters
router.get('/', (req, res) => {
  try {
    const { specialization, search } = req.query;
    let query = `
      SELECT u.id, u.name, u.email, u.phone, 
             d.id as doctor_id, d.specialization, d.qualification, d.experience, d.fee, d.availability, d.bio, d.rating
      FROM users u
      JOIN doctors d ON u.id = d.user_id
      WHERE u.role = 'doctor'
    `;
    const params = [];

    if (specialization && specialization !== 'All') {
      query += ' AND d.specialization = ?';
      params.push(specialization);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR d.specialization LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY d.rating DESC';

    const doctors = db.prepare(query).all(...params);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single doctor
router.get('/:id', (req, res) => {
  try {
    const doctor = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone,
             d.specialization, d.qualification, d.experience, d.fee, d.availability, d.bio, d.rating
      FROM users u
      JOIN doctors d ON u.id = d.user_id
      WHERE u.id = ?
    `).get(req.params.id);

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update doctor profile
router.put('/profile', authenticateToken, (req, res) => {
  if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Only doctors can update' });

  const { specialization, qualification, experience, fee, availability, bio } = req.body;

  try {
    db.prepare(`
      UPDATE doctors SET specialization=?, qualification=?, experience=?, fee=?, availability=?, bio=?
      WHERE user_id=?
    `).run(specialization, qualification, experience, fee, availability, bio, req.user.id);

    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get specializations list
router.get('/meta/specializations', (req, res) => {
  const specs = db.prepare('SELECT DISTINCT specialization FROM doctors').all();
  res.json(specs.map(s => s.specialization));
});

export default router;
