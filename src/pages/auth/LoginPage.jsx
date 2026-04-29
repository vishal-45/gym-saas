import { useState } from 'react';
import { KeyRound, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useGymContext } from '../../context/GymContext';

export default function LoginPage() {
  const { login } = useGymContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const res = await login(email, password);
    
    if (res.success) {
      if (res.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(res.error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#09090b', color: '#fff' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(0, 0, 0, 0))', borderRight: '1px solid var(--border-color)' }}>
        <ShieldCheck size={48} color="var(--brand-primary)" style={{ marginBottom: 'auto' }} />
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
          Secure Authentication<br />
          <span className="gradient-text">Engine Online.</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Access your multi-tenant data with enterprise-grade JWT security and SQLite persistence.</p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2.5rem' }}>Log into your Gym Tenant Dashboard.</p>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Business Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }} />
              <input 
                type="email" 
                placeholder="owner@fitness.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '0.9rem 1rem 0.9rem 3rem', width: '100%' }} 
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  padding: '0.9rem 1rem 0.9rem 3rem', 
                  width: '100%',
                  borderColor: errorMsg ? '#ef4444' : undefined
                }} 
                required
              />
            </div>
            {errorMsg && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500 }}>
                {errorMsg}
              </p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '1rem', justifyContent: 'center', fontSize: '1.1rem' }}>
            {isSubmitting ? 'Authenticating...' : <span style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>Authenticate <ArrowRight size={20} /></span>}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Don't have a gym yet? </span>
            <NavLink to="/register-gym" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>Create Tenant</NavLink>
          </div>
        </form>
      </div>
    </div>
  );
}
