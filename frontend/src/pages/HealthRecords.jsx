import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function HealthRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ title:'', description:'', record_date: new Date().toISOString().split('T')[0] });
  const [showForm, setShowForm] = useState(false);

  const fetchRecords = () => {
    axios.get('/api/health-records').then(res=>setRecords(res.data));
  };

  useEffect(()=>{ fetchRecords(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/health-records', form);
      setForm({ title:'', description:'', record_date: new Date().toISOString().split('T')[0] });
      setShowForm(false);
      fetchRecords();
    } catch (err) { alert('Failed'); }
  };

  return (
    <div className="container" style={{padding:'30px 20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
        <div>
          <h1 style={{fontSize:28}}>📁 Health Records</h1>
          <p style={{color:'var(--muted)'}}>Your medical history, prescriptions, lab reports</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Record'}</button>
      </div>

      {showForm && (
        <div className="card" style={{marginBottom:20}}>
          <h3 style={{marginBottom:12}}>Add Health Record</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="label">Title</label>
                <input className="input" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required placeholder="e.g. Blood Test, X-Ray, Prescription" />
              </div>
              <div className="form-group">
                <label className="label">Date</label>
                <input className="input" type="date" value={form.record_date} onChange={e=>setForm({...form, record_date:e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Description / Details</label>
              <textarea className="input" rows="4" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Describe the record, symptoms, doctor notes..."></textarea>
            </div>
            <button className="btn btn-primary" type="submit">Save Record</button>
          </form>
        </div>
      )}

      <div className="grid grid-3">
        {records.length===0 ? (
          <div className="card" style={{gridColumn:'1/-1', textAlign:'center', padding:40, color:'var(--muted)'}}>
            No health records yet. Add your first record!
          </div>
        ) : records.map(rec=>(
          <div key={rec.id} className="card">
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
              <span className="badge badge-info">{new Date(rec.record_date).toLocaleDateString()}</span>
              <span style={{fontSize:12, color:'var(--muted)'}}>#{rec.id}</span>
            </div>
            <h3 style={{fontSize:16, marginBottom:6}}>{rec.title}</h3>
            <p style={{fontSize:14, color:'var(--muted)', minHeight:40}}>{rec.description || 'No description'}</p>
            <div style={{marginTop:12, fontSize:12, color:'var(--muted)', borderTop:'1px solid var(--border)', paddingTop:8}}>
              Added {new Date(rec.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
