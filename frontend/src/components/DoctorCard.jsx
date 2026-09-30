import { Link } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  return (
    <div className="card doctor-card">
      <div style={{display:'flex', gap:16, marginBottom:16}}>
        <div className="doctor-avatar">{doctor.name.charAt(0)}</div>
        <div style={{flex:1}}>
          <h3 style={{fontSize:18, marginBottom:4}}>{doctor.name}</h3>
          <span className="badge badge-info" style={{marginBottom:6, display:'inline-block'}}>{doctor.specialization}</span>
          <div style={{color:'var(--muted)', fontSize:13, marginTop:4}}>{doctor.qualification} • {doctor.experience} yrs</div>
          <div className="rating" style={{marginTop:6}}>⭐ {doctor.rating} • {doctor.availability}</div>
        </div>
      </div>
      <p style={{color:'var(--muted)', fontSize:14, marginBottom:16, minHeight:40}}>{doctor.bio}</p>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <span style={{fontWeight:700, fontSize:18, color:'var(--primary)'}}>₹{doctor.fee}</span>
          <span style={{color:'var(--muted)', fontSize:13}}> / consultation</span>
        </div>
        <Link to={`/book/${doctor.id}`} className="btn btn-primary btn-sm">Book Now</Link>
      </div>
    </div>
  );
}
