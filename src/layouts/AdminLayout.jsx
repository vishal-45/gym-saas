import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { ShieldAlert, Server, Building2, Activity as ActivityIcon, History, Search, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const adminNavItems = [
    { id: 'dashboard', path: '/admin', label: 'Platform Overview', icon: <ActivityIcon size={20} /> },
    { id: 'tenants', path: '/admin/tenants', label: 'Gym Businesses', icon: <Building2 size={20} /> },
    { id: 'search', path: '/admin/search', label: 'Universal Search', icon: <Search size={20} /> },
    { id: 'logs', path: '/admin/logs', label: 'Platform History', icon: <History size={20} /> },
  ];

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={closeSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 95, backdropFilter: 'blur(4px)' }}
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ borderBottomColor: '#1e293b' }}>
          <ShieldAlert className="logo-icon" color="var(--brand-primary)" size={28} />
          <span className="logo-text" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SUPER ADMIN
          </span>
          <button className="mobile-menu-btn" onClick={closeSidebar} style={{ marginLeft: 'auto' }}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="nav-menu">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/admin'}
              onClick={closeSidebar}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <Menu size={20} />
            </button>
            <h1 className="page-title" style={{ fontSize: '1.25rem', margin: 0 }}>Control Panel</h1>
          </div>
          
          <div className="user-profile" style={{ borderColor: 'var(--brand-primary)' }}>
            <div className="user-info">
              <p>God Mode</p>
              <p>System Level</p>
            </div>
            <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))' }}>SA</div>
          </div>
        </header>

        <div className="page-content" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
