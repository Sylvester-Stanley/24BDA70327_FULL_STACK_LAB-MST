import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DoctorCard from '../components/DoctorCard';

export default function Home() {
  const [stats, setStats] = useState({ doctors: 6, patients: 1, appointments: 0 });
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    axios.get('/api/stats').then(res => setStats(res.data)).catch(()=>{});
    axios.get('/api/doctors').then(res => setDoctors(res.data.slice(0,3))).catch(()=>{});
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge badge-success" style={{marginBottom:16}}>🤖 NEW: AI Symptom Checker • Works Offline</span>
          <h1>Healthcare Made <span style={{color:'var(--primary)'}}>Smarter</span> with AI</h1>
          <p>AI symptom checker, video consultations with top doctors, live chat, health records, billing — full hospital system that runs on your PC.</p>
          <div style={{display:'flex', gap:12, justifyContent:'center', marginTop:24, flexWrap:'wrap'}}>
            <Link to="/ai-symptom-checker" className="btn btn-primary" style={{padding:'14px 28px', fontSize:16, background:'linear-gradient(135deg, #0e9f6e, #1c64f2)'}}>🤖 Try AI Checker →</Link>
            <Link to="/doctors" className="btn btn-outline" style={{padding:'14px 28px', fontSize:16}}>Find a Doctor</Link>
          </div>

          <div className="stats">
            <div className="stat"><b>{stats.doctors}+</b><span>Expert Doctors</span></div>
            <div className="stat"><b>AI</b><span>Symptom Checker</span></div>
            <div className="stat"><b>24/7</b><span>AI + Support</span></div>
            <div className="stat"><b>4.9★</b><span>Rating</span></div>
          </div>
        </div>
      </section>

      <section className="container" style={{padding:'40px 20px'}}>
        <div className="card" style={{background:'linear-gradient(135deg, #ecfdf5, #dbeafe)', border:'2px solid #0e9f6e', padding:24, display:'flex', gap:20, alignItems:'center', flexWrap:'wrap'}}>
          <div style={{fontSize:50}}>🤖</div>
          <div style={{flex:1}}>
            <h3 style={{fontSize:20}}>AI Health Assistant - Works Offline!</h3>
            <p style={{color:'var(--muted)', fontSize:14, marginTop:4}}>No API key needed. Our AI checks symptoms, suggests specialist, assesses urgency, and guides you to right doctor. 100% private, runs on your PC.</p>
          </div>
          <Link to="/ai-symptom-checker" className="btn btn-primary">Try AI Now</Link>
        </div>
      </section>

      <section className="container" style={{padding:'20px 20px 60px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
          <h2 style={{fontSize:28}}>Top Rated Doctors</h2>
          <Link to="/doctors" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div className="grid grid-3">
          {doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)}
        </div>

        <div className="grid grid-4" style={{marginTop:60}}>
          <div className="card" style={{textAlign:'center', padding:24}}>
            <div style={{fontSize:36, marginBottom:12}}>🤖</div>
            <h3 style={{fontSize:16}}>AI Symptom Check</h3>
            <p style={{color:'var(--muted)', fontSize:13, marginTop:8}}>AI analyzes symptoms, suggests specialist & urgency</p>
          </div>
          <div className="card" style={{textAlign:'center', padding:24}}>
            <div style={{fontSize:36, marginBottom:12}}>🎥</div>
            <h3 style={{fontSize:16}}>Video Consultation</h3>
            <p style={{color:'var(--muted)', fontSize:13, marginTop:8}}>Jitsi video + live chat with doctor</p>
          </div>
          <div className="card" style={{textAlign:'center', padding:24}}>
            <div style={{fontSize:36, marginBottom:12}}>📁</div>
            <h3 style={{fontSize:16}}>Health Records</h3>
            <p style={{color:'var(--muted)', fontSize:13, marginTop:8}}>Prescriptions, lab reports, history</p>
          </div>
          <div className="card" style={{textAlign:'center', padding:24}}>
            <div style={{fontSize:36, marginBottom:12}}>💳</div>
            <h3 style={{fontSize:16}}>Billing & Admin</h3>
            <p style={{color:'var(--muted)', fontSize:13, marginTop:8}}>Invoices, payments, hospital stats</p>
          </div>
        </div>
      </section>

      <section style={{background:'white', borderTop:'1px solid var(--border)', padding:'40px 0', marginTop:20}}>
        <div className="container" style={{textAlign:'center', color:'var(--muted)', fontSize:14}}>
          © 2026 Healthier AI Hospital System v4.0 • Patient: patient@test.com / patient123 • Doctor: sarah.j@healthier.com / doctor123 • Admin: admin@healthier.com / admin123<br/>
          🤖 AI works offline - no API key needed - private & secure
        </div>
      </section>
    </>
  );
}
