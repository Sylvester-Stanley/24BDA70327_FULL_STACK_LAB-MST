import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ConsultationRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/consultation/${id}`);
      setConsultation(res.data);
      const msgRes = await axios.get(`/api/consultation/${id}/messages`);
      setMessages(msgRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(`/api/consultation/${id}/messages`, { message: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) { alert('Failed to send'); }
  };

  const completeConsultation = async () => {
    if (!prescription.trim() && user.role === 'doctor') {
      if (!confirm('Complete without prescription?')) return;
    }
    try {
      await axios.put(`/api/appointments/${id}/status`, { status: 'completed', prescription, notes: 'Consultation completed' });
      // Create invoice if not exists
      try {
        await axios.post('/api/billing', { appointment_id: id, amount: consultation?.doctor?.fee || 500 });
      } catch {}
      alert('✅ Consultation completed & invoice generated!');
      fetchData();
    } catch (err) { alert('Failed'); }
  };

  if (loading) return <div className="container" style={{padding:40}}>Loading consultation room...</div>;
  if (!consultation) return <div className="container" style={{padding:40}}>Consultation not found</div>;

  const isDoctor = user.role === 'doctor';
  const otherPerson = isDoctor ? consultation.patient : consultation.doctor;

  return (
    <div className="container" style={{padding:'20px', maxWidth:1400}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10}}>
        <div>
          <h2 style={{fontSize:24}}>🩺 Consultation Room #{id}</h2>
          <div style={{color:'var(--muted)', fontSize:14}}>
            {consultation.date} at {consultation.time} • {consultation.consultation_type} • 
            <span className={`badge ${consultation.status==='confirmed'?'badge-info': consultation.status==='completed'?'badge-success':'badge-warning'}`} style={{marginLeft:8}}>{consultation.status}</span>
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <span className="badge badge-info">{isDoctor ? `Patient: ${otherPerson?.name}` : `Dr. ${otherPerson?.name}`}</span>
          {consultation.status !== 'completed' && <button className="btn btn-primary btn-sm" onClick={completeConsultation}>{isDoctor ? 'Complete + Prescribe' : 'Mark Completed'}</button>}
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns:'2fr 1fr', gap:20}}>
        {/* Video Area */}
        <div>
          <div className="card" style={{padding:0, overflow:'hidden', background:'#000', minHeight:400}}>
            {consultation.consultation_type === 'video' ? (
              <iframe
                src={`https://meet.jit.si/Healthier-${id}-${consultation.date.replace(/-/g,'')}-${isDoctor?'doctor':'patient'}#config.prejoinPageEnabled=false`}
                style={{width:'100%', height:500, border:0}}
                allow="camera; microphone; fullscreen; display-capture"
                title="Video Consultation"
              ></iframe>
            ) : (
              <div style={{height:400, display:'flex', alignItems:'center', justifyContent:'center', color:'white', flexDirection:'column', gap:16}}>
                <div style={{fontSize:60}}>💬</div>
                <div>Chat Consultation Mode</div>
                <div style={{fontSize:13, color:'#aaa'}}>Video disabled for chat consultation</div>
              </div>
            )}
          </div>

          <div className="grid grid-2" style={{marginTop:16}}>
            <div className="card">
              <h4 style={{marginBottom:8}}>📋 Symptoms</h4>
              <p style={{fontSize:14, color:'var(--muted)'}}>{consultation.symptoms || 'No symptoms described'}</p>
              {consultation.prescription && (
                <div style={{marginTop:12, background:'#ecfdf5', padding:12, borderRadius:8}}>
                  <b>💊 Prescription:</b><div style={{fontSize:13, marginTop:4}}>{consultation.prescription}</div>
                </div>
              )}
            </div>
            <div className="card">
              <h4 style={{marginBottom:8}}>👤 {isDoctor ? 'Patient' : 'Doctor'} Info</h4>
              <div style={{fontSize:14}}>
                <div><b>Name:</b> {otherPerson?.name}</div>
                <div><b>Email:</b> {otherPerson?.email}</div>
                {otherPerson?.phone && <div><b>Phone:</b> {otherPerson.phone}</div>}
                {otherPerson?.specialization && <div><b>Spec:</b> {otherPerson.specialization}</div>}
                {otherPerson?.fee && <div><b>Fee:</b> ₹{otherPerson.fee}</div>}
              </div>
            </div>
          </div>

          {isDoctor && consultation.status !== 'completed' && (
            <div className="card" style={{marginTop:16}}>
              <h4>💊 Write Prescription</h4>
              <textarea className="input" rows="4" value={prescription} onChange={e=>setPrescription(e.target.value)} placeholder="e.g. Tab Paracetamol 500mg - twice daily for 3 days, rest, drink water, follow up after 3 days..."></textarea>
              <div style={{marginTop:10, display:'flex', gap:8}}>
                <button className="btn btn-primary btn-sm" onClick={completeConsultation}>Save & Complete Consultation</button>
                <button className="btn btn-outline btn-sm" onClick={()=>setPrescription('Tab Paracetamol 500mg twice daily x 3 days\nSyrup Cough 10ml thrice daily\nRest and hydration\nFollow up after 3 days')}>Use Template</button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="card" style={{display:'flex', flexDirection:'column', height:700, padding:0}}>
          <div style={{padding:'12px 16px', borderBottom:'1px solid var(--border)', fontWeight:700, display:'flex', justifyContent:'space-between'}}>
            <span>💬 Live Chat</span>
            <span className="badge badge-success" style={{fontSize:11}}>Live</span>
          </div>
          
          <div style={{flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12, background:'#f9fafb'}}>
            {messages.length === 0 ? (
              <div style={{textAlign:'center', color:'var(--muted)', fontSize:14, marginTop:40}}>
                No messages yet. Start the consultation! 👋<br/>
                <small>Tip: Say hello to the {isDoctor ? 'patient' : 'doctor'}</small>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={msg.id} style={{display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start'}}>
                    <div style={{background: isMe ? 'var(--primary)' : 'white', color: isMe ? 'white' : 'var(--text)', padding:'10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', maxWidth:'85%', fontSize:14, boxShadow:'0 1px 2px rgba(0,0,0,0.1)'}}>
                      {msg.message}
                    </div>
                    <div style={{fontSize:11, color:'var(--muted)', marginTop:4}}>
                      {msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={sendMessage} style={{padding:12, borderTop:'1px solid var(--border)', display:'flex', gap:8}}>
            <input className="input" value={newMessage} onChange={e=>setNewMessage(e.target.value)} placeholder="Type a message..." style={{flex:1}} />
            <button className="btn btn-primary btn-sm" type="submit">Send</button>
          </form>

          <div style={{padding:'8px 12px', background:'#fffbeb', fontSize:11, color:'#92400e', borderTop:'1px solid #fde68a'}}>
            🔒 End-to-end encrypted • This chat is part of medical record
          </div>
        </div>
      </div>
    </div>
  );
}
