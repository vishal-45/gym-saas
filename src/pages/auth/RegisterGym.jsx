import { useState } from 'react';
import { Building2, ShieldCheck, Dumbbell, ArrowRight, KeyRound } from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useGymContext } from '../../context/GymContext';

export default function RegisterGym() {
  const { registerTenant } = useGymContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', tier: 'Starter' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const res = await registerTenant(formData.name, formData.email, formData.password, formData.tier);
    
    if (res.success) {
      // Auto-login drops them right into Dashboard smoothly
      navigate('/');
    } else {
      setErrorMsg(res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#09090b', color: '#fff' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <Dumbbell size={48} color="#3b82f6" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Launch Your Gym</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Join 600+ businesses running their fitness empires on CoreFitness.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '3rem' }}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Business Name</label>
            <input 
              type="text" 
              placeholder="e.g. Iron Forge Barbell" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              style={{ padding: '1rem' }} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Owner Email</label>
            <input 
              type="email" 
              placeholder="owner@fitness.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              style={{ padding: '1rem' }} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Secure Password</label>
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
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500 }}>{errorMsg}</p>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>SaaS Subscription Tier</label>
            <select value={formData.tier} onChange={(e) => setFormData({...formData, tier: e.target.value})} style={{ padding: '1rem' }}>
              <option value="Starter">Starter ($99/mo) - Up to 100 Members</option>
              <option value="Growth">Growth ($199/mo) - Up to 500 Members</option>
              <option value="Enterprise">Enterprise ($499/mo) - Unlimited</option>
            </select>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '2rem', justifyContent: 'center', fontSize: '1.1rem' }}>
            {isSubmitting ? 'Provisioning Tenant...' : <span style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>Create Tenant Account <ArrowRight size={20} /></span>}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Already have an account? </span>
            <NavLink to="/login" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>Login here</NavLink>
          </div>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          By creating an account, you agree to our SaaS Terms of Service.
        </p>
      </div>
    </div>
  );
}
