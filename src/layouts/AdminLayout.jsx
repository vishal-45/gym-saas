import { Outlet, NavLink } from 'react-router-dom';
import { ShieldAlert, Server, Building2, Activity as ActivityIcon, History, Search } from 'lucide-react';

export default function AdminLayout() {
  const adminNavItems = [
    { id: 'dashboard', path: '/admin', label: 'Platform Overview', icon: <ActivityIcon size={20} /> },
    { id: 'tenants', path: '/admin/tenants', label: 'Gym Businesses', icon: <Building2 size={20} /> },
    { id: 'search', path: '/admin/search', label: 'Universal Search', icon: <Search size={20} /> },
    { id: 'logs', path: '/admin/logs', label: 'Platform History', icon: <History size={20} /> },
  ];

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#09090b', color: 'white' }}>
      {console.log("AdminLayout rendering")}
      <aside className="sidebar" style={{ borderRightColor: '#1e293b' }}>
        <div className="sidebar-header" style={{ borderBottomColor: '#1e293b' }}>
          <ShieldAlert className="logo-icon" color="#8b5cf6" size={28} />
          <span className="logo-text" style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SUPER ADMIN
          </span>
        </div>
        
        <nav className="nav-menu">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => isActive ? { backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.2)' } : {}}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderBottomColor: '#1e293b' }}>
          <h1 className="page-title">System Control Panel</h1>
          <div className="user-profile" style={{ borderColor: '#8b5cf6' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, paddingRight: '0.5rem' }}>God Mode</span>
            <div className="avatar" style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}>SA</div>
          </div>
        </header>

        <div className="page-content" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
