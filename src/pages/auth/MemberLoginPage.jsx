import { useState } from 'react';
import { Dumbbell, ArrowRight, KeyRound, User, ChevronRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../../context/GymContext';

export default function MemberLoginPage() {
  const { memberLogin } = useGymContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gymOptions, setGymOptions] = useState(null); // List of gyms to pick from

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const res = await memberLogin(formData.email, formData.password);
    
    if (res.success) {
      if (res.requiresSelection) {
        setGymOptions(res.options);
      } else if (res.role === 'MEMBER') {
        navigate('/member/dashboard');
      }
    } else {
      setErrorMsg(res.error || 'Unauthorized Access');
    }
    
    setIsSubmitting(false);
  };

  const handleSelectGym = async (tenantId) => {
    setIsSubmitting(true);
    const res = await memberLogin(formData.email, formData.password, tenantId);
    if (res.success) {
        navigate('/member/dashboard');
    } else {
        setErrorMsg(res.error);
        setGymOptions(null);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#09090b', color: '#fff' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', maxWidth: '500px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <Dumbbell size={48} color="#8b5cf6" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Member Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {gymOptions ? "We found multiple memberships. Choose which gym you'd like to access." : "Log in to view your schedule and manage your plan."}
          </p>
        </div>

        {/* Account Picker UI */}
        {gymOptions ? (
          <div className="glass-card fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>Available Memberships</h3>
            {gymOptions.map(gym => (
              <button 
                key={gym.tenantId} 
                onClick={() => handleSelectGym(gym.tenantId)}
                className="activity-item-premium hover-lift"
                style={{ width: '100%', textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', padding: '1.25rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={20} color="#8b5cf6" />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>{gym.gymName}</p>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{gym.plan} • {gym.status}</p>
                    </div>
                </div>
                <ChevronRight size={20} color="var(--text-muted)" />
              </button>
            ))}
            <button 
                onClick={() => setGymOptions(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', marginTop: '1rem', textDecoration: 'underline' }}
            >
                Back to login
            </button>
          </div>
        ) : (
          /* Standard Login Form */
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
        )}
        
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          By logging in, you agree to your gym's terms and policies.
        </p>
      </div>
    </div>
  );
}
