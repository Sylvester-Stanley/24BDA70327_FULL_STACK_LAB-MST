import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'doctor' ? '/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card form-card">
        <h2 style={{marginBottom:8}}>Welcome back 👋</h2>
        <p style={{color:'var(--muted)', marginBottom:24}}>Login to your Healthier account</p>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20}}>
          <button className="btn btn-outline btn-sm" onClick={()=>{setEmail('patient@test.com'); setPassword('patient123')}}>Use Patient Demo</button>
          <button className="btn btn-outline btn-sm" onClick={()=>{setEmail('sarah.j@healthier.com'); setPassword('doctor123')}}>Use Doctor Demo</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" style={{width:'100%', padding:14, justifyContent:'center'}} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{textAlign:'center', marginTop:20, color:'var(--muted)', fontSize:14}}>
          No account? <Link to="/register" style={{color:'var(--primary)', fontWeight:600}}>Register</Link>
        </p>
      </div>
    </div>
  );
}
