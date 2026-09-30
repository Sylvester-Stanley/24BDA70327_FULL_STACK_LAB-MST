import { useEffect, useState } from 'react';
import axios from 'axios';
import DoctorCard from '../components/DoctorCard';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');
  const [specs, setSpecs] = useState([]);

  useEffect(() => {
    axios.get('/api/doctors').then(res => {
      setDoctors(res.data);
      setFiltered(res.data);
      const uniq = [...new Set(res.data.map(d=>d.specialization))];
      setSpecs(uniq);
    });
  }, []);

  useEffect(() => {
    let result = doctors;
    if (spec !== 'All') result = result.filter(d => d.specialization === spec);
    if (search) result = result.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, spec, doctors]);

  return (
    <div className="container" style={{padding:'40px 20px'}}>
      <h1 style={{fontSize:32, marginBottom:8}}>Find Your Doctor</h1>
      <p style={{color:'var(--muted)', marginBottom:24}}>Browse verified specialists and book instantly</p>

      <div className="card" style={{display:'flex', gap:12, flexWrap:'wrap', marginBottom:24}}>
        <input className="input" style={{flex:1, minWidth:240}} placeholder="🔍 Search by name or specialization..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="input" style={{width:200}} value={spec} onChange={e=>setSpec(e.target.value)}>
          <option value="All">All Specializations</option>
          {specs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{textAlign:'center', padding:40, color:'var(--muted)'}}>No doctors found for "{search}"</div>
      ) : (
        <div className="grid grid-3">
          {filtered.map(doc => <DoctorCard key={doc.id} doctor={doc} />)}
        </div>
      )}
    </div>
  );
}
