import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, Mail, Lock, AlertCircle, Users, Shield } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const { staffLogin } = useGymContext();

  const [mode, setMode] = useState('trainer'); // trainer | staff
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await staffLogin(email, password, mode);
    
    if (res.success) {
      navigate('/staff-portal');
    } else {
      setError(res.error || 'Authentication failure.');
    }
    setIsLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem' }}>
      {/* Background Glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'rgba(99,102,241,0.15)', borderRadius: '20px', marginBottom: '1rem', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Dumbbell size={32} color="var(--brand-primary)" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Staff Portal</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>CoreFitness Operational Access</p>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', borderRadius: '12px', padding: '4px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setMode('trainer')}
            style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', background: mode === 'trainer' ? 'var(--brand-primary)' : 'transparent', color: mode === 'trainer' ? 'white' : 'var(--text-secondary)' }}
          >
            <Dumbbell size={16} /> Trainer
          </button>
          <button
            onClick={() => setMode('staff')}
            style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', background: mode === 'staff' ? 'var(--brand-primary)' : 'transparent', color: mode === 'staff' ? 'white' : 'var(--text-secondary)' }}
          >
            <Users size={16} /> Staff
          </button>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {mode === 'trainer' ? 'Trainer Login' : 'Staff Login'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            Use the credentials assigned by your gym admin.
          </p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '0.875rem', marginBottom: '1.5rem', color: '#ef4444', fontSize: '0.875rem' }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ justifyContent: 'center', marginTop: '0.5rem', width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 700 }}
            >
              {isLoading ? 'Authenticating...' : `Access ${mode === 'trainer' ? 'Trainer' : 'Staff'} Portal`}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Access managed by your gym administrator
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Gym Owner Login
          </Link>
        </div>
      </div>
    </div>
  );
}
