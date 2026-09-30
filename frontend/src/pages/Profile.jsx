import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(()=>{
    axios.get('/api/auth/me').then(res=>setData(res.data));
  },[]);

  if(!data) return <div className="container" style={{padding:40}}>Loading profile...</div>;

  return (
    <div className="container" style={{padding:'40px 20px'}}>
      <div className="card" style={{maxWidth:600, margin:'0 auto'}}>
        <div style={{display:'flex', gap:20, alignItems:'center', marginBottom:24}}>
          <div className="doctor-avatar" style={{width:80,height:80, fontSize:32}}>{data.name.charAt(0)}</div>
          <div>
            <h2>{data.name}</h2>
            <span className="badge badge-info">{data.role}</span>
            <div style={{color:'var(--muted)', fontSize:14, marginTop:4}}>{data.email}</div>
          </div>
        </div>

        <div className="grid grid-2">
          <div><label className="label">Phone</label><div>{data.phone || 'Not set'}</div></div>
          <div><label className="label">Age</label><div>{data.age || 'Not set'}</div></div>
          <div><label className="label">Gender</label><div>{data.gender || 'Not set'}</div></div>
          <div><label className="label">Member Since</label><div>{new Date(data.created_at).toLocaleDateString()}</div></div>
        </div>

        {data.doctorInfo && (
          <div style={{marginTop:24, paddingTop:24, borderTop:'1px solid var(--border)'}}>
            <h3 style={{marginBottom:12}}>Doctor Profile</h3>
            <div className="grid grid-2">
              <div><label className="label">Specialization</label><div>{data.doctorInfo.specialization}</div></div>
              <div><label className="label">Qualification</label><div>{data.doctorInfo.qualification}</div></div>
              <div><label className="label">Experience</label><div>{data.doctorInfo.experience} years</div></div>
              <div><label className="label">Fee</label><div>₹{data.doctorInfo.fee}</div></div>
              <div style={{gridColumn:'1 / -1'}}><label className="label">Bio</label><div style={{color:'var(--muted)'}}>{data.doctorInfo.bio}</div></div>
            </div>
          </div>
        )}

        <div style={{marginTop:24, background:'#f9fafb', padding:16, borderRadius:12, fontSize:13, color:'var(--muted)'}}>
          🔐 Your data is stored locally in SQLite (healthier.db) on your PC. No cloud. You can backup this file anytime.
        </div>
      </div>
    </div>
  );
}
