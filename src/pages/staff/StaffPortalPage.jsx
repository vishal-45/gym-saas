import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useGymContext } from '../../context/GymContext';
import AddMemberModal from '../../components/staff/AddMemberModal';
import EditMemberModal from '../../components/staff/EditMemberModal';
import AddLeadModal from '../../components/staff/AddLeadModal';
import PaymentsModal from '../../components/staff/PaymentsModal';
import { 
  Dumbbell, Users, Calendar, LogOut, Star, Clock, 
  TrendingUp, Heart, Plus, X, Utensils, Target, 
  Activity, ChevronRight, Search, LayoutDashboard, 
  MessageSquare, Settings, Bell, MoreVertical, Edit3,
  Award, Zap, ArrowUpRight, ArrowDownRight, UserCheck, 
  CreditCard, ShieldCheck, AlertCircle, CheckCircle2,
  CalendarPlus, UserMinus, Camera, XCircle, History,
  Mail, Phone, MapPin, UserPlus, Trash2, FileText,
  UserCog, Lock, Unlock, RefreshCw, Menu
} from 'lucide-react';

const API_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

export default function StaffPortalPage() {
  const { 
    tenant, token, logout, checkInMember, attendance, loadAttendance, payments,
    notifications, fetchNotifications, markNotificationRead
  } = useGymContext();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [leads, setLeads] = useState([]);
  const [plans, setPlans] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ todayCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // dashboard | schedule | clients | scanner | leads
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScanningRetention, setIsScanningRetention] = useState(false);

  // QR Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState({ type: '', message: '' });

  // Role Logic
  const isTrainer = tenant?.role === 'TRAINER';
  const isStaff = tenant?.role === 'STAFF';
  const isManager = tenant?.staffRole === 'MANAGER';
  const staffRole = tenant?.staffRole || (isTrainer ? 'Elite Coach' : 'Personnel');
  const userPermissions = tenant?.permissions || [];

  const hasPermission = (perm) => {
    if (isTrainer) return true; // Trainers have their own fixed logic for now
    if (isManager) return true; // Managers get everything
    if (userPermissions.length === 0) return true; // Default to all if not set (legacy)
    return userPermissions.includes(perm);
  };

  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [wellnessData, setWellnessData] = useState({ workouts: [], diets: [], progress: [] });
  const [isWellnessModalOpen, setIsWellnessModalOpen] = useState(false);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('workouts'); 
  const [macroCalc, setMacroCalc] = useState({ p: 180, c: 250, f: 60 });

  // Derived Data
  const myMembers = isTrainer
    ? (members || []).filter(m => String(m.trainerId) === String(tenant?.id))
    : (members || []);

  const filteredMembers = myMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const attentionNeededCount = myMembers.filter(m => m.consistencyScore < 5).length;
  const filteredPayments = (payments || []).filter(p => p.memberId === selectedMember?.id);

  useEffect(() => {
    if (!token) {
      navigate('/staff-login');
      return;
    }
    if (token && tenant?.tenantId) {
      loadPortalData();
    }
  }, [token, tenant]);

  useEffect(() => {
    if (selectedMember && isTrainer) {
      fetchMemberWellness();
    }
  }, [selectedMember]);

  // QR Scanner Effect
  useEffect(() => {
    let scanner;
    if (activeView === 'scanner' && isScanning) {
      // Small timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        try {
          scanner = new Html5QrcodeScanner("staff-reader", { 
            fps: 10, 
            qrbox: { width: 250, height: 250 } 
          });
          scanner.render(onScanSuccess, onScanError);
        } catch (err) {
          console.error("Scanner init error", err);
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Scanner clear fail", error));
      }
    };
  }, [activeView, isScanning]);

  async function onScanSuccess(decodedText) {
    setIsScanning(false);
    setScanStatus({ type: 'loading', message: 'Verifying QR Code...' });
    
    const res = await checkInMember(decodedText);
    
    if (res.success) {
      setScanStatus({ type: 'success', message: res.message });
      setToast({ type: 'success', message: res.message });
      // Refresh stats
      loadPortalData();
    } else {
      setScanStatus({ type: 'error', message: res.error || "Unknown Member" });
    }

    setTimeout(() => {
      setScanStatus({ type: '', message: '' });
      setIsScanning(true);
    }, 3000);
  }

  function onScanError(err) {}

  const loadPortalData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [mRes, cRes, sRes, lRes, pRes] = await Promise.all([
        fetch(`${API_URL}/members`, { headers }),
        fetch(`${API_URL}/classes`, { headers }),
        fetch(`${API_URL}/attendance/stats`, { headers }),
        fetch(`${API_URL}/leads`, { headers }),
        fetch(`${API_URL}/plans`, { headers })
      ]);
      
      if (mRes.ok) setMembers(await mRes.json());
      if (cRes.ok) setClasses(await cRes.json());
      if (sRes.ok) setAttendanceStats(await sRes.json());
      if (lRes.ok) setLeads(await lRes.json());
      if (pRes.ok) setPlans(await pRes.json());
      
      fetchNotifications();
      loadAttendance();
    } catch (err) {
      console.error('Portal load failure', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runRetentionScan = async () => {
    setIsScanningRetention(true);
    try {
        const res = await fetch(`${API_URL}/notifications/run-reminder-scan`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            setToast({ type: 'success', message: `Scan complete: ${data.remindersSent} new reminders.` });
            fetchNotifications(); 
        }
    } catch (err) {
        setToast({ type: 'error', message: "Retention scan failed." });
    }
    setIsScanningRetention(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/staff-login');
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const memberData = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch(`${API_URL}/members`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(memberData)
      });
      if (res.ok) {
        setIsAddMemberModalOpen(false);
        setToast({ type: 'success', message: 'Member enrolled successfully!' });
        loadPortalData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Enrollment failed.' });
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const memberData = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch(`${API_URL}/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(memberData)
      });
      if (res.ok) {
        setIsEditMemberModalOpen(false);
        setToast({ type: 'success', message: 'Member updated!' });
        loadPortalData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Update failed.' });
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const leadData = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(leadData)
      });
      if (res.ok) {
        setIsAddLeadModalOpen(false);
        setToast({ type: 'success', message: 'Lead captured!' });
        loadPortalData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Lead capture failed.' });
    }
  };

  const handleConvertToMember = (lead) => {
    setSelectedMember({ name: lead.name, email: lead.email, phone: lead.phone });
    setIsAddMemberModalOpen(true);
  };

  const handleCheckIn = async (memberId, name) => {
    try {
        const res = await fetch(`${API_URL}/attendance/check-in`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ memberId })
        });
        if (res.ok) {
            setToast({ type: 'success', message: `Successfully checked in ${name}` });
            loadPortalData();
        } else {
            setToast({ type: 'error', message: 'Check-in failed. Please retry.' });
        }
    } catch (err) {
        setToast({ type: 'error', message: 'Server unreachable.' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookMember = async (classId, memberId) => {
    try {
        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ classId, memberId })
        });
        const data = await res.json();
        if (res.ok) {
            setToast({ type: 'success', message: 'Booking confirmed for member.' });
            loadPortalData();
            setIsBookingModalOpen(false);
        } else {
            setToast({ type: 'error', message: data.error || 'Booking failed.' });
        }
    } catch (err) {
        setToast({ type: 'error', message: 'Network failure during booking.' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMemberWellness = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [wRes, dRes, pRes] = await Promise.all([
        fetch(`${API_URL}/wellness/workouts/${selectedMember.id}`, { headers }),
        fetch(`${API_URL}/wellness/diets/${selectedMember.id}`, { headers }),
        fetch(`${API_URL}/wellness/progress/${selectedMember.id}`, { headers })
      ]);
      setWellnessData({
        workouts: await wRes.json(),
        diets: await dRes.json(),
        progress: await pRes.json()
      });
    } catch (err) { console.error(err); }
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const exercises = e.target.exercises.value.split('\n').map(ex => ({ name: ex.trim() }));
    
    try {
      const res = await fetch(`${API_URL}/wellness/workouts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ memberId: selectedMember.id, title, exercises, trainerName: tenant.name })
      });
      if (res.ok) {
        fetchMemberWellness();
        e.target.reset();
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateDiet = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const meals = e.target.meals.value.split('\n').map(m => ({ content: m.trim() }));
    
    try {
      const res = await fetch(`${API_URL}/wellness/diets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ memberId: selectedMember.id, title, meals })
      });
      if (res.ok) {
        fetchMemberWellness();
        e.target.reset();
      }
    } catch (err) { console.error(err); }
  };


  const getTopPerformers = () => {
    return [...myMembers].sort((a, b) => b.consistencyScore - a.consistencyScore).slice(0, 5);
  };

  const totalSessionsConducted = classes.reduce((acc, c) => acc + (c.bookings?.length || 0), 0);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  return (
    <div className="staff-portal-container" style={{ background: '#f8fafc', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        .staff-portal-container {
          min-height: 100vh;
          display: flex;
        }
        .staff-sidebar {
          width: 280px;
          background: #ffffff !important;
          border-right: 1px solid #e2e8f0 !important;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          transition: all 0.3s ease;
        }
        .staff-main {
          flex: 1;
          margin-left: 280px;
          padding: 2.5rem;
          transition: all 0.3s ease;
        }
        .glass-card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
          border-radius: 24px;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border-color: #2563eb !important;
        }
        @media (max-width: 1024px) {
          .staff-sidebar {
            transform: translateX(-100%);
          }
          .staff-sidebar.open {
            transform: translateX(0);
          }
          .staff-main {
            margin-left: 0;
            padding: 1.5rem;
          }
        }
        .nav-link-active {
          background: #eff6ff !important;
          color: #2563eb !important;
          font-weight: 700 !important;
        }
      `}</style>
      
      {/* Mobile Menu Overlay */}
      {isSidebarMobileOpen && (
        <div 
          onClick={() => setIsSidebarMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 95, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Premium Sidebar */}
      <aside className={`staff-sidebar ${isSidebarMobileOpen ? 'open' : ''}`} style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 0.5rem' }}>
          <div style={{ background: '#2563eb', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)' }}>
            <Dumbbell size={22} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>CORE<span style={{ color: '#2563eb' }}>FIT</span></span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button 
            onClick={() => { setActiveView('dashboard'); setIsSidebarMobileOpen(false); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: activeView === 'dashboard' ? '#eff6ff' : 'transparent',
              color: activeView === 'dashboard' ? '#2563eb' : '#64748b',
              fontWeight: activeView === 'dashboard' ? 700 : 500,
              transition: 'all 0.2s', width: '100%', textAlign: 'left'
            }}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          
          {hasPermission('members') && (
            <button 
              onClick={() => { setActiveView('clients'); setIsSidebarMobileOpen(false); }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: activeView === 'clients' ? '#eff6ff' : 'transparent',
                color: activeView === 'clients' ? '#2563eb' : '#64748b',
                fontWeight: activeView === 'clients' ? 700 : 500,
                transition: 'all 0.2s', width: '100%', textAlign: 'left'
              }}
            >
              <Users size={20} /> {isTrainer ? 'My Clients' : 'Members'}
            </button>
          )}

          {!isTrainer && (
            <>
                {hasPermission('scanner') && (
                   <button 
                      onClick={() => { setActiveView('scanner'); setIsSidebarMobileOpen(false); }}
                      style={{ 
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                      background: activeView === 'scanner' ? '#ecfdf5' : 'transparent',
                      color: activeView === 'scanner' ? '#10b981' : '#64748b',
                      fontWeight: activeView === 'scanner' ? 700 : 500,
                      transition: 'all 0.2s', width: '100%', textAlign: 'left'
                      }}
                  >
                      <Camera size={20} /> QR Check-in
                  </button>
                )}
                {hasPermission('leads') && (
                   <button 
                      onClick={() => { setActiveView('leads'); setIsSidebarMobileOpen(false); }}
                      style={{ 
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                      background: activeView === 'leads' ? '#fffbeb' : 'transparent',
                      color: activeView === 'leads' ? '#d97706' : '#64748b',
                      fontWeight: activeView === 'leads' ? 700 : 500,
                      transition: 'all 0.2s', width: '100%', textAlign: 'left'
                      }}
                  >
                      <TrendingUp size={20} /> Leads
                  </button>
                )}
            </>
          )}

          {hasPermission('schedule') && (
            <button 
              onClick={() => { setActiveView('schedule'); setIsSidebarMobileOpen(false); }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: activeView === 'schedule' ? '#eff6ff' : 'transparent',
                color: activeView === 'schedule' ? '#2563eb' : '#64748b',
                fontWeight: activeView === 'schedule' ? 700 : 500,
                transition: 'all 0.2s', width: '100%', textAlign: 'left'
              }}
            >
              <Calendar size={20} /> Schedule
            </button>
          )}

          {isTrainer && (
            <button 
              onClick={() => { setActiveView('analytics'); setIsSidebarMobileOpen(false); }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: activeView === 'analytics' ? '#f5f3ff' : 'transparent',
                color: activeView === 'analytics' ? '#7c3aed' : '#64748b',
                fontWeight: activeView === 'analytics' ? 700 : 500,
                transition: 'all 0.2s', width: '100%', textAlign: 'left'
              }}
            >
              <TrendingUp size={20} /> Performance Logs
            </button>
          )}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800 }}>
              {tenant?.name?.[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#0f172a' }}>{tenant?.name}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{staffRole}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#fef2f2', color: '#ef4444', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="staff-main" style={{ overflowY: 'auto' }}>
        
        {/* Top Header Section */}
        <header className="staff-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                    onClick={() => setIsSidebarMobileOpen(true)}
                    className="mobile-menu-btn"
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'none' }}
                >
                    <Menu size={20} />
                </button>
                <h1 className="header-title" style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {activeView === 'analytics' ? 'Performance Insights' : activeView === 'dashboard' ? 'Portal Command' : activeView === 'schedule' ? 'Daily Schedule' : activeView === 'scanner' ? 'QR Front Desk' : 'Member Directory'}
                </h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem' }}>
              {isTrainer 
                ? `Coaching session active for ${tenant?.name?.split(' ')[0]}. Manage your athletes.`
                : `Operations active. Welcome, ${tenant?.name?.split(' ')[0]}. Manage gym logistics.`
              }
            </p>
          </div>
          <div className="staff-header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             {(activeView === 'clients' || activeView === 'dashboard') && (
                <div className="staff-header-search" style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input 
                    type="text" 
                    placeholder="Search members..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', color: '#0f172a', width: '250px', outline: 'none', transition: 'all 0.2s' }}
                    className="search-input"
                    />
                </div>
             )}
              <div style={{ position: 'relative' }}>
                <button 
                  className="btn-icon-round" 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ 
                    background: showNotifications ? '#eff6ff' : '#ffffff', 
                    color: showNotifications ? '#2563eb' : '#64748b', 
                    border: '1px solid #e2e8f0',
                    width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative'
                  }}
                >
                  <Bell size={20} />
                  {notifications.filter(n => n.status === 'Unread').length > 0 && (
                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '0.6rem', fontWeight: 800, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                      {notifications.filter(n => n.status === 'Unread').length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="glass-card fade-in" style={{ position: 'absolute', top: '100%', right: 0, width: '300px', marginTop: '1rem', zIndex: 1000, padding: '1.5rem', maxHeight: '400px', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h4 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Alert Center</h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{notifications.length} Total</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {notifications.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No recent alerts.</p>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markNotificationRead(n.id)}
                            style={{ 
                              padding: '1rem', borderRadius: '12px', background: n.status === 'Unread' ? '#eff6ff' : '#f8fafc', 
                              border: `1px solid ${n.status === 'Unread' ? '#dbeafe' : '#e2e8f0'}`,
                              cursor: 'pointer', transition: 'all 0.2s'
                            }}
                          >
                            <p style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.25rem', color: n.status === 'Unread' ? '#2563eb' : '#0f172a' }}>{n.title}</p>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>{n.message}</p>
                            <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.5rem' }}>{new Date(n.createdAt).toLocaleTimeString()} • {new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
          </div>
        </header>

        {activeView === 'dashboard' && (
          <div className="fade-in">
            <div className="staff-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            {isTrainer ? (
                <>
                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <Users size={28} color="#2563eb" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 700 }}>Active Clients</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{myMembers.length}</p>
                  </div>

                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <Activity size={28} color="#ef4444" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 700 }}>Needs Attention</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{attentionNeededCount}</p>
                  </div>

                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <TrendingUp size={28} color="#10b981" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 700 }}>Weekly Retention</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>94%</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <UserCheck size={28} color="#2563eb" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 700 }}>Today's Check-ins</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{attendanceStats.todayCount}</p>
                  </div>

                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <Calendar size={28} color="#10b981" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 700 }}>Active Classes</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{classes.length}</p>
                  </div>

                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <CreditCard size={28} color="#f59e0b" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 700 }}>{isManager ? 'Total Revenue' : 'Active Members'}</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        {isManager ? `₹${payments.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}` : members.length}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeView === 'clients' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, color: '#0f172a' }}>
                    {isTrainer ? 'Client Directory' : 'Member Roster'} 
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{filteredMembers.length}</span>
                </h2>
                {!isTrainer && (
                    <button 
                        onClick={() => setIsAddMemberModalOpen(true)}
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                    >
                        <UserPlus size={18} /> New Member
                    </button>
                )}
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '5rem' }}>
                <div className="pulse-dot" style={{ margin: '0 auto 1.5rem', background: '#2563eb' }}></div>
                <p style={{ color: '#64748b', fontWeight: 600 }}>Syncing Roster...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', background: '#ffffff', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                <Users size={48} style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} />
                <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>No members found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredMembers.map(m => {
                  const isExpired = m.subscriptionEnd && new Date(m.subscriptionEnd) < new Date();
                  return (
                    <div key={m.id} className="glass-card hover-lift" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                           <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: isExpired ? '#fef2f2' : '#eff6ff', color: isExpired ? '#ef4444' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, border: `1px solid ${isExpired ? '#fee2e2' : '#dbeafe'}` }}>
                             {m.name?.[0]}
                           </div>
                           <div>
                              <p style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{m.name}</p>
                              <p style={{ fontSize: '0.85rem', color: isExpired ? '#ef4444' : '#64748b', margin: 0, fontWeight: isExpired ? 700 : 500 }}>{isExpired ? 'EXPIRED PLAN' : m.plan}</p>
                           </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                         <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>{isTrainer ? 'Consistency' : 'Status'}</p>
                            <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: isExpired ? '#ef4444' : (m.status === 'Active' || m.consistencyScore > 8 ? '#10b981' : '#f59e0b') }}>
                              {isTrainer ? `${m.consistencyScore} Days` : (isExpired ? 'Inactive' : m.status)}
                            </p>
                         </div>
                         <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>Plan Expiry</p>
                            <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: isExpired ? '#ef4444' : '#0f172a' }}>{m.subscriptionEnd ? new Date(m.subscriptionEnd).toLocaleDateString() : 'Lifetime'}</p>
                         </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {isTrainer ? (
                          <>
                            <button 
                              onClick={() => { setSelectedMember(m); setIsWellnessModalOpen(true); }}
                              style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                            >
                              <Heart size={16} /> Protocol
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleCheckIn(m.id, m.name)}
                              disabled={isExpired}
                              style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: isExpired ? '#f1f5f9' : '#10b981', color: isExpired ? '#94a3b8' : 'white', fontWeight: 800, cursor: isExpired ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                              <UserCheck size={16} /> {isExpired ? 'Lapsed Plan' : 'Check-in'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeView === 'scanner' && (
            <div className="fade-in">
                <div className="scanner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#ffffff', borderRadius: '32px', minHeight: '400px', justifyContent: 'center' }}>
                        {!isScanning && !scanStatus.message && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                    <Camera size={48} color="#2563eb" />
                                </div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>Front Desk Scanner</h3>
                                <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Point camera at member ID to verify access.</p>
                                <button 
                                    onClick={() => setIsScanning(true)}
                                    style={{ padding: '1rem 3rem', borderRadius: '16px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}
                                >
                                    Activate Camera
                                </button>
                            </div>
                        )}

                        <div id="staff-reader" style={{ width: '100%', borderRadius: '24px', overflow: 'hidden', display: isScanning ? 'block' : 'none', background: '#000' }}></div>

                        {scanStatus.message && (
                            <div style={{ textAlign: 'center', padding: '2rem', background: scanStatus.type === 'success' ? '#f0fdf4' : '#fef2f2', borderRadius: '24px', border: `1px solid ${scanStatus.type === 'success' ? '#10b981' : '#ef4444'}`, width: '100%' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: scanStatus.type === 'success' ? '#10b981' : '#ef4444' }}>{scanStatus.message}</h2>
                            </div>
                        )}
                    </div>

                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
                            <History size={20} color="#2563eb" /> Recent Scans
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {attendance.length === 0 ? (
                                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No recent activity.</p>
                            ) : (
                                attendance.slice(0, 8).map(record => (
                                    <div key={record.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                            {record.member?.name?.[0]}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{record.member?.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

                {activeView === 'schedule' && (
          <div className="fade-in">
             <div className="glass-card" style={{ padding: '2rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                   <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Class Sessions</h2>
                   <div style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem' }}>
                      Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                   </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                   {classes.map((c, i) => {
                      const confirmed = c.bookings?.filter(b => b.status === 'Confirmed').length || 0;
                      return (
                        <div key={i} style={{ padding: '1.5rem', borderRadius: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.2s' }} className="hover-lift">
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                              <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 <Clock size={20} color="#2563eb" />
                              </div>
                              <span style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>{c.time}</span>
                           </div>
                           <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a' }}>{c.title}</h4>
                           <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>{c.trainer}</p>
                           
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                              <div>
                                 <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.2rem', fontWeight: 700 }}>Occupancy</p>
                                 <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{confirmed} / {c.capacity}</p>
                              </div>
                              <div style={{ width: '40px', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                                 <div style={{ width: `${(confirmed / c.capacity) * 100}%`, height: '100%', background: '#2563eb' }}></div>
                              </div>
                           </div>
                        </div>
                      );
                   })}
                </div>
             </div>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="fade-in">
            <div className="glass-card" style={{ padding: '2.5rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Performance Logs</h2>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                     <button style={{ padding: '0.6rem 1rem', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Last 30 Days</button>
                     <button style={{ padding: '0.6rem 1rem', borderRadius: '10px', background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 700, cursor: 'pointer' }}>Export CSV</button>
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                  {[
                    { label: 'Weekly Sessions', value: totalSessionsConducted, icon: Zap, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Completion Rate', value: '88%', icon: Target, color: '#10b981', bg: '#f0fdf4' },
                    { label: 'Active Goals', value: '42', icon: Award, color: '#f59e0b', bg: '#fffbeb' },
                  ].map((stat, i) => (
                    <div key={i} style={{ padding: '1.5rem', borderRadius: '20px', background: stat.bg, border: `1px solid ${stat.color}20` }}>
                       <stat.icon size={20} color={stat.color} style={{ marginBottom: '1rem' }} />
                       <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>{stat.label}</p>
                       <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{stat.value}</p>
                    </div>
                  ))}
               </div>

               <div style={{ background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                     <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Top Performers</h3>
                  </div>
                  <div style={{ padding: '1rem' }}>
                     {getTopPerformers().map((m, i) => (
                       <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: i === 4 ? 'none' : '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#cbd5e1', width: '20px' }}>{i + 1}</span>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#2563eb' }}>{m.name[0]}</div>
                          <div style={{ flex: 1 }}>
                             <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{m.name}</p>
                             <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{m.plan}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                             <p style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: '#10b981' }}>{m.consistencyScore}</p>
                             <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Streak</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

      </main>

      {/* Booking Modal */}
      {isBookingModalOpen && (
          <div className="modal-overlay open" onClick={() => setIsBookingModalOpen(false)} style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
              <div className="modal-pane slide-pane" style={{ width: '450px', background: '#ffffff' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Book Session</h3>
                      <button onClick={() => setIsBookingModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} color="#0f172a" /></button>
                  </div>
                  <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input 
                        type="text" 
                        placeholder="Search member..." 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', color: '#0f172a', width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '60vh' }}>
                      {members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                              <div>
                                  <p style={{ fontWeight: 700, margin: 0, color: '#0f172a' }}>{m.name}</p>
                              </div>
                              <button 
                                onClick={() => handleBookMember(selectedClass.id, m.id)}
                                style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                              >
                                Book
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Wellness Modal */}
       {isTrainer && (
         <div className={`modal-overlay ${isWellnessModalOpen ? 'open' : ''}`} onClick={() => setIsWellnessModalOpen(false)} style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <div className="modal-pane slide-pane" style={{ width: '650px', background: '#ffffff' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                <button onClick={() => setIsWellnessModalOpen(false)} style={{ position: 'absolute', right: '2rem', top: '2rem', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#0f172a" />
                </button>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#eff6ff', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>
                    {selectedMember?.name?.[0]}
                </div>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{selectedMember?.name}</h3>
                </div>
                </div>
            </div>
            <div style={{ display: 'flex', background: '#f8fafc', padding: '0.5rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                {[
                { id: 'workouts', icon: Dumbbell, label: 'Workouts', color: '#2563eb' },
                { id: 'diets', icon: Utensils, label: 'Nutrition', color: '#10b981' },
                { id: 'notes', icon: FileText, label: 'Notes', color: '#f59e0b' },
                { id: 'progress', icon: TrendingUp, label: 'Telemetry', color: '#10b981' }
                ].map(t => (
                <button 
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{ 
                    flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: activeTab === t.id ? '#ffffff' : 'transparent',
                    color: activeTab === t.id ? t.color : '#64748b', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', minWidth: '120px', boxShadow: activeTab === t.id ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                    }}
                >
                    <t.icon size={16} /> {t.label}
                </button>
                ))}
            </div>
            <div className="modal-body" style={{ padding: '2rem', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                {activeTab === 'workouts' && (
                <div className="fade-in">
                    <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#1e40af' }}>Training Protocol</h4>
                        <form onSubmit={handleCreateWorkout} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <input name="title" placeholder="Workout Title (e.g. Push Day)" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', color: '#0f172a' }} required />
                            <textarea name="exercises" placeholder="Exercises (one per line)" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', color: '#0f172a', height: '120px' }} required></textarea>
                            <button type="submit" style={{ padding: '1rem', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>Deploy Protocol</button>
                        </form>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {wellnessData.workouts.map(w => (
                            <div key={w.id} style={{ padding: '1.5rem', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <h5 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>{w.title}</h5>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {w.exercises.map((ex, i) => (
                                        <span key={i} style={{ background: '#eff6ff', color: '#2563eb', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #dbeafe' }}>{ex.name}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                )}
                
                {activeTab === 'diets' && (
                <div className="fade-in">
                    <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#166534' }}>Nutrition Fuel</h4>
                        <form onSubmit={handleCreateDiet} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <input name="title" placeholder="Diet Plan Title" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', color: '#0f172a' }} required />
                            <textarea name="meals" placeholder="Meal structure (one per line)" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', color: '#0f172a', height: '120px' }} required></textarea>
                            <button type="submit" style={{ padding: '1rem', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>Assign Diet</button>
                        </form>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {wellnessData.diets.map(d => (
                            <div key={d.id} style={{ padding: '1.5rem', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <h5 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>{d.title}</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {d.meals.map((m, i) => (
                                        <p key={i} style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>• {m.content}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                )}

                {activeTab === 'notes' && (
                <div className="fade-in">
                    <h4 style={{ fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Confidential Observations</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>These notes are encrypted and only visible to you. Members cannot see this data.</p>
                    <textarea 
                        placeholder="Document form issues, injuries, or personal coaching goals..."
                        style={{ width: '100%', height: '200px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', color: '#0f172a', resize: 'none', marginBottom: '1.5rem' }}
                    ></textarea>
                    <button style={{ padding: '1rem 2rem', borderRadius: '12px', border: 'none', background: '#f59e0b', color: 'white', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}>Lock Coaching Note</button>
                </div>
                )}
                {activeTab === 'progress' && (
                <div className="fade-in">
                    <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Performance Telemetry</h4>
                    {wellnessData.progress.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <TrendingUp size={48} style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} />
                        <p style={{ color: '#64748b', fontWeight: 600 }}>No telemetry data submitted by client yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {wellnessData.progress.map(log => (
                            <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{log.weight} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>kg</span></p>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>{new Date(log.date).toLocaleDateString()} · Body Fat: {log.bodyFat}%</p>
                            </div>
                            <TrendingUp size={24} color="#10b981" />
                            </div>
                        ))}
                        </div>
                    )}
                </div>
            </div>
         </div>
       )}

        {/* Modular Modals */}
        <AddMemberModal 
            isOpen={isAddMemberModalOpen} 
            onClose={() => setIsAddMemberModalOpen(false)} 
            onSubmit={handleAddMember} 
            selectedMember={selectedMember} 
            plans={plans} 
        />

        <EditMemberModal 
            isOpen={isEditMemberModalOpen} 
            onClose={() => setIsEditMemberModalOpen(false)} 
            onSubmit={handleUpdateMember} 
            member={selectedMember}
        />

        <AddLeadModal 
            isOpen={isAddLeadModalOpen} 
            onClose={() => setIsAddLeadModalOpen(false)} 
            onSubmit={handleAddLead} 
        />

        <PaymentsModal 
            isOpen={isPaymentsModalOpen} 
            onClose={() => setIsPaymentsModalOpen(false)} 
            payments={payments} 
        />

        {/* Toast Notification */}
        {toast && (
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem 2rem', borderRadius: '16px', background: toast.type === 'success' ? '#10b981' : '#ef4444', color: 'white', fontWeight: 800, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                {toast.message}
                <button onClick={() => setToast(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '1rem' }}><X size={16} /></button>
            </div>
        )}
    </div>
  );
}
