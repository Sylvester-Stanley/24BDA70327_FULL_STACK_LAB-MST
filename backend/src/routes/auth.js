import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../models/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, age, gender, specialization, qualification, experience } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, password required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, phone, age, gender)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, hashedPassword, role || 'patient', phone || null, age || null, gender || null);

    const userId = result.lastInsertRowid;

    // If doctor, create doctor profile
    if ((role || 'patient') === 'doctor') {
      db.prepare(`
        INSERT INTO doctors (user_id, specialization, qualification, experience, fee)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, specialization || 'General Physician', qualification || 'MBBS', experience || 1, 500);
    }

    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId);
    const token = generateToken(user);

    res.status(201).json({ message: 'Registered successfully', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userData = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = generateToken(userData);

    // If doctor, get extra info
    let doctorInfo = null;
    if (user.role === 'doctor') {
      doctorInfo = db.prepare('SELECT * FROM doctors WHERE user_id = ?').get(user.id);
    }

    res.json({ message: 'Login successful', token, user: { ...userData, doctorInfo } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, phone, age, gender, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  let extra = null;
  if (user.role === 'doctor') {
    extra = db.prepare('SELECT * FROM doctors WHERE user_id = ?').get(user.id);
  }

  res.json({ ...user, doctorInfo: extra });
});

export default router;
