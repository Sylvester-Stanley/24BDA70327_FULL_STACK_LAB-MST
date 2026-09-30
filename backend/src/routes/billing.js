import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get invoices
router.get('/', authenticateToken, (req, res) => {
  try {
    let invoices;
    if (req.user.role === 'patient') {
      invoices = db.prepare('SELECT * FROM invoices WHERE patient_id = ? ORDER BY created_at DESC').all(req.user.id);
    } else if (req.user.role === 'doctor') {
      invoices = db.prepare('SELECT * FROM invoices WHERE doctor_id = ? ORDER BY created_at DESC').all(req.user.id);
    } else {
      invoices = db.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all();
    }

    // Enrich with names
    const enriched = invoices.map(inv => {
      const patient = db.prepare('SELECT name FROM users WHERE id=?').get(inv.patient_id);
      const doctor = db.prepare('SELECT name FROM users WHERE id=?').get(inv.doctor_id);
      return { ...inv, patient_name: patient?.name || 'Patient', doctor_name: doctor?.name || 'Doctor' };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create invoice (when appointment booked or completed)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { appointment_id, amount, payment_method } = req.body;
    const appt = db.prepare('SELECT * FROM appointments WHERE id=?').get(Number(appointment_id));
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    // Check if invoice already exists
    const existing = db.prepare('SELECT * FROM invoices WHERE appointment_id=?').get(Number(appointment_id));
    if (existing) return res.json(existing);

    const result = db.prepare(`
      INSERT INTO invoices (appointment_id, patient_id, doctor_id, amount, status, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(appt.id, appt.patient_id, appt.doctor_id, amount || 500, 'pending', payment_method || 'cash');

    res.status(201).json({ id: result.lastInsertRowid, appointment_id: appt.id, amount, status: 'pending' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Pay invoice
router.put('/:id/pay', authenticateToken, (req, res) => {
  try {
    const id = Number(req.params.id);
    const invoice = db.prepare('SELECT * FROM invoices WHERE id=?').get(id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.patient_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    db.prepare('UPDATE invoices SET status=? WHERE id=?').run('paid', id);
    res.json({ message: 'Paid successfully', id, status: 'paid' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
