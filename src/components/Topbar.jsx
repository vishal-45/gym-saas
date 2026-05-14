import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <button 
            className="mobile-menu-btn" 
            onClick={onMenuClick}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'none' }}
        >
          <Menu size={24} color="var(--text-primary)" />
        </button>
        
        <div className="topbar-search-container" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input 
                type="text" 
                placeholder="Search..." 
                className="topbar-search"
                style={{ 
                    background: '#f1f5f9', 
                    border: 'none', 
                    borderRadius: '12px', 
                    padding: '0.6rem 1rem 0.6rem 2.75rem',
                    fontSize: '0.85rem',
                    width: '100%',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontWeight: 500
                }}
            />
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button className="btn-icon-round topbar-icon" style={{ border: 'none', background: 'transparent', padding: '8px', cursor: 'pointer' }}>
            <Bell size={20} color="var(--text-secondary)" />
        </button>

        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="user-info" style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>Admin</p>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--brand-primary)', fontWeight: 800, textTransform: 'uppercase' }}>System</p>
            </div>
            <div className="avatar" style={{ 
                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
                width: '38px',
                height: '38px',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)',
                border: '2px solid white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.8rem'
            }}>AD</div>
        </div>
      </div>
    </header>
  );
}
