import { useState, useEffect } from 'react';
import { Search, Building2, Plus, LogOut, Verified, ShieldBan, X, UserCircle } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';
import { useNavigate } from 'react-router-dom';

export default function TenantsList() {
  const { fetchAllTenants, toggleTenantStatus, adminProvisionTenant, impersonateTenant, logout } = useGymContext();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', tier: 'Starter' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAllTenants();
    if (data?.error) {
      setTenants([]);
    } else {
      setTenants(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProvision = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await adminProvisionTenant(formData);
    if (res.success) {
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', tier: 'Starter' });
      loadData();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleToggle = async (id) => {
    const success = await toggleTenantStatus(id);
    if (success) {
      loadData();
    }
  };

  const handleImpersonate = async (id) => {
    const res = await impersonateTenant(id);
    if (res.success) {
      navigate('/'); // Go to tenant dashboard
    } else {
      alert(res.error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Provisioning Modal - Moved OUTSIDE the blur zone */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} style={{
        zIndex: 9999,
        display: isModalOpen ? 'flex' : 'none',
        opacity: isModalOpen ? 1 : 0
      }}>
        <div className="slide-pane" style={{ transform: isModalOpen ? 'translateX(0)' : 'translateX(100%)' }}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Building2 size={24} color="#8b5cf6" />
              <h3>Provision New Gym</h3>
            </div>
            <button className="btn-icon-round" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <form className="modal-body" onSubmit={handleProvision}>
            <div className="form-group">
              <label>Business Name</label>
              <input 
                type="text" 
                placeholder="e.g. Platinum Fitness" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Owner Email</label>
              <input 
                type="email" 
                placeholder="admin@gym.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Initial Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Service Plan</label>
              <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})}>
                 <option value="Starter">Starter ($99/mo)</option>
                 <option value="Growth">Growth ($199/mo)</option>
                 <option value="Enterprise">Enterprise ($499/mo)</option>
              </select>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {isSubmitting ? 'Provisioning Engine...' : 'Confirm Deployment'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={`members-page fade-in ${isModalOpen ? 'blur-background' : ''}`}>
        <div className="page-actions-bar">
          <div style={{ display: 'flex', gap: '2rem', flex: 1 }}>
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search gym businesses..." />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary" 
              style={{ backgroundColor: '#8b5cf6' }}
            >
              <Plus size={18} /> Provision New Gym
            </button>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.65rem', border: '1px solid #ef4444', color: '#ef4444' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="table-container fade-in">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant ID</th>
                <th>Business Name</th>
                <th>Owner Email</th>
                <th>Platform MRR</th>
                <th>Total Members</th>
                <th>Status</th>
                <th>God Authority</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>Loading global databanks...</td></tr>
              ) : (Array.isArray(tenants) && tenants.map(gym => (
                <tr key={gym.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>...{gym.id.substring(0, 6)}</td>
                  <td>
                    <div className="table-cell-user">
                      <Building2 size={24} color="#8b5cf6" />
                      <span style={{ fontWeight: 600 }}>{gym.name}</span>
                    </div>
                  </td>
                  <td>{gym.owner}</td>
                  <td style={{ fontWeight: 700, color: '#8b5cf6' }}>${gym.mrr}</td>
                  <td>{gym.members} active</td>
                  <td>
                    <span className={`status-badge ${gym.status === 'Active' ? 'active' : 'inactive'}`}>
                       {gym.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleImpersonate(gym.id)} 
                        style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem' }}
                        className="hover-lift"
                      >
                        <UserCircle size={14} /> Enter Portal
                      </button>
                      {gym.status === 'Active' ? (
                        <button 
                          onClick={() => handleToggle(gym.id)} 
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem' }}
                          className="hover-lift"
                        >
                          <ShieldBan size={14} /> Suspend Engine
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggle(gym.id)} 
                          style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem' }}
                          className="hover-lift"
                        >
                          <Verified size={14} /> Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
              {!isLoading && tenants.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span>No Gym Tenants provisioned yet.</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>If you have already created one, check if the backend server is running.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
