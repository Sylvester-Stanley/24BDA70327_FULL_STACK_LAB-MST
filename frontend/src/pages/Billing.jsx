import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Billing() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);

  const fetchInvoices = () => {
    axios.get('/api/billing').then(res=>setInvoices(res.data));
  };

  useEffect(()=>{ fetchInvoices(); }, []);

  const payInvoice = async (id) => {
    try {
      await axios.put(`/api/billing/${id}/pay`);
      fetchInvoices();
      alert('✅ Payment successful!');
    } catch { alert('Payment failed'); }
  };

  const totalPaid = invoices.filter(i=>i.status==='paid').reduce((sum,i)=>sum+i.amount,0);
  const totalPending = invoices.filter(i=>i.status==='pending').reduce((sum,i)=>sum+i.amount,0);

  return (
    <div className="container" style={{padding:'30px 20px'}}>
      <h1 style={{fontSize:28, marginBottom:8}}>💳 Billing & Invoices</h1>
      <p style={{color:'var(--muted)', marginBottom:20}}>Manage payments for consultations</p>

      <div className="grid grid-3" style={{marginBottom:20}}>
        <div className="card"><b style={{fontSize:24, color:'var(--primary)'}}>₹{totalPaid}</b><div style={{color:'var(--muted)', fontSize:14}}>Total Paid</div></div>
        <div className="card"><b style={{fontSize:24, color:'#d97706'}}>₹{totalPending}</b><div style={{color:'var(--muted)', fontSize:14}}>Pending</div></div>
        <div className="card"><b style={{fontSize:24}}>{invoices.length}</b><div style={{color:'var(--muted)', fontSize:14}}>Total Invoices</div></div>
      </div>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'16px 20px', borderBottom:'1px solid var(--border)', fontWeight:700}}>Invoices ({invoices.length})</div>
        {invoices.length===0 ? (
          <div style={{padding:40, textAlign:'center', color:'var(--muted)'}}>No invoices yet. Invoices are auto-generated after consultation.</div>
        ) : (
          invoices.map(inv=>(
            <div key={inv.id} className="appointment-row">
              <div>
                <div style={{fontWeight:600}}>Invoice #{inv.id} - ₹{inv.amount} <span className={`badge ${inv.status==='paid'?'badge-success':'badge-warning'}`}>{inv.status}</span></div>
                <div style={{fontSize:13, color:'var(--muted)'}}>
                  {user.role==='patient' ? `Dr. ${inv.doctor_name}` : inv.patient_name} • Appointment #{inv.appointment_id} • {new Date(inv.created_at).toLocaleDateString()} • {inv.payment_method}
                </div>
              </div>
              <div style={{display:'flex', gap:8}}>
                {inv.status==='pending' && user.role==='patient' && (
                  <button className="btn btn-primary btn-sm" onClick={()=>payInvoice(inv.id)}>Pay Now</button>
                )}
                <button className="btn btn-outline btn-sm" onClick={()=>alert(`Invoice #${inv.id}\nAmount: ₹${inv.amount}\nStatus: ${inv.status}\nPatient: ${inv.patient_name}\nDoctor: ${inv.doctor_name}\nDate: ${new Date(inv.created_at).toLocaleString()}`)}>View</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
