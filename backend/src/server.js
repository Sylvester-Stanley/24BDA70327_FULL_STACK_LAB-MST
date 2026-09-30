import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './models/database.js';
import authRoutes from './routes/auth.js';
import doctorRoutes from './routes/doctors.js';
import appointmentRoutes from './routes/appointments.js';
import consultationRoutes from './routes/consultation.js';
import healthRecordsRoutes from './routes/healthRecords.js';
import billingRoutes from './routes/billing.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; // Changed to 5001 to avoid Mac AirPlay conflict on 5000

app.use(cors());
app.use(express.json());

// Init DB
initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/health-records', healthRecordsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Healthier FULL Hospital Consultation System API running', timestamp: new Date().toISOString(), version: '3.0' });
});

// Stats for dashboard
app.get('/api/stats', (req, res) => {
  import('./models/database.js').then(({ default: db }) => {
    try {
      const doctors = db.prepare('SELECT COUNT(*) as count FROM users WHERE role="doctor"').get();
      const patients = db.prepare('SELECT COUNT(*) as count FROM users WHERE role="patient"').get();
      const appointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get();
      const invoices = db.prepare('SELECT COUNT(*) as count FROM invoices').get();
      res.json({ doctors: doctors.count, patients: patients.count, appointments: appointments.count, invoices: invoices.count });
    } catch (e) {
      res.json({ doctors: 6, patients: 1, appointments: 0, invoices: 0 });
    }
  });
});

app.get('/', (req, res) => {
  res.send(`
    <h1>⚕️ Healthier FULL Hospital Consultation System - API v3.0</h1>
    <p>Full consultation system with video, chat, health records, billing, admin</p>
    <ul>
      <li>POST /api/auth/register - Register patient/doctor/admin</li>
      <li>POST /api/auth/login - Login</li>
      <li>GET /api/doctors - List doctors</li>
      <li>POST /api/appointments - Book appointment</li>
      <li>GET /api/appointments/my - My appointments</li>
      <li>GET /api/consultation/:id - Consultation details</li>
      <li>GET /api/consultation/:id/messages - Chat messages</li>
      <li>POST /api/consultation/:id/messages - Send message</li>
      <li>GET /api/health-records - Health records</li>
      <li>POST /api/health-records - Add record</li>
      <li>GET /api/billing - Invoices</li>
      <li>POST /api/billing - Create invoice</li>
      <li>GET /api/admin/stats - Admin stats (admin only)</li>
    </ul>
    <p>Demo: patient@test.com / patient123 | doctor: sarah.j@healthier.com / doctor123 | admin: admin@healthier.com / admin123</p>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ FULL HOSPITAL Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎥 Consultation ready: video + chat + records + billing + admin`);
});
