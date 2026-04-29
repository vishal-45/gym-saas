import { Check, ShieldCheck, UserPlus } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function SelfServiceOnboarding() {
  const { gymName } = useParams();
  const displayGymName = gymName ? gymName.replace(/-/g, ' ').toUpperCase() : 'YOUR LOCAL GYM';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)', color: '#fff', padding: '2rem' }}>
      <div className="glass-card" style={{ maxWidth: '800px', width: '100%', display: 'flex', padding: 0, overflow: 'hidden' }}>
        
        {/* Left Presentation Side */}
        <div style={{ flex: 1, backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '3rem', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--brand-primary)', marginBottom: '1rem' }}>{displayGymName}</h2>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', lineHeight: 1.2 }}>Join The Family Today.</h1>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#3b82f6', borderRadius: '50%', padding: '4px', color: 'white' }}><Check size={16} /></div>
              <div><p style={{ fontWeight: 600 }}>24/7 Access</p><span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Train on your schedule</span></div>
            </li>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#3b82f6', borderRadius: '50%', padding: '4px', color: 'white' }}><Check size={16} /></div>
              <div><p style={{ fontWeight: 600 }}>Premium Equipment</p><span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Top tier machines & free weights</span></div>
            </li>
          </ul>
        </div>

        {/* Right Form Side */}
        <div style={{ flex: 1, padding: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            <UserPlus size={20} />
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Member Checkout</h3>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Email Address</label>
            <input type="email" placeholder="john@example.com" />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Select Plan</label>
            <select>
              <option>Month to Month - ₹1,200.00/mo</option>
              <option>12 Month Contract - ₹850.00/mo</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Credit Card</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="text" placeholder="0000 0000 0000 0000" style={{ flex: 3 }} />
              <input type="text" placeholder="MM/YY" style={{ flex: 1 }} />
              <input type="text" placeholder="CVC" style={{ flex: 1 }} />
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}>
            <ShieldCheck size={18} /> Complete Signup
          </button>
        </div>

      </div>
    </div>
  );
}
