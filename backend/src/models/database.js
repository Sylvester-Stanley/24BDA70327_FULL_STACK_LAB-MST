/**
 * Healthier DB v3 - Full Hospital Consultation System
 * Pure JS with Node built-in sqlite fallback to JSON
 * No native deps - works on Mac M1/M2, Windows, Linux
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../healthier.db');
const jsonPath = path.join(__dirname, '../../healthier-data.json');

let db = null;
let useNodeSqlite = false;

try {
  const { DatabaseSync } = await import('node:sqlite');
  db = new DatabaseSync(dbPath);
  useNodeSqlite = true;
  console.log('✅ Using Node built-in sqlite (full hospital mode)');
} catch {
  console.log('⚠️ Using JSON file mode (full hospital)');
}

// JSON storage
let jsonData = {
  users: [], doctors: [], appointments: [], health_records: [],
  consultation_messages: [], invoices: [], prescriptions: [],
  _counters: { users: 1, doctors: 1, appointments: 1, health_records: 1, consultation_messages: 1, invoices: 1, prescriptions: 1 }
};

function loadJson() {
  if (fs.existsSync(jsonPath)) {
    try { jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); } catch {}
  }
  // ensure new tables exist
  if (!jsonData.consultation_messages) jsonData.consultation_messages = [];
  if (!jsonData.invoices) jsonData.invoices = [];
  if (!jsonData.prescriptions) jsonData.prescriptions = [];
  if (!jsonData._counters.consultation_messages) jsonData._counters.consultation_messages = 1;
  if (!jsonData._counters.invoices) jsonData._counters.invoices = 1;
  if (!jsonData._counters.prescriptions) jsonData._counters.prescriptions = 1;
}
function saveJson() { fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2)); }

if (!useNodeSqlite) loadJson();

class StatementWrapper {
  constructor(sql) { this.sql = sql; if (useNodeSqlite) this.stmt = db.prepare(sql); }
  run(...params) {
    if (useNodeSqlite) {
      const r = this.stmt.run(...params);
      return { lastInsertRowid: r.lastInsertRowid, changes: r.changes };
    }
    return this.runJson(...params);
  }
  get(...params) {
    if (useNodeSqlite) return this.stmt.get(...params) || undefined;
    return this.getJson(...params);
  }
  all(...params) {
    if (useNodeSqlite) return this.stmt.all(...params);
    return this.allJson(...params);
  }

  // --- JSON MODE ---
  runJson(...params) {
    const s = this.sql.trim().toUpperCase();
    const sqlLower = this.sql.toLowerCase();

    // USERS
    if (s.startsWith('INSERT INTO USERS')) {
      const [name, email, password, role, phone, age, gender] = params;
      const id = jsonData._counters.users++;
      jsonData.users.push({ id, name, email, password, role, phone, age, gender, created_at: new Date().toISOString() });
      saveJson(); return { lastInsertRowid: id, changes: 1 };
    }
    if (s.startsWith('INSERT INTO DOCTORS')) {
      const [user_id, specialization, qualification, experience, fee, availability, bio, rating] = params;
      const id = jsonData._counters.doctors++;
      jsonData.doctors.push({ id, user_id, specialization: specialization||'General Physician', qualification: qualification||'MBBS', experience: experience||1, fee: fee||500, availability: availability||'Mon-Fri', bio: bio||'', rating: rating||4.5, is_verified:1 });
      saveJson(); return { lastInsertRowid: id, changes: 1 };
    }
    if (s.startsWith('INSERT INTO APPOINTMENTS')) {
      const [patient_id, doctor_id, date, time, symptoms, consultation_type] = params;
      const id = jsonData._counters.appointments++;
      jsonData.appointments.push({ id, patient_id, doctor_id, date, time, symptoms: symptoms||'', notes:'', prescription:'', consultation_type: consultation_type||'video', status:'pending', created_at: new Date().toISOString() });
      saveJson(); return { lastInsertRowid: id, changes: 1 };
    }
    if (s.startsWith('INSERT INTO CONSULTATION_MESSAGES')) {
      const [appointment_id, sender_id, message] = params;
      const id = jsonData._counters.consultation_messages++;
      jsonData.consultation_messages.push({ id, appointment_id, sender_id, message, created_at: new Date().toISOString() });
      saveJson(); return { lastInsertRowid: id, changes: 1 };
    }
    if (s.startsWith('INSERT INTO HEALTH_RECORDS')) {
      const [patient_id, doctor_id, title, description, record_date] = params;
      const id = jsonData._counters.health_records++;
      jsonData.health_records.push({ id, patient_id, doctor_id, title, description, record_date: record_date||new Date().toISOString().split('T')[0], created_at: new Date().toISOString() });
      saveJson(); return { lastInsertRowid: id, changes: 1 };
    }
    if (s.startsWith('INSERT INTO INVOICES')) {
      const [appointment_id, patient_id, doctor_id, amount, status, payment_method] = params;
      const id = jsonData._counters.invoices++;
      jsonData.invoices.push({ id, appointment_id, patient_id, doctor_id, amount, status: status||'pending', payment_method: payment_method||'cash', created_at: new Date().toISOString() });
      saveJson(); return { lastInsertRowid: id, changes: 1 };
    }
    if (s.startsWith('INSERT INTO PRESCRIPTIONS')) {
      const [appointment_id, medicines, instructions, doctor_id] = params;
      const id = jsonData._counters.prescriptions++;
      jsonData.prescriptions.push({ id, appointment_id, medicines, instructions, doctor_id, created_at: new Date().toISOString() });
      saveJson(); return { lastInsertRowid: id, changes: 1 };
    }

    // UPDATES
    if (sqlLower.includes('update doctors set')) {
      const [specialization, qualification, experience, fee, availability, bio, user_id] = params;
      const doc = jsonData.doctors.find(d => d.user_id == user_id);
      if (doc) { if(specialization) doc.specialization=specialization; if(qualification) doc.qualification=qualification; if(experience) doc.experience=experience; if(fee) doc.fee=fee; if(availability) doc.availability=availability; if(bio) doc.bio=bio; saveJson(); }
      return { changes:1 };
    }
    if (sqlLower.includes('update appointments set') && sqlLower.includes('coalesce')) {
      const [status, prescription, notes, id] = params;
      const appt = jsonData.appointments.find(a => a.id == id);
      if (appt) { if(status) appt.status=status; if(prescription) appt.prescription=prescription; if(notes) appt.notes=notes; saveJson(); }
      return { changes:1 };
    }
    if (s.startsWith('UPDATE APPOINTMENTS SET STATUS=? WHERE ID=?')) {
      const [status, id] = params;
      const appt = jsonData.appointments.find(a => a.id == id);
      if (appt) { appt.status=status; saveJson(); }
      return { changes:1 };
    }
    if (s.includes('SET STATUS="CANCELLED"') || s.includes("SET STATUS='CANCELLED'") || s.includes('STATUS="CANCELLED"')) {
      const id = params[0];
      const appt = jsonData.appointments.find(a => a.id == id);
      if (appt) { appt.status='cancelled'; saveJson(); }
      return { changes:1 };
    }
    if (sqlLower.includes('update invoices set status')) {
      const [status, id] = params;
      const inv = jsonData.invoices.find(i => i.id == id);
      if (inv) { inv.status=status; saveJson(); }
      return { changes:1 };
    }
    return { lastInsertRowid:0, changes:0 };
  }

  getJson(...params) {
    const sql = this.sql.toLowerCase();
    if (sql.includes('count(*) as count from users where role="doctor"') || sql.includes("count(*) as count from users where role='doctor'") || (sql.includes('count(*)') && sql.includes('users') && sql.includes('doctor'))) {
      return { count: jsonData.users.filter(u=>u.role==='doctor').length };
    }
    if (sql.includes('count(*) as count from users where role="patient"') || (sql.includes('count(*)') && sql.includes('patient'))) {
      return { count: jsonData.users.filter(u=>u.role==='patient').length };
    }
    if (sql.includes('count(*) as count from users') && !sql.includes('where')) return { count: jsonData.users.length };
    if (sql.includes('count(*) as count from appointments')) return { count: jsonData.appointments.length };
    if (sql.includes('count(*) as count from invoices')) return { count: jsonData.invoices.length };
    if (sql.includes('from users where email = ?')) return jsonData.users.find(u=>u.email===params[0]);
    if (sql.includes('from users where id = ?') && sql.includes('role="doctor"') || sql.includes("role='doctor'")) {
      return jsonData.users.find(u=>u.id==params[0] && u.role==='doctor') ? {id:params[0]} : undefined;
    }
    if (sql.includes('from users where id = ?') || sql.includes('from users where id=?')) {
      if (sql.includes('doctor')) {
        const u = jsonData.users.find(u=>u.id==params[0] && u.role==='doctor');
        return u ? {id:u.id} : undefined;
      }
      return jsonData.users.find(u=>u.id==params[0]);
    }
    if (sql.includes('select id from users where email')) {
      const u = jsonData.users.find(u=>u.email===params[0]); return u?{id:u.id}:undefined;
    }
    if (sql.includes('from doctors where user_id = ?')) return jsonData.doctors.find(d=>d.user_id==params[0]);
    if (sql.includes('from appointments where id=?') || sql.includes('from appointments where id = ?')) return jsonData.appointments.find(a=>a.id==params[0]);
    if (sql.includes('from appointments') && sql.includes('doctor_id=? and date=? and time=?')) {
      return jsonData.appointments.find(a=>a.doctor_id==params[0] && a.date===params[1] && a.time===params[2] && a.status!=='cancelled');
    }
    if (sql.includes('from users u') && sql.includes('join doctors d') && sql.includes('where u.id = ?')) {
      const user = jsonData.users.find(u=>u.id==params[0]);
      if (!user) return undefined;
      const doc = jsonData.doctors.find(d=>d.user_id==user.id);
      if (!doc) return undefined;
      return { id:user.id, name:user.name, email:user.email, phone:user.phone, specialization:doc.specialization, qualification:doc.qualification, experience:doc.experience, fee:doc.fee, availability:doc.availability, bio:doc.bio, rating:doc.rating };
    }
    if (sql.includes('select id, name, email, role, phone, age, gender, created_at from users where id = ?')) {
      const u=jsonData.users.find(u=>u.id==params[0]); if(!u) return undefined; const {id,name,email,role,phone,age,gender,created_at}=u; return {id,name,email,role,phone,age,gender,created_at};
    }
    if (sql.includes('select id, name, email, role from users where id = ?')) {
      const u=jsonData.users.find(u=>u.id==params[0]); if(!u) return undefined; return {id:u.id,name:u.name,email:u.email,role:u.role};
    }
    if (sql.includes('from invoices where appointment_id = ?')) return jsonData.invoices.find(i=>i.appointment_id==params[0]);
    if (sql.includes('from invoices where id = ?')) return jsonData.invoices.find(i=>i.id==params[0]);
    return undefined;
  }

  allJson(...params) {
    const sql = this.sql.toLowerCase();
    if (sql.includes('from users u') && sql.includes('join doctors d')) {
      let doctors = jsonData.users.filter(u=>u.role==='doctor').map(u=>{
        const d=jsonData.doctors.find(doc=>doc.user_id==u.id); if(!d) return null;
        return { id:u.id, name:u.name, email:u.email, phone:u.phone, doctor_id:d.id, specialization:d.specialization, qualification:d.qualification, experience:d.experience, fee:d.fee, availability:d.availability, bio:d.bio, rating:d.rating };
      }).filter(Boolean);
      if (sql.includes('and d.specialization = ?')) { const spec=params[0]; doctors=doctors.filter(d=>d.specialization===spec); }
      if (sql.includes('and (u.name like ? or d.specialization like ?)')) {
        const term=params[params.length-1].replace(/%/g,'').toLowerCase();
        doctors=doctors.filter(d=>d.name.toLowerCase().includes(term)||d.specialization.toLowerCase().includes(term));
      }
      doctors.sort((a,b)=>b.rating-a.rating);
      return doctors;
    }
    if (sql.includes('select distinct specialization from doctors')) {
      const specs=[...new Set(jsonData.doctors.map(d=>d.specialization))];
      return specs.map(s=>({specialization:s}));
    }
    if (sql.includes('from appointments a') && sql.includes('join users u on a.doctor_id = u.id') && sql.includes('join doctors d')) {
      const pid=params[0];
      return jsonData.appointments.filter(a=>a.patient_id==pid).map(a=>{
        const du=jsonData.users.find(u=>u.id==a.doctor_id); const d=jsonData.doctors.find(doc=>doc.user_id==a.doctor_id);
        return {...a, doctor_name:du?.name||'Unknown', specialization:d?.specialization||'', fee:d?.fee||0};
      }).sort((a,b)=>new Date(b.date)-new Date(a.date));
    }
    if (sql.includes('from appointments a') && sql.includes('join users u on a.patient_id = u.id') && sql.includes('where a.doctor_id = ?')) {
      const did=params[0];
      return jsonData.appointments.filter(a=>a.doctor_id==did).map(a=>{
        const p=jsonData.users.find(u=>u.id==a.patient_id);
        return {...a, patient_name:p?.name||'Unknown', patient_phone:p?.phone||'', patient_age:p?.age||''};
      }).sort((a,b)=>new Date(b.date)-new Date(a.date));
    }
    if (sql.includes('select * from appointments order by date desc')) return [...jsonData.appointments].sort((a,b)=>new Date(b.date)-new Date(a.date));
    if (sql.includes('from consultation_messages where appointment_id = ?')) {
      return jsonData.consultation_messages.filter(m=>m.appointment_id==params[0]).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
    }
    if (sql.includes('from health_records where patient_id = ?')) {
      return jsonData.health_records.filter(r=>r.patient_id==params[0]).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    }
    if (sql.includes('from invoices where patient_id = ?')) {
      return jsonData.invoices.filter(i=>i.patient_id==params[0]).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    }
    if (sql.includes('from invoices where doctor_id = ?')) {
      return jsonData.invoices.filter(i=>i.doctor_id==params[0]).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    }
    if (sql.includes('from invoices') && sql.includes('order by')) {
      return [...jsonData.invoices].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    }
    if (sql.includes('from health_records') && sql.includes('order by')) {
      return [...jsonData.health_records].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    }
    if (sql.includes('from users where role = ?') || sql.includes('from users where role=?')) {
      return jsonData.users.filter(u=>u.role===params[0]);
    }
    if (sql.includes('from users') && sql.includes('order by')) {
      return [...jsonData.users].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    }
    if (sql.includes('from prescriptions where appointment_id = ?')) {
      return jsonData.prescriptions.filter(p=>p.appointment_id==params[0]);
    }
    return [];
  }
}

const dbWrapper = {
  prepare: (sql) => new StatementWrapper(sql),
  exec: (sql) => { if (useNodeSqlite) db.exec(sql); },
  pragma: () => {}
};

export function initDatabase() {
  console.log('Initializing FULL HOSPITAL database...');

  if (useNodeSqlite) {
    dbWrapper.exec(`
      CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('patient','doctor','admin')), phone TEXT, age INTEGER, gender TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS doctors (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE NOT NULL, specialization TEXT NOT NULL, qualification TEXT, experience INTEGER, fee INTEGER DEFAULT 500, availability TEXT DEFAULT 'Mon-Fri 9AM-5PM', bio TEXT, rating REAL DEFAULT 4.5, is_verified INTEGER DEFAULT 1, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
      CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER NOT NULL, doctor_id INTEGER NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled')), symptoms TEXT, notes TEXT, prescription TEXT, consultation_type TEXT DEFAULT 'video' CHECK(consultation_type IN ('video','chat','in-person')), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(patient_id) REFERENCES users(id), FOREIGN KEY(doctor_id) REFERENCES users(id));
      CREATE TABLE IF NOT EXISTS health_records (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER NOT NULL, doctor_id INTEGER, title TEXT NOT NULL, description TEXT, record_date TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(patient_id) REFERENCES users(id), FOREIGN KEY(doctor_id) REFERENCES users(id));
      CREATE TABLE IF NOT EXISTS consultation_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, appointment_id INTEGER NOT NULL, sender_id INTEGER NOT NULL, message TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(appointment_id) REFERENCES appointments(id), FOREIGN KEY(sender_id) REFERENCES users(id));
      CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, appointment_id INTEGER NOT NULL, patient_id INTEGER NOT NULL, doctor_id INTEGER NOT NULL, amount INTEGER NOT NULL, status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid','cancelled')), payment_method TEXT DEFAULT 'cash', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(appointment_id) REFERENCES appointments(id));
      CREATE TABLE IF NOT EXISTS prescriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, appointment_id INTEGER NOT NULL, doctor_id INTEGER NOT NULL, medicines TEXT NOT NULL, instructions TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(appointment_id) REFERENCES appointments(id));
    `);
    const count = dbWrapper.prepare('SELECT COUNT(*) as count FROM users').get();
    if (count.count === 0) seedData();
  } else {
    loadJson();
    if (jsonData.users.length === 0) seedData();
  }
  console.log(`Database ready: ${useNodeSqlite?dbPath:jsonPath} Mode: ${useNodeSqlite?'SQLite':'JSON'}`);
}

function seedData() {
  const insertUser = dbWrapper.prepare(`INSERT INTO users (name, email, password, role, phone, age, gender) VALUES (?,?,?,?,?,?,?)`);
  const insertDoctor = dbWrapper.prepare(`INSERT INTO doctors (user_id, specialization, qualification, experience, fee, availability, bio, rating) VALUES (?,?,?,?,?,?,?,?)`);
  const hashed = bcrypt.hashSync('doctor123',10);
  const doctors = [
    {name:'Dr. Sarah Johnson',email:'sarah.j@healthier.com',spec:'Cardiologist',qual:'MBBS, MD Cardiology',exp:12,fee:800,avail:'Mon-Sat 10AM-4PM',bio:'Expert in heart diseases with 12 years at AIIMS.',rating:4.9},
    {name:'Dr. Rajesh Kumar',email:'rajesh.k@healthier.com',spec:'Dermatologist',qual:'MBBS, MD Dermatology',exp:8,fee:600,avail:'Mon-Fri 9AM-6PM',bio:'Skin disorders and cosmetic dermatology.',rating:4.7},
    {name:'Dr. Emily Chen',email:'emily.c@healthier.com',spec:'Pediatrician',qual:'MBBS, MD Pediatrics',exp:10,fee:500,avail:'Tue-Sun 11AM-5PM',bio:'Child wellness and growth specialist.',rating:4.8},
    {name:'Dr. Arjun Mehta',email:'arjun.m@healthier.com',spec:'Orthopedic',qual:'MS Orthopedics',exp:15,fee:900,avail:'Mon-Sat 9AM-3PM',bio:'Joint replacements expert.',rating:4.9},
    {name:'Dr. Priya Sharma',email:'priya.s@healthier.com',spec:'Gynecologist',qual:'MBBS, MS Gynecology',exp:9,fee:700,avail:'Mon-Fri 10AM-5PM',bio:'Women health holistic care.',rating:4.6},
    {name:'Dr. Vikram Singh',email:'vikram.s@healthier.com',spec:'General Physician',qual:'MBBS, MD Medicine',exp:7,fee:400,avail:'Daily 9AM-8PM',bio:'Family doctor for all concerns.',rating:4.8},
  ];
  for (const doc of doctors) {
    const r = insertUser.run(doc.name,doc.email,hashed,'doctor','9876543210',35,'Other');
    insertDoctor.run(r.lastInsertRowid,doc.spec,doc.qual,doc.exp,doc.fee,doc.avail,doc.bio,doc.rating);
  }
  const patientPass = bcrypt.hashSync('patient123',10);
  insertUser.run('Test Patient','patient@test.com',patientPass,'patient','9876543210',28,'Male');
  insertUser.run('Admin','admin@healthier.com',bcrypt.hashSync('admin123',10),'admin','9999999999',35,'Male');
  console.log('Seeded 6 doctors + 1 patient + 1 admin (admin@healthier.com / admin123)');
}

export default dbWrapper;
