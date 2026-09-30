import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path) && path !== '/' ? 'active' : location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <span style={{fontSize:28}}>⚕️</span> Healthier
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link to="/ai-symptom-checker" className={`nav-link ${isActive('/ai-symptom-checker')}`} style={{color:'#0e9f6e', fontWeight:700}}>🤖 AI Check</Link>
          <Link to="/doctors" className={`nav-link ${isActive('/doctors')}`}>Doctors</Link>
          {user && (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
              <Link to="/records" className={`nav-link ${isActive('/records')}`}>Records</Link>
              <Link to="/billing" className={`nav-link ${isActive('/billing')}`}>Billing</Link>
              {user.role === 'admin' && <Link to="/admin" className={`nav-link ${isActive('/admin')}`} style={{color:'#dc2626', fontWeight:700}}>Admin</Link>}
            </>
          )}
          {user ? (
            <>
              <Link to="/profile" className="nav-link" style={{display:'flex', alignItems:'center', gap:8}}>
                <span style={{width:32, height:32, background:'#def7ec', color:'#057a55', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700}}>
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                {user.name.split(' ')[0]} ({user.role})
              </Link>
              <button className="btn btn-outline btn-sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login')}`}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
