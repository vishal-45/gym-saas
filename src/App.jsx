import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  CreditCard, 
  Settings, 
  LogOut,
  TrendingUp,
  TrendingDown,
  Plus,
  Activity
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Simulate loading data to show off initial animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'members', label: 'Members', icon: <Users size={20} /> },
    { id: 'classes', label: 'Classes & Plans', icon: <Dumbbell size={20} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const recentMembers = [
    { id: 1, name: 'Alex Johnson', plan: 'Premium Pass', time: '10 mins ago', initials: 'AJ' },
    { id: 2, name: 'Sarah Miller', plan: 'Basic Month', time: '2 hours ago', initials: 'SM' },
    { id: 3, name: 'David Chen', plan: 'Annual Pro', time: '5 hours ago', initials: 'DC' },
  ];

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #27272a', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Dumbbell className="logo-icon" color="#3b82f6" size={28} />
          <span className="logo-text">CoreFitness</span>
        </div>
        
        <nav className="nav-menu">
          {navItems.map((item) => (
            <div 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border-color)' }}>
          <div className="nav-item" style={{ color: '#ef4444' }}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h1 className="page-title">
            {navItems.find(i => i.id === activeTab)?.label} Overview
          </h1>
          
          <div className="user-profile">
            <span style={{ fontSize: '0.875rem', fontWeight: 500, paddingRight: '0.5rem' }}>Admin</span>
            <div className="avatar">A</div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <div className="dashboard-grid">
              <div className="glass-card">
                <div className="stat-title">Total Active Members</div>
                <div className="stat-value">
                  2,451
                  <span className="stat-trend positive">
                    <TrendingUp size={16} style={{ marginRight: '4px' }}/>
                    12%
                  </span>
                </div>
              </div>

              <div className="glass-card">
                <div className="stat-title">Monthly Revenue</div>
                <div className="stat-value">
                  $84,250
                  <span className="stat-trend positive">
                    <TrendingUp size={16} style={{ marginRight: '4px' }}/>
                    8%
                  </span>
                </div>
              </div>

              <div className="glass-card">
                <div className="stat-title">Churn Rate</div>
                <div className="stat-value">
                  2.4%
                  <span className="stat-trend negative">
                    <TrendingDown size={16} style={{ marginRight: '4px' }}/>
                    0.5%
                  </span>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <div className="section-header">
                <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <Activity size={20} color="#3b82f6"/> 
                  Recent Check-ins
                </h2>
                <button className="btn-primary">
                  <Plus size={18} />
                  Add Member
                </button>
              </div>

              <div className="activity-list">
                {recentMembers.map(member => (
                  <div key={member.id} className="activity-item">
                    <div className="activity-user">
                      <div className="activity-avatar" style={{ background: `hsl(${member.id * 80}, 60%, 40%)`, color: 'white' }}>
                        {member.initials}
                      </div>
                      <div className="activity-details">
                        <p>{member.name}</p>
                        <span>{member.plan}</span>
                      </div>
                    </div>
                    <div className="activity-time">{member.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {activeTab !== 'dashboard' && (
          <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>
            <p>This module is currently under construction. Please check back later.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
