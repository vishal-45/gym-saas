import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={closeSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 95, backdropFilter: 'blur(4px)' }}
        />
      )}
      
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      
      <main className="main-content">
        <Topbar onMenuClick={toggleSidebar} />
        <div className="page-content" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
