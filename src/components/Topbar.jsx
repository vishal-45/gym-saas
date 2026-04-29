import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <button 
            className="btn-icon-round mobile-only" 
            onClick={onMenuClick}
            style={{ border: 'none', background: 'rgba(255,255,255,0.05)', display: 'none', padding: '8px' }}
        >
          <Menu size={20} />
        </button>
        
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input 
                type="text" 
                placeholder="Global Search..." 
                className="topbar-search"
                style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '20px', 
                    padding: '0.45rem 1rem 0.45rem 2.5rem',
                    fontSize: '0.85rem',
                    width: '100%',
                    color: 'white',
                    outline: 'none'
                }}
            />
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-icon-round" style={{ border: 'none', background: 'transparent', padding: '8px' }}>
            <Bell size={20} color="var(--text-secondary)" />
        </button>

        <div className="user-profile">
            <div className="user-info">
                <p>Admin Panel</p>
                <p>System Level</p>
            </div>
            <div className="avatar">AD</div>
        </div>
      </div>
    </header>
  );
}
