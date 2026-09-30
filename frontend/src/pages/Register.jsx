import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'patient', phone:'', age:'', gender:'Male', specialization:'General Physician', qualification:'MBBS', experience:1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card form-card" style={{maxWidth:560}}>
        <h2 style={{marginBottom:8}}>Create account ✨</h2>
        <p style={{color:'var(--muted)', marginBottom:20}}>Join Healthier for better healthcare</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="tabs" style={{marginBottom:20}}>
            <button type="button" className={`tab ${form.role==='patient'?'active':''}`} onClick={()=>setForm({...form, role:'patient'})}>I'm a Patient</button>
            <button type="button" className={`tab ${form.role==='doctor'?'active':''}`} onClick={()=>setForm({...form, role:'doctor'})}>I'm a Doctor</button>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="label">Full Name</label>
              <input className="input" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="label">Phone</label>
              <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@example.com" />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Minimum 6 characters" />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="label">Age</label>
              <input className="input" name="age" type="number" value={form.age} onChange={handleChange} placeholder="28" />
            </div>
            <div className="form-group">
              <label className="label">Gender</label>
              <select className="input" name="gender" value={form.gender} onChange={handleChange}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>

          {form.role==='doctor' && (
            <>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="label">Specialization</label>
                  <select className="input" name="specialization" value={form.specialization} onChange={handleChange}>
                    <option>General Physician</option><option>Cardiologist</option><option>Dermatologist</option><option>Pediatrician</option><option>Orthopedic</option><option>Gynecologist</option><option>Neurologist</option><option>ENT</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Experience (years)</label>
                  <input className="input" name="experience" type="number" value={form.experience} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Qualification</label>
                <input className="input" name="qualification" value={form.qualification} onChange={handleChange} placeholder="MBBS, MD" />
              </div>
            </>
          )}

          <button className="btn btn-primary" style={{width:'100%', padding:14, justifyContent:'center', marginTop:10}} disabled={loading}>
            {loading ? 'Creating...' : `Create ${form.role} Account`}
          </button>
        </form>

        <p style={{textAlign:'center', marginTop:20, color:'var(--muted)', fontSize:14}}>
          Already have account? <Link to="/login" style={{color:'var(--primary)', fontWeight:600}}>Login</Link>
        </p>
      </div>
    </div>
  );
}
