import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Dumbbell, CreditCard, Settings, LogOut, Camera, BookOpen, Contact, Award, TrendingUp, Heart, Zap, Megaphone, X } from 'lucide-react';
import { useGymContext } from '../context/GymContext';

export default function Sidebar({ isOpen, closeSidebar }) {
  const { logout } = useGymContext();
  const navItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'announcements', path: '/dashboard/announcements', label: 'Announcements', icon: <Megaphone size={20} color="var(--brand-primary)" /> },
    { id: 'kiosk', path: '/dashboard/kiosk', label: 'Aura Kiosk', icon: <Zap size={20} color="var(--brand-primary)" /> },
    { id: 'leads', path: '/dashboard/leads', label: 'Leads', icon: <TrendingUp size={20} /> },
    { id: 'wellness', path: '/dashboard/wellness', label: 'Wellness', icon: <Heart size={20} /> },
    { id: 'attendance', path: '/dashboard/attendance', label: 'Attendance', icon: <Camera size={20} /> },
    { id: 'members', path: '/dashboard/members', label: 'Members', icon: <Users size={20} /> },
    { id: 'classes', path: '/dashboard/classes', label: 'Classes', icon: <Dumbbell size={20} /> },
    { id: 'billing', path: '/dashboard/billing', label: 'Financials', icon: <CreditCard size={20} /> },
    { id: 'vault', path: '/dashboard/vault', label: 'The Vault', icon: <BookOpen size={20} /> },
    { id: 'trainers', path: '/dashboard/trainers', label: 'Trainers', icon: <Dumbbell size={20} /> },
    { id: 'staff', path: '/dashboard/staff', label: 'Our Team', icon: <Contact size={20} /> },
    { id: 'plans', path: '/dashboard/plans', label: 'Memberships', icon: <Award size={20} /> },
    { id: 'settings', path: '/dashboard/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Dumbbell className="logo-icon" color="var(--brand-primary)" size={28} />
          <span className="logo-text">CoreFitness</span>
        </div>
        <button className="mobile-close-btn" onClick={closeSidebar} style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="var(--text-secondary)" />
        </button>
      </div>
      
      <nav className="nav-menu">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={closeSidebar}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>


      <div className="sidebar-footer">
        <div className="nav-item" style={{ color: '#ef4444', cursor: 'pointer' }} onClick={logout}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </div>
      </div>
    </aside>
  );
}
