import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({ date:'', time:'', symptoms:'', consultation_type:'video' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/doctors/${doctorId}`).then(res=>setDoctor(res.data));
    // default tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate()+1);
    setForm(f=>({...f, date: tomorrow.toISOString().split('T')[0], time:'10:00'}));
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post('/api/appointments', { doctor_id: doctorId, ...form });
      setMessage('✅ Appointment booked successfully!');
      setTimeout(()=>navigate('/dashboard'), 1500);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Booking failed'));
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return <div className="container" style={{padding:40}}>Loading doctor...</div>;

  return (
    <div className="container" style={{padding:'40px 20px'}}>
      <div className="grid grid-2" style={{maxWidth:900, margin:'0 auto'}}>
        <div className="card">
          <h3 style={{marginBottom:16}}>Doctor Details</h3>
          <div style={{display:'flex', gap:16, marginBottom:16}}>
            <div className="doctor-avatar" style={{width:60,height:60}}>{doctor.name.charAt(0)}</div>
            <div>
              <h3>{doctor.name}</h3>
              <span className="badge badge-info">{doctor.specialization}</span>
              <div style={{color:'var(--muted)', fontSize:13, marginTop:4}}>{doctor.qualification} • {doctor.experience} yrs • ⭐ {doctor.rating}</div>
            </div>
          </div>
          <p style={{fontSize:14, color:'var(--muted)', marginBottom:12}}>{doctor.bio}</p>
          <div style={{background:'#f9fafb', padding:12, borderRadius:10, fontSize:14}}>
            <div>💰 Fee: <b style={{color:'var(--primary)'}}>₹{doctor.fee}</b></div>
            <div>🕒 {doctor.availability}</div>
            <div>📞 {doctor.phone}</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{marginBottom:16}}>Book Appointment</h3>
          {message && <div className={`alert ${message.includes('✅')?'alert-success':'alert-error'}`}>{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="label">Time</label>
                <select className="input" value={form.time} onChange={e=>setForm({...form, time:e.target.value})}>
                  <option>09:00</option><option>10:00</option><option>11:00</option><option>12:00</option><option>14:00</option><option>15:00</option><option>16:00</option><option>17:00</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Consultation Type</label>
              <div className="tabs" style={{width:'100%'}}>
                {['video','chat','in-person'].map(t=>(
                  <button key={t} type="button" className={`tab ${form.consultation_type===t?'active':''}`} style={{flex:1}} onClick={()=>setForm({...form, consultation_type:t})}>
                    {t==='video'?'🎥 Video':t==='chat'?'💬 Chat':'🏥 In-Person'}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="label">Symptoms / Reason</label>
              <textarea className="input" rows="4" value={form.symptoms} onChange={e=>setForm({...form, symptoms:e.target.value})} placeholder="Describe your symptoms..." required></textarea>
            </div>
            <button className="btn btn-primary" style={{width:'100%', padding:14, justifyContent:'center'}} disabled={loading}>
              {loading ? 'Booking...' : `Confirm Booking - ₹${doctor.fee}`}
            </button>
            <p style={{fontSize:12, color:'var(--muted)', textAlign:'center', marginTop:10}}>Secure payment • Cancel anytime 2hrs before</p>
          </form>
        </div>
      </div>
    </div>
  );
}
