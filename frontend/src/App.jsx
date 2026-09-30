import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import Profile from './pages/Profile';
import ConsultationRoom from './pages/ConsultationRoom';
import HealthRecords from './pages/HealthRecords';
import Billing from './pages/Billing';
import Admin from './pages/Admin';
import AISymptomChecker from './pages/AISymptomChecker';
import AIChat from './pages/AIChat';
import AIWidget from './components/AIWidget';
import axios from 'axios';

axios.defaults.baseURL = '';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{padding:40, textAlign:'center'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{padding:40, textAlign:'center'}}>Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/book/:doctorId" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/consultation/:id" element={<ProtectedRoute><ConsultationRoom /></ProtectedRoute>} />
        <Route path="/records" element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/ai-symptom-checker" element={<AISymptomChecker />} />
        <Route path="/ai-chat" element={<AIChat />} />
      </Routes>
      <AIWidget />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
