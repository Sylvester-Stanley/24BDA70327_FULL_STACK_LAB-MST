import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get messages for an appointment (consultation chat)
router.get('/:appointmentId/messages', authenticateToken, (req, res) => {
  try {
    const appointmentId = Number(req.params.appointmentId);
    const appt = db.prepare('SELECT * FROM appointments WHERE id=?').get(appointmentId);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    if (appt.patient_id !== req.user.id && appt.doctor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const messages = db.prepare(`
      SELECT cm.*, u.name as sender_name, u.role as sender_role
      FROM consultation_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.appointment_id = ?
      ORDER BY cm.created_at ASC
    `).all(appointmentId);

    // Fallback for JSON mode without JOIN
    let result = messages;
    if (messages.length === 0 || !messages[0]?.sender_name) {
      const raw = db.prepare('SELECT * FROM consultation_messages WHERE appointment_id = ? ORDER BY created_at ASC').all(appointmentId);
      // Enrich with user names from JSON fallback manually if needed
      result = raw.map(m => {
        const user = db.prepare('SELECT * FROM users WHERE id=?').get(m.sender_id);
        return { ...m, sender_name: user?.name || 'Unknown', sender_role: user?.role || 'patient' };
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Send message in consultation
router.post('/:appointmentId/messages', authenticateToken, (req, res) => {
  try {
    const appointmentId = Number(req.params.appointmentId);
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message required' });

    const appt = db.prepare('SELECT * FROM appointments WHERE id=?').get(appointmentId);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    if (appt.patient_id !== req.user.id && appt.doctor_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const result = db.prepare(`
      INSERT INTO consultation_messages (appointment_id, sender_id, message)
      VALUES (?, ?, ?)
    `).run(appointmentId, req.user.id, message.trim());

    const newMsg = {
      id: result.lastInsertRowid,
      appointment_id: appointmentId,
      sender_id: req.user.id,
      message: message.trim(),
      sender_name: req.user.name,
      sender_role: req.user.role,
      created_at: new Date().toISOString()
    };

    res.status(201).json(newMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get consultation details with patient/doctor info
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const id = Number(req.params.id);
    const appt = db.prepare('SELECT * FROM appointments WHERE id=?').get(id);
    if (!appt) return res.status(404).json({ message: 'Not found' });
    if (appt.patient_id !== req.user.id && appt.doctor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const patient = db.prepare('SELECT id, name, email, phone, age, gender FROM users WHERE id=?').get(appt.patient_id);
    const doctorUser = db.prepare('SELECT id, name, email, phone FROM users WHERE id=?').get(appt.doctor_id);
    const doctor = db.prepare('SELECT * FROM doctors WHERE user_id=?').get(appt.doctor_id);
    const invoice = db.prepare('SELECT * FROM invoices WHERE appointment_id=?').get(id);
    const prescriptions = db.prepare('SELECT * FROM prescriptions WHERE appointment_id=?').all(id);

    res.json({ ...appt, patient, doctor: { ...doctorUser, ...doctor }, invoice, prescriptions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
