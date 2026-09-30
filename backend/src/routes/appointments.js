import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Book appointment
router.post('/', authenticateToken, (req, res) => {
  try {
    const { doctor_id, date, time, symptoms, consultation_type } = req.body;
    const patient_id = req.user.id;

    if (!doctor_id || !date || !time) {
      return res.status(400).json({ message: 'doctor_id, date, time required' });
    }

    // Check doctor exists - simple query that works in both modes
    const doctor = db.prepare('SELECT id FROM users WHERE id=? AND role="doctor"').get(Number(doctor_id));
    if (!doctor) {
      // fallback check for JSON mode
      const doctor2 = db.prepare('SELECT * FROM users WHERE id=?').get(Number(doctor_id));
      if (!doctor2 || doctor2.role !== 'doctor') {
        return res.status(404).json({ message: 'Doctor not found' });
      }
    }

    // Check slot not already booked
    const existing = db.prepare(`
      SELECT id FROM appointments 
      WHERE doctor_id=? AND date=? AND time=? AND status != 'cancelled'
    `).get(Number(doctor_id), date, time);

    if (existing) {
      return res.status(400).json({ message: 'Slot already booked' });
    }

    const result = db.prepare(`
      INSERT INTO appointments (patient_id, doctor_id, date, time, symptoms, consultation_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(patient_id, Number(doctor_id), date, time, symptoms || '', consultation_type || 'video');

    const appointment = db.prepare('SELECT * FROM appointments WHERE id=?').get(result.lastInsertRowid);
    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get my appointments (patient or doctor)
router.get('/my', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query;
    if (role === 'patient') {
      query = `
        SELECT a.*, u.name as doctor_name, d.specialization, d.fee
        FROM appointments a
        JOIN users u ON a.doctor_id = u.id
        JOIN doctors d ON u.id = d.user_id
        WHERE a.patient_id = ?
        ORDER BY a.date DESC, a.time DESC
      `;
    } else if (role === 'doctor') {
      query = `
        SELECT a.*, u.name as patient_name, u.phone as patient_phone, u.age as patient_age
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        WHERE a.doctor_id = ?
        ORDER BY a.date DESC, a.time DESC
      `;
    } else {
      query = `SELECT * FROM appointments ORDER BY date DESC`;
    }

    const appointments = db.prepare(query).all(role === 'admin' ? [] : [userId]);
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Update status
router.put('/:id/status', authenticateToken, (req, res) => {
  try {
    const { status, prescription, notes } = req.body;
    const appointmentId = Number(req.params.id);

    const appt = db.prepare('SELECT * FROM appointments WHERE id=?').get(appointmentId);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    // Only involved doctor/patient can update
    if (req.user.role !== 'admin' && appt.patient_id !== req.user.id && appt.doctor_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Simplified update for compatibility
    db.prepare(`
      UPDATE appointments SET status=?, prescription=COALESCE(?, prescription), notes=COALESCE(?, notes)
      WHERE id=?
    `).run(status || appt.status, prescription || null, notes || null, appointmentId);

    res.json({ message: 'Updated', id: appointmentId, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Cancel - fixed to use param
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const id = Number(req.params.id);
    const appt = db.prepare('SELECT * FROM appointments WHERE id=?').get(id);
    if (!appt) return res.status(404).json({ message: 'Not found' });
    if (appt.patient_id !== req.user.id && appt.doctor_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Use parameterized update for JSON compatibility
    db.prepare('UPDATE appointments SET status=? WHERE id=?').run('cancelled', id);
    // Fallback for old query style
    try {
      db.prepare('UPDATE appointments SET status="cancelled" WHERE id=?').run(id);
    } catch {}
    res.json({ message: 'Cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
