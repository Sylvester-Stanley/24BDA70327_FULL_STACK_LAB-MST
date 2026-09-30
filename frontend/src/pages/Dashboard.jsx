import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [prescriptionModal, setPrescriptionModal] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState('');

  const fetchAppointments = () => {
    axios.get('/api/appointments/my').then(res=>setAppointments(res.data));
  };

  useEffect(()=>{ fetchAppointments(); }, []);

  const updateStatus = async (id, status) => {
    await axios.put(`/api/appointments/${id}/status`, { status, prescription: prescriptionText || undefined });
    // Auto create invoice when confirmed
    if (status === 'confirmed') {
      try {
        const appt = appointments.find(a=>a.id===id);
        await axios.post('/api/billing', { appointment_id: id, amount: appt?.fee || 500 });
      } catch {}
    }
    fetchAppointments();
    setPrescriptionModal(null);
    setPrescriptionText('');
  };

  const filtered = appointments.filter(a => filter==='all' ? true : a.status===filter);

  const getStatusBadge = (s) => {
    if(s==='pending') return 'badge-warning';
    if(s==='confirmed') return 'badge-info';
    if(s==='completed') return 'badge-success';
    return 'badge-danger';
  };

  return (
    <div className="container" style={{padding:'30px 20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12}}>
        <div>
          <h1 style={{fontSize:28}}>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{color:'var(--muted)'}}>{user?.role==='doctor' ? 'Manage your patient consultations' : 'Track your health consultations'} • Full Hospital System v3.0</p>
        </div>
        <div className="tabs">
          {['all','pending','confirmed','completed','cancelled'].map(t=>(
            <button key={t} className={`tab ${filter===t?'active':''}`} onClick={()=>setFilter(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-4" style={{marginBottom:24}}>
        <div className="card"><b style={{fontSize:24}}>{appointments.length}</b><div style={{color:'var(--muted)', fontSize:14}}>Total</div></div>
        <div className="card"><b style={{fontSize:24}}>{appointments.filter(a=>a.status==='pending').length}</b><div style={{color:'var(--muted)', fontSize:14}}>Pending</div></div>
        <div className="card"><b style={{fontSize:24}}>{appointments.filter(a=>a.status==='confirmed').length}</b><div style={{color:'var(--muted)', fontSize:14}}>Confirmed</div></div>
        <div className="card"><b style={{fontSize:24}}>{appointments.filter(a=>a.status==='completed').length}</b><div style={{color:'var(--muted)', fontSize:14}}>Completed</div></div>
      </div>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'16px 20px', borderBottom:'1px solid var(--border)', fontWeight:700, display:'flex', justifyContent:'space-between'}}>
          <span>Consultations ({filtered.length})</span>
          <Link to="/doctors" className="btn btn-primary btn-sm">+ Book New</Link>
        </div>
        {filtered.length===0 ? (
          <div style={{padding:40, textAlign:'center', color:'var(--muted)'}}>
            No {filter!=='all'? filter : ''} consultations found. <br/>
            {user?.role==='patient' && <Link to="/doctors" style={{color:'var(--primary)'}}>Book a doctor now</Link>}
          </div>
        ) : (
          filtered.map(appt=>(
            <div key={appt.id} className="appointment-row" style={{flexWrap:'wrap', gap:12}}>
              <div style={{flex:1, minWidth:250}}>
                <div style={{fontWeight:600}}>
                  {user?.role==='patient' ? `Dr. ${appt.doctor_name}` : appt.patient_name}
                  <span style={{marginLeft:8}} className={`badge ${getStatusBadge(appt.status)}`}>{appt.status}</span>
                  <span style={{marginLeft:6}} className="badge badge-info">{appt.consultation_type}</span>
                </div>
                <div style={{fontSize:13, color:'var(--muted)'}}>
                  📅 {appt.date} at {appt.time} {user?.role==='patient' && `• ${appt.specialization} • ₹${appt.fee}`} {user?.role==='doctor' && `• Age ${appt.patient_age} • ${appt.patient_phone}`}
                </div>
                <div style={{fontSize:13, marginTop:4}}><b>Symptoms:</b> {appt.symptoms || 'N/A'}</div>
                {appt.prescription && <div style={{fontSize:13, marginTop:6, background:'#ecfdf5', padding:8, borderRadius:8, border:'1px solid #a7f3d0'}}><b>💊 Rx:</b> {appt.prescription}</div>}
              </div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
                {/* CONSULTATION ROOM - MAIN FEATURE */}
                {(appt.status==='confirmed' || appt.status==='completed') && (
                  <Link to={`/consultation/${appt.id}`} className="btn btn-sm" style={{background:'#0e9f6e', color:'white'}}>
                    {appt.status==='completed' ? '📋 View Room' : '🎥 Join Consultation'}
                  </Link>
                )}
                {user?.role==='doctor' && appt.status==='pending' && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={()=>updateStatus(appt.id,'confirmed')}>Confirm</button>
                    <button className="btn btn-outline btn-sm" onClick={()=>setPrescriptionModal(appt)}>Complete + Rx</button>
                  </>
                )}
                {user?.role==='doctor' && appt.status==='confirmed' && (
                  <button className="btn btn-outline btn-sm" onClick={()=>setPrescriptionModal(appt)}>Add Rx</button>
                )}
                {appt.status!=='cancelled' && appt.status!=='completed' && (
                  <button className="btn btn-outline btn-sm" onClick={()=>updateStatus(appt.id,'cancelled')} style={{color:'var(--danger)'}}>Cancel</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-3" style={{marginTop:20}}>
        <Link to="/records" className="card" style={{textDecoration:'none', color:'inherit'}}><h3>📁 Health Records</h3><p style={{fontSize:13, color:'var(--muted)', marginTop:6}}>View prescriptions, lab reports, history</p></Link>
        <Link to="/billing" className="card" style={{textDecoration:'none', color:'inherit'}}><h3>💳 Billing</h3><p style={{fontSize:13, color:'var(--muted)', marginTop:6}}>Invoices, payments, receipts</p></Link>
        <Link to="/doctors" className="card" style={{textDecoration:'none', color:'inherit'}}><h3>🔍 Find Doctors</h3><p style={{fontSize:13, color:'var(--muted)', marginTop:6}}>Browse specialists and book</p></Link>
      </div>

      {prescriptionModal && (
        <div className="modal-overlay" onClick={()=>setPrescriptionModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3>Complete Consultation & Prescription</h3>
            <p style={{color:'var(--muted)', fontSize:14, margin:'8px 0 16px'}}>For {prescriptionModal.patient_name} on {prescriptionModal.date}</p>
            <div className="form-group">
              <label className="label">Prescription / Notes</label>
              <textarea className="input" rows="5" value={prescriptionText} onChange={e=>setPrescriptionText(e.target.value)} placeholder="e.g. Tab Paracetamol 500mg twice daily for 3 days, rest, drink water..."></textarea>
            </div>
            <div style={{display:'flex', gap:10, justifyContent:'flex-end'}}>
              <button className="btn btn-outline" onClick={()=>setPrescriptionModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={()=>updateStatus(prescriptionModal.id,'completed')}>Mark Completed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
