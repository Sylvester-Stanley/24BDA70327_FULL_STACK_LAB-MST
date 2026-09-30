# ⚕️ Healthier FULL HOSPITAL Consultation System v3.0

**Complete hospital management with real consultation room, video, chat, health records, billing & admin panel.**

### ✅ What's New in v3.0 FULL HOSPITAL
- **Fixed Mac M1/M2 Node 24 issue** - Pure JS, no native build
- **Port changed to 5001** - Avoids Mac AirPlay conflict on 5000
- **Real Consultation Room** - Jitsi video + live chat + prescription
- **Health Records** - Store lab reports, prescriptions, history
- **Billing System** - Auto invoices, payment tracking
- **Admin Panel** - Full hospital stats, user management, revenue

### 🎥 Full Consultation Flow
1. Patient books appointment (video/chat/in-person)
2. Doctor confirms → Invoice auto-created
3. Both join **Consultation Room** (`/consultation/:id`):
   - **Video**: Jitsi Meet embedded (free, no API key)
   - **Live Chat**: Real-time encrypted chat (stored as medical record)
   - **Prescription**: Doctor writes Rx live
   - **Complete**: Marks completed, invoice ready
4. Patient pays in Billing page
5. Records saved in Health Records

### Tech Stack
- **Frontend:** React 18 + Vite + React Router + Axios
- **Backend:** Node.js + Express + Pure JS JSON DB (or Node built-in SQLite) + JWT
- **Video:** Jitsi Meet iframe (https://meet.jit.si)
- **Database:** JSON file `healthier-data.json` - no compilation needed

### 📁 Structure
```
backend/src/routes/
  auth.js - login/register
  doctors.js - find doctors
  appointments.js - book
  consultation.js - NEW: chat + room details
  healthRecords.js - NEW: medical history
  billing.js - NEW: invoices
  admin.js - NEW: hospital admin

frontend/src/pages/
  Dashboard.jsx - overview + join consultation button
  ConsultationRoom.jsx - NEW: video + chat + prescription (MAIN FEATURE)
  HealthRecords.jsx - NEW: medical files
  Billing.jsx - NEW: invoices & payments
  Admin.jsx - NEW: admin panel
  Doctors.jsx, BookAppointment.jsx, etc.
```

### 🚀 Run on Mac (Sylvester's MacBook Air)

**Backend (Terminal 1):**
```bash
cd backend
npm install   # 87 packages, no gyp errors!
npm run dev
# ✅ Using Node built-in sqlite
# ✅ FULL HOSPITAL Backend running on http://localhost:5001
```

If port 5000 error: This version uses 5001 by default to avoid Mac AirPlay. If still EADDRINUSE:
```bash
lsof -ti:5001 | xargs kill -9
# Or disable AirPlay: System Settings → General → AirDrop & Handoff → AirPlay Receiver OFF
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 🔑 Demo Accounts
- **Patient:** patient@test.com / patient123
- **Doctor:** sarah.j@healthier.com / doctor123
- **Admin:** admin@healthier.com / admin123 (for Admin panel)

### 🧪 Test Full Consultation
1. Login as patient → Doctors → Book Video consultation for tomorrow 10AM
2. Login as doctor (incognito) → Dashboard → Confirm appointment
3. Both click **"🎥 Join Consultation"** → Enters Consultation Room
4. Video: Jitsi room auto-joins (allow camera/mic)
5. Chat: Type messages live
6. Doctor writes prescription → Complete
7. Patient: Billing → Pay invoice → Records → See history

### API Endpoints (New)
- `GET /api/consultation/:id` - Room details
- `GET /api/consultation/:id/messages` - Chat history
- `POST /api/consultation/:id/messages` - Send message
- `GET /api/health-records` - My records
- `POST /api/health-records` - Add record
- `GET /api/billing` - My invoices
- `POST /api/billing` - Create invoice
- `PUT /api/billing/:id/pay` - Pay
- `GET /api/admin/stats` - Hospital stats (admin only)

### Why Port 5001?
Mac uses 5000 for AirPlay Receiver. v3.0 uses 5001 by default. Frontend proxy updated to 5001.

### Production Notes
- Video: Replace Jitsi with Agora/Twilio for HIPAA
- Payment: Add Razorpay/Stripe in billing.js
- Storage: JSON file is for local dev; use Postgres for production

---
Built for full hospital consultation - video + chat + records + billing + admin 💚
