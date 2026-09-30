import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get my health records (patient) or patient records (doctor)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { patient_id } = req.query;
    let records;
    if (req.user.role === 'patient') {
      records = db.prepare('SELECT * FROM health_records WHERE patient_id = ? ORDER BY created_at DESC').all(req.user.id);
    } else if (req.user.role === 'doctor' && patient_id) {
      records = db.prepare('SELECT * FROM health_records WHERE patient_id = ? ORDER BY created_at DESC').all(Number(patient_id));
    } else if (req.user.role === 'admin') {
      records = db.prepare('SELECT * FROM health_records ORDER BY created_at DESC').all();
    } else {
      records = db.prepare('SELECT * FROM health_records WHERE patient_id = ? ORDER BY created_at DESC').all(req.user.id);
    }
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add health record
router.post('/', authenticateToken, (req, res) => {
  try {
    const { patient_id, title, description, record_date } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    const pid = req.user.role === 'patient' ? req.user.id : Number(patient_id) || req.user.id;
    const did = req.user.role === 'doctor' ? req.user.id : null;

    const result = db.prepare(`
      INSERT INTO health_records (patient_id, doctor_id, title, description, record_date)
      VALUES (?, ?, ?, ?, ?)
    `).run(pid, did, title, description || '', record_date || new Date().toISOString().split('T')[0]);

    res.status(201).json({ id: result.lastInsertRowid, patient_id: pid, doctor_id: did, title, description, record_date });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
