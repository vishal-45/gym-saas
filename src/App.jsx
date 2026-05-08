import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GymProvider } from './context/GymContext';
import ProtectedRoute from './components/ProtectedRoute';

import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import ClassesPage from './pages/tenant/ClassesPage';
import BillingPage from './pages/tenant/BillingPage';
import SettingsPage from './pages/tenant/SettingsPage';
import TrainersPage from './pages/tenant/TrainersPage';
import StaffPage from './pages/tenant/StaffPage';
import PlansPage from './pages/tenant/PlansPage';
import LeadsPage from './pages/tenant/LeadsPage';
import WellnessPage from './pages/tenant/WellnessPage';
import AuraKiosk from './pages/tenant/AuraKiosk';
import AnnouncementsPage from './pages/tenant/AnnouncementsPage';

// Lazy loaded components (isolated from bundle failure)
const AttendanceScanner = lazy(() => import('./pages/tenant/AttendanceScanner'));
const VaultManager = lazy(() => import('./pages/tenant/VaultManager'));
const MemberDashboard = lazy(() => import('./pages/member/MemberDashboard'));

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import TenantsList from './pages/admin/TenantsList';
import AdminSearch from './pages/admin/AdminSearch';
import AdminLogs from './pages/admin/AdminLogs';

import RegisterGym from './pages/auth/RegisterGym';
import LoginPage from './pages/auth/LoginPage';
import SelfServiceOnboarding from './pages/tenant/SelfServiceOnboarding';

import MemberLoginPage from './pages/auth/MemberLoginPage';
import StaffLoginPage from './pages/auth/StaffLoginPage';
import StaffPortalPage from './pages/staff/StaffPortalPage';

const LoadingFallback = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b', color: '#8b5cf6' }}>
    <div className="pulse-dot" style={{ width: '20px', height: '20px' }}></div>
    <span style={{ marginLeft: '1rem', fontWeight: 600 }}>Loading Module...</span>
  </div>
);

import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      {/* We wrap everything inside GymProvider so global Auth rules apply everywhere */}
      <GymProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Marketing Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Super Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="tenants" element={<TenantsList />} />
              <Route path="search" element={<AdminSearch />} />
              <Route path="logs" element={<AdminLogs />} />
            </Route>

            {/* Public / Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-gym" element={<RegisterGym />} />
            <Route path="/join/:gymName" element={<SelfServiceOnboarding />} />
            
            <Route path="/member-login" element={<MemberLoginPage />} />
            <Route path="/staff-login" element={<StaffLoginPage />} />

            {/* Secure Member Dashboard routes */}
            <Route path="/member" element={<ProtectedRoute />}>
              <Route index element={<Navigate to="/member/dashboard" replace />} />
              <Route path="dashboard" element={<MemberDashboard />} />
            </Route>

            {/* Staff / Trainer Portal */}
            <Route path="/staff-portal" element={<StaffPortalPage />} />

            {/* Secure Tenant Dashboard Routes (Protected by JWT State) */}
            <Route path="/dashboard" element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="classes" element={<ClassesPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="attendance" element={<AttendanceScanner />} />
                <Route path="vault" element={<VaultManager />} />
                <Route path="trainers" element={<TrainersPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="plans" element={<PlansPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="wellness" element={<WellnessPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="kiosk" element={<AuraKiosk />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
              </Route>
            </Route>

            {/* Redirect root dashboard if needed */}
            <Route path="/dashboard" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </GymProvider>
    </BrowserRouter>
  );
}

export default App;
