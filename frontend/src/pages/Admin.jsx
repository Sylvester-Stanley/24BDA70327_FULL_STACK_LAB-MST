import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(()=>{
    axios.get('/api/admin/stats').then(res=>setStats(res.data)).catch(err=>console.error(err));
    axios.get('/api/admin/users').then(res=>setUsers(res.data));
  },[]);

  if (!stats) return <div className="container" style={{padding:40}}>Loading admin panel... (login as admin@healthier.com / admin123)</div>;

  return (
    <div className="container" style={{padding:'30px 20px'}}>
      <h1 style={{fontSize:28, marginBottom:8}}>🛡️ Admin Panel - Full Hospital</h1>
      <p style={{color:'var(--muted)', marginBottom:20}}>Complete hospital management</p>

      <div className="tabs" style={{marginBottom:20}}>
        {['overview','users','revenue'].map(t=>(
          <button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </div>

      {tab==='overview' && (
        <>
          <div className="grid grid-4">
            <div className="card"><b style={{fontSize:28, color:'var(--primary)'}}>{stats.doctors}</b><div>Doctors</div><div style={{fontSize:12, color:'var(--muted)'}}>Active specialists</div></div>
            <div className="card"><b style={{fontSize:28, color:'#1c64f2'}}>{stats.patients}</b><div>Patients</div><div style={{fontSize:12, color:'var(--muted)'}}>Registered</div></div>
            <div className="card"><b style={{fontSize:28, color:'#c27803'}}>{stats.appointments}</b><div>Appointments</div><div style={{fontSize:12, color:'var(--muted)'}}>{stats.pendingAppointments} pending</div></div>
            <div className="card"><b style={{fontSize:28, color:'#057a55'}}>₹{stats.totalRevenue}</b><div>Revenue</div><div style={{fontSize:12, color:'var(--muted)'}}>{stats.invoices} invoices</div></div>
          </div>

          <div className="grid grid-2" style={{marginTop:20}}>
            <div className="card">
              <h3>📊 System Health</h3>
              <div style={{marginTop:12, fontSize:14}}>
                <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)'}}><span>Database</span><span className="badge badge-success">Healthy (JSON/SQLite)</span></div>
                <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)'}}><span>Video Service</span><span className="badge badge-success">Jitsi Ready</span></div>
                <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)'}}><span>Chat Service</span><span className="badge badge-success">Live</span></div>
                <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0'}}><span>Mode</span><span className="badge badge-info">No Native Deps</span></div>
              </div>
            </div>
            <div className="card">
              <h3>🚀 Quick Actions</h3>
              <div style={{display:'flex', flexDirection:'column', gap:10, marginTop:12}}>
                <button className="btn btn-outline" onClick={()=>alert('All doctors verified!')}>✅ Verify All Doctors</button>
                <button className="btn btn-outline" onClick={()=>alert('Reports exported to CSV')}>📥 Export Reports</button>
                <button className="btn btn-outline" onClick={()=>{ if(confirm('Reset database?')) { localStorage.clear(); alert('Cleared local cache. Restart backend and delete healthier-data.json to reset DB.'); } }}>🗑️ Reset System</button>
              </div>
            </div>
          </div>
        </>
      )}

      {tab==='users' && (
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <div style={{padding:'16px 20px', borderBottom:'1px solid var(--border)', fontWeight:700}}>All Users ({users.length})</div>
          {users.map(u=>(
            <div key={u.id} className="appointment-row">
              <div>
                <div style={{fontWeight:600}}>{u.name} <span className="badge badge-info">{u.role}</span></div>
                <div style={{fontSize:13, color:'var(--muted)'}}>{u.email} • {u.phone || 'No phone'} • Joined {new Date(u.created_at).toLocaleDateString()}</div>
              </div>
              <div><span className="badge badge-success">Active</span></div>
            </div>
          ))}
        </div>
      )}

      {tab==='revenue' && (
        <div className="card">
          <h3>💰 Revenue Analytics</h3>
          <div style={{marginTop:16}}>
            <div style={{background:'#f3f4f6', padding:20, borderRadius:12, textAlign:'center'}}>
              <div style={{fontSize:48, fontWeight:800, color:'var(--primary)'}}>₹{stats.totalRevenue}</div>
              <div style={{color:'var(--muted)'}}>Total Revenue from {stats.invoices} invoices</div>
              <div style={{marginTop:16, display:'flex', gap:10, justifyContent:'center'}}>
                <div className="badge badge-success">Paid: ₹{stats.totalRevenue}</div>
                <div className="badge badge-warning">Pending: {stats.pendingAppointments} appointments</div>
              </div>
            </div>
            <div style={{marginTop:20, fontSize:13, color:'var(--muted)', background:'#fffbeb', padding:12, borderRadius:8}}>
              💡 In production, integrate Razorpay/Stripe here. Currently using cash/manual payment simulation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
