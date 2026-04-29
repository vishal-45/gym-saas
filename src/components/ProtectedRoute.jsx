import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';

export default function ProtectedRoute() {
  const { tenant, isLoading } = useGymContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#09090b', color: 'white' }}>
        <div className="pulse-dot" style={{ width: '20px', height: '20px' }}></div>
      </div>
    );
  }

  const isMemberRoute = location.pathname.startsWith('/member/') || location.pathname === '/member';

  // If no user is authenticated, check which login page to send them to
  if (!tenant) {
    if (isMemberRoute) {
      return <Navigate to="/member-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Role-based routing enforcement
  if (tenant.role === 'MEMBER' && !isMemberRoute) {
    // Members trying to access Owner dashboard
    return <Navigate to="/member/dashboard" replace />;
  }

  if (tenant.role !== 'MEMBER' && isMemberRoute) {
    // Owners trying to access Member dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
