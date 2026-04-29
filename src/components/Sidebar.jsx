import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Dumbbell, CreditCard, Settings, LogOut, Camera, BookOpen, Contact, Award, TrendingUp, Heart } from 'lucide-react';
import { useGymContext } from '../context/GymContext';

export default function Sidebar({ isOpen, closeSidebar }) {
  const { logout } = useGymContext();
  const navItems = [
    { id: 'dashboard', path: '/', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'leads', path: '/leads', label: 'Leads', icon: <TrendingUp size={20} /> },
    { id: 'wellness', path: '/wellness', label: 'Wellness', icon: <Heart size={20} /> },
    { id: 'attendance', path: '/attendance', label: 'Attendance', icon: <Camera size={20} /> },
    { id: 'members', path: '/members', label: 'Members', icon: <Users size={20} /> },
    { id: 'classes', path: '/classes', label: 'Classes', icon: <Dumbbell size={20} /> },
    { id: 'billing', path: '/billing', label: 'Financials', icon: <CreditCard size={20} /> },
    { id: 'vault', path: '/vault', label: 'The Vault', icon: <BookOpen size={20} /> },
    { id: 'trainers', path: '/trainers', label: 'Trainers', icon: <Dumbbell size={20} /> },
    { id: 'staff', path: '/staff', label: 'Our Team', icon: <Contact size={20} /> },
    { id: 'plans', path: '/plans', label: 'Memberships', icon: <Award size={20} /> },
    { id: 'settings', path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Dumbbell className="logo-icon" color="var(--brand-primary)" size={28} />
        <span className="logo-text">CoreFitness</span>
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
