import { useState } from 'react';
import { Dumbbell, ArrowRight, KeyRound, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../../context/GymContext';

export default function MemberLoginPage() {
  const { memberLogin } = useGymContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const res = await memberLogin(formData.email, formData.password);
    
    if (res.success && res.role === 'MEMBER') {
      navigate('/member/dashboard');
    } else {
      setErrorMsg(res.error || 'Unauthorized Access');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#09090b', color: '#fff' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <Dumbbell size={48} color="#8b5cf6" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Member Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log in to view your schedule, manage your plan, and track progress.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '3rem', borderTop: '4px solid #8b5cf6' }}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Member Email</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }} />
              <input 
                type="email" 
                placeholder="athlete@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{ padding: '1rem 1rem 1rem 3rem', width: '100%' }} 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Portal Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={{ padding: '1rem 1rem 1rem 3rem', width: '100%', borderColor: errorMsg ? '#ef4444' : undefined }} 
              />
            </div>
            {errorMsg && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 500, padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
                {errorMsg}
              </p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', justifyContent: 'center', fontSize: '1.1rem', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
            {isSubmitting ? 'Authenticating...' : <span style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>Enter Portal <ArrowRight size={20} /></span>}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          By logging in, you agree to your gym's terms and policies.
        </p>
      </div>
    </div>
  );
}
