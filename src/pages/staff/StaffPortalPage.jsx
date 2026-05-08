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
  UserCog, Lock, Unlock, RefreshCw
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    ? (members || []).filter(m => m.trainerId === tenant?.id)
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
      

      {/* Premium Sidebar */}
      <aside style={{ width: '280px', background: '#0c0c0e', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 0.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
            <Dumbbell size={22} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>CORE<span style={{ color: '#6366f1' }}>FIT</span></span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button 
            onClick={() => setActiveView('dashboard')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: activeView === 'dashboard' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: activeView === 'dashboard' ? '#6366f1' : '#94a3b8',
              fontWeight: activeView === 'dashboard' ? 700 : 500,
              transition: 'all 0.2s'
            }}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          
          {hasPermission('members') && (
            <button 
              onClick={() => setActiveView('clients')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: activeView === 'clients' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: activeView === 'clients' ? '#6366f1' : '#94a3b8',
                fontWeight: activeView === 'clients' ? 700 : 500,
                transition: 'all 0.2s'
              }}
            >
              <Users size={20} /> {isTrainer ? 'My Clients' : 'Members'}
            </button>
          )}

          {!isTrainer && (
            <>
                {hasPermission('scanner') && (
                  <button 
                      onClick={() => setActiveView('scanner')}
                      style={{ 
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                      background: activeView === 'scanner' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      color: activeView === 'scanner' ? '#10b981' : '#94a3b8',
                      fontWeight: activeView === 'scanner' ? 700 : 500,
                      transition: 'all 0.2s'
                      }}
                  >
                      <Camera size={20} /> QR Check-in
                  </button>
                )}
                {hasPermission('leads') && (
                  <button 
                      onClick={() => setActiveView('leads')}
                      style={{ 
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                      background: activeView === 'leads' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                      color: activeView === 'leads' ? '#f59e0b' : '#94a3b8',
                      fontWeight: activeView === 'leads' ? 700 : 500,
                      transition: 'all 0.2s'
                      }}
                  >
                      <TrendingUp size={20} /> Leads
                  </button>
                )}
                {isManager && (
                  <>
                    <button 
                        onClick={() => setActiveView('team')}
                        style={{ 
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        background: activeView === 'team' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                        color: activeView === 'team' ? '#8b5cf6' : '#94a3b8',
                        fontWeight: activeView === 'team' ? 700 : 500,
                        transition: 'all 0.2s'
                        }}
                    >
                        <ShieldCheck size={20} /> Team Management
                    </button>
                    <button 
                        onClick={() => setActiveView('plans')}
                        style={{ 
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        background: activeView === 'plans' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        color: activeView === 'plans' ? '#10b981' : '#94a3b8',
                        fontWeight: activeView === 'plans' ? 700 : 500,
                        transition: 'all 0.2s'
                        }}
                    >
                        <Zap size={20} /> Plans & Pricing
                    </button>
                  </>
                )}
            </>
          )}

          {hasPermission('schedule') && (
            <button 
              onClick={() => setActiveView('schedule')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: activeView === 'schedule' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: activeView === 'schedule' ? '#6366f1' : '#94a3b8',
                fontWeight: activeView === 'schedule' ? 700 : 500,
                transition: 'all 0.2s'
              }}
            >
              <Calendar size={20} /> Schedule
            </button>
          )}

          {isTrainer && (
            <button 
              onClick={() => setActiveView('analytics')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: activeView === 'analytics' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: activeView === 'analytics' ? '#8b5cf6' : '#94a3b8',
                fontWeight: activeView === 'analytics' ? 700 : 500,
                transition: 'all 0.2s'
              }}
            >
              <TrendingUp size={20} /> Performance Logs
            </button>
          )}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800 }}>
              {tenant?.name?.[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tenant?.name}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{staffRole}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        
        {/* Top Header Section */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {activeView === 'analytics' ? 'Performance Insights' : activeView === 'dashboard' ? 'Portal Command' : activeView === 'schedule' ? 'Daily Schedule' : activeView === 'scanner' ? 'QR Front Desk' : 'Member Directory'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
              {isTrainer 
                ? `Coaching session active for ${tenant?.name?.split(' ')[0]}. Manage your athletes.`
                : `Operations active. Welcome, ${tenant?.name?.split(' ')[0]}. Manage gym logistics.`
              }
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             {(activeView === 'clients' || activeView === 'dashboard') && (
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                    type="text" 
                    placeholder="Search members..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', color: 'white', width: '300px' }}
                    />
                </div>
             )}
              <div style={{ position: 'relative' }}>
                <button 
                  className="btn-icon-round" 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ 
                    background: showNotifications ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)', 
                    color: showNotifications ? '#6366f1' : '#fff', 
                    border: '1px solid rgba(255,255,255,0.1)' 
                  }}
                >
                  <Bell size={20} />
                  {notifications.filter(n => n.status === 'Unread').length > 0 && (
                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '0.6rem', fontWeight: 800, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #000' }}>
                      {notifications.filter(n => n.status === 'Unread').length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="glass-card fade-in" style={{ position: 'absolute', top: '100%', right: 0, width: '350px', marginTop: '1rem', zIndex: 1000, padding: '1.5rem', maxHeight: '500px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h4 style={{ margin: 0, fontWeight: 800 }}>Alert Center</h4>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{notifications.length} Total</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {notifications.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No recent alerts.</p>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markNotificationRead(n.id)}
                            style={{ 
                              padding: '1rem', borderRadius: '12px', background: n.status === 'Unread' ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.02)', 
                              border: `1px solid ${n.status === 'Unread' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                              cursor: 'pointer', transition: 'all 0.2s'
                            }}
                          >
                            <p style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.25rem', color: n.status === 'Unread' ? '#fff' : '#94a3b8' }}>{n.title}</p>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>{n.message}</p>
                            <p style={{ fontSize: '0.65rem', color: '#475569', marginTop: '0.5rem' }}>{new Date(n.createdAt).toLocaleTimeString()} • {new Date(n.createdAt).toLocaleDateString()}</p>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              
              {isTrainer ? (
                <>
                  <div style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <Users size={28} color="#6366f1" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Active Clients</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{myMembers.length}</p>
                  </div>

                  <div style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(244, 63, 94, 0.1))', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <Activity size={28} color="#ef4444" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Needs Attention</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{attentionNeededCount}</p>
                  </div>

                  <div style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <TrendingUp size={28} color="#10b981" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Weekly Retention</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>94%</p>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <UserCheck size={28} color="#6366f1" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Today's Check-ins</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{attendanceStats.todayCount}</p>
                  </div>

                  <div style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <Calendar size={28} color="#10b981" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Active Classes</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{classes.length}</p>
                  </div>

                  <div style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <CreditCard size={28} color="#f59e0b" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{isManager ? 'Total Revenue' : 'Active Members'}</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>
                        {isManager ? `₹${payments.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}` : members.length}
                    </p>
                  </div>

                  <div 
                    onClick={runRetentionScan}
                    style={{ 
                        padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(37, 99, 235, 0.1))', 
                        border: '1px solid rgba(99, 102, 241, 0.2)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center'
                    }}
                    className="hover-lift"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isScanningRetention ? <RefreshCw size={24} color="#6366f1" className="spin" /> : <Zap size={24} color="#6366f1" />}
                        </div>
                        <div style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800 }}>
                            RETENTION
                        </div>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{isScanningRetention ? 'Scanning...' : 'Run Expiry Check'}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Detect memberships expiring in the next 7 days.</p>
                  </div>
                </>
              )}
            </div>

          </div>
        )}

        {activeView === 'clients' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                    {isTrainer ? 'Client Directory' : 'Member Roster'} 
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{filteredMembers.length}</span>
                </h2>
                {!isTrainer && (
                    <button 
                        onClick={() => setIsAddMemberModalOpen(true)}
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#6366f1', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <UserPlus size={18} /> New Member
                    </button>
                )}
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '5rem' }}>
                <div className="pulse-dot" style={{ margin: '0 auto 1.5rem' }}></div>
                <p style={{ color: '#94a3b8' }}>Syncing Roster...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Users size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No members found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {filteredMembers.map(m => {
                  const isExpired = m.subscriptionEnd && new Date(m.subscriptionEnd) < new Date();
                  return (
                    <div key={m.id} className="glass-card hover-lift" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                           <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: isExpired ? '#ef4444' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                             {m.name?.[0]}
                           </div>
                           <div>
                              <p style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{m.name}</p>
                              <p style={{ fontSize: '0.85rem', color: isExpired ? '#ef4444' : '#94a3b8', margin: 0, fontWeight: isExpired ? 700 : 400 }}>{isExpired ? 'EXPIRED PLAN' : m.plan}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => { setSelectedMember(m); setIsEditMemberModalOpen(true); }}
                          className="btn-icon-round" 
                          style={{ background: 'transparent', cursor: 'pointer' }}
                        >
                          <MoreVertical size={18} color="#94a3b8" />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                         <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{isTrainer ? 'Consistency' : 'Status'}</p>
                            <p style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: isExpired ? '#ef4444' : (m.status === 'Active' || m.consistencyScore > 8 ? '#10b981' : '#f59e0b') }}>
                              {isTrainer ? `${m.consistencyScore} Days` : (isExpired ? 'Inactive' : m.status)}
                            </p>
                         </div>
                         <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Plan Expiry</p>
                            <p style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: isExpired ? '#ef4444' : 'white' }}>{m.subscriptionEnd ? new Date(m.subscriptionEnd).toLocaleDateString() : 'Lifetime'}</p>
                         </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {isTrainer ? (
                          <>
                            <button 
                              onClick={() => { setSelectedMember(m); setIsWellnessModalOpen(true); }}
                              style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                              <Heart size={16} /> Protocol
                            </button>
                            <button 
                              style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                            >
                              <MessageSquare size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleCheckIn(m.id, m.name)}
                              disabled={isExpired}
                              style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: isExpired ? '#334155' : '#10b981', color: 'white', fontWeight: 700, cursor: isExpired ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                              <UserCheck size={16} /> {isExpired ? 'Lapsed Plan' : 'Check-in'}
                            </button>
                            {hasPermission('payments') && (
                              <button 
                                onClick={() => { setSelectedMember(m); setIsPaymentsModalOpen(true); }}
                                style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                              >
                                <CreditCard size={16} />
                              </button>
                            )}
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

        {activeView === 'leads' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Enquiry Board</h2>
                <button 
                    onClick={() => setIsAddLeadModalOpen(true)}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#f59e0b', color: '#000', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Star size={18} /> New Enquiry
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {leads.map(lead => (
                    <div key={lead.id} className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{lead.name}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>{lead.status}</span>
                                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.75rem' }}>{lead.source}</span>
                                </div>
                            </div>
                            <button onClick={() => handleConvertToMember(lead)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Convert</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
                                <Mail size={16} /> <span style={{ fontSize: '0.9rem' }}>{lead.email}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
                                <Phone size={16} /> <span style={{ fontSize: '0.9rem' }}>{lead.phone}</span>
                            </div>
                        </div>

                        {lead.notes && (
                            <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: 0, padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                "{lead.notes}"
                            </p>
                        )}
                    </div>
                ))}
                {leads.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem' }}>
                        <TrendingUp size={48} style={{ opacity: 0.05, marginBottom: '1.5rem' }} />
                        <p style={{ color: '#94a3b8' }}>No enquiries found. Start capturing leads to grow revenue!</p>
                    </div>
                )}
            </div>
          </div>
        )}

        {activeView === 'scanner' && (
            <div className="fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#000', borderRadius: '32px', minHeight: '500px', justifyContent: 'center' }}>
                        {!isScanning && !scanStatus.message && (
                            <div style={{ textAlign: 'center' }}>
                                <Camera size={64} color="#6366f1" style={{ marginBottom: '2rem', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Front Desk Scanner</h3>
                                <p style={{ color: '#94a3b8', marginBottom: '2.5rem' }}>Point the camera at the member's Digital ID to verify access.</p>
                                <button 
                                    onClick={() => setIsScanning(true)}
                                    style={{ padding: '1rem 3rem', borderRadius: '16px', background: '#6366f1', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '1.1rem' }}
                                >
                                    Activate Camera
                                </button>
                            </div>
                        )}

                        <div id="staff-reader" style={{ width: '100%', borderRadius: '24px', overflow: 'hidden', display: isScanning ? 'block' : 'none' }}></div>

                        {scanStatus.message && (
                            <div style={{ textAlign: 'center', padding: '2rem', background: scanStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '24px', border: `1px solid ${scanStatus.type === 'success' ? '#10b981' : '#ef4444'}`, width: '100%' }}>
                                {scanStatus.type === 'success' ? <CheckCircle2 size={64} color="#10b981" /> : <XCircle size={64} color="#ef4444" />}
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '1.5rem', color: '#fff' }}>{scanStatus.message}</h2>
                                <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Automatic reset in 3 seconds...</p>
                            </div>
                        )}
                        
                        {isScanning && (
                            <button 
                                onClick={() => setIsScanning(false)}
                                style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '12px', cursor: 'pointer' }}
                            >
                                Deactivate
                            </button>
                        )}
                    </div>

                    <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <History size={20} color="#6366f1" /> Recent Scans
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {attendance.slice(0, 8).map(record => (
                                <div key={record.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#6366f1' }}>
                                        {record.member?.name?.[0]}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{record.member?.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <CheckCircle2 size={16} color="#10b981" />
                                </div>
                            ))}
                            {attendance.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No scans recorded yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeView === 'schedule' && (
          <div className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Gym Schedule</h2>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '12px' }}>
                   <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 700 }}>Today</button>
                   <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94a3b8', fontWeight: 500 }}>Week</button>
                </div>
             </div>

             <div className="glass-card" style={{ padding: 0, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
               {classes.length === 0 ? (
                 <div style={{ padding: '5rem', textAlign: 'center' }}>
                    <Calendar size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                    <p style={{ color: '#94a3b8' }}>No sessions scheduled for today.</p>
                 </div>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                   {classes.map((c, i) => {
                     const confirmed = c.bookings?.filter(b => b.status === 'Confirmed').length || 0;
                     const isFull = confirmed >= c.capacity;
                     return (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem 2rem', borderBottom: i < classes.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'all 0.2s' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6366f1', width: '80px' }}>{c.time}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{c.title}</p>
                          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Coach: {c.trainer} · {c.capacity} slots</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
                                <Users size={16} color={isFull ? '#fbbf24' : '#10b981'} />
                                <span style={{ fontWeight: 700 }}>{confirmed} / {c.capacity}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: isFull ? '#fbbf24' : '#10b981', fontWeight: 600, textTransform: 'uppercase' }}>{isFull ? 'Waitlist Active' : 'Slots Available'}</span>
                            </div>
                            {isStaff && (
                                <button 
                                    onClick={() => { setSelectedClass(c); setIsBookingModalOpen(true); }}
                                    style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <CalendarPlus size={16} /> Book
                                </button>
                            )}
                            <ChevronRight size={20} color="#94a3b8" />
                        </div>
                      </div>
                     );
                   })}
                 </div>
               )}
             </div>
          </div>
        )}

        {isTrainer && activeView === 'analytics' && (
          <div className="fade-in">
             <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ padding: '2.5rem', borderRadius: '32px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <Zap size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Total Transformation Impact</h2>
                        <div style={{ display: 'flex', gap: '3rem' }}>
                           <div>
                              <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>SESSIONS CONDUCTED</p>
                              <p style={{ fontSize: '2.5rem', fontWeight: 900 }}>{totalSessionsConducted}</p>
                           </div>
                           <div>
                              <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>AVG CONSISTENCY</p>
                              <p style={{ fontSize: '2.5rem', fontWeight: 900 }}>82%</p>
                           </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Star size={20} color="#fbbf24" /> Top Performing Clients
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                           {getTopPerformers().map((m, i) => (
                             <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                   <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fbbf24' }}>{i+1}</div>
                                   <p style={{ fontWeight: 700, margin: 0 }}>{m.name}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                   <p style={{ fontWeight: 800, margin: 0, color: '#10b981' }}>{m.consistencyScore} Visits</p>
                                   <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Active Profile</p>
                                </div>
                             </div>
                           ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Retention Health</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#94a3b8' }}>Consistent (10+ visits)</span>
                            <span style={{ fontWeight: 700 }}>{myMembers.filter(m => m.consistencyScore >= 10).length}</span>
                         </div>
                         <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${(myMembers.filter(m => m.consistencyScore >= 10).length / myMembers.length) * 100}%`, height: '100%', background: '#10b981' }} />
                         </div>

                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                            <span style={{ color: '#94a3b8' }}>At Risk ({`< 5 visits`})</span>
                            <span style={{ fontWeight: 700, color: '#ef4444' }}>{attentionNeededCount}</span>
                         </div>
                         <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${(attentionNeededCount / myMembers.length) * 100}%`, height: '100%', background: '#ef4444' }} />
                         </div>
                      </div>
                   </div>

                   <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <Award size={40} color="#8b5cf6" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Elite Coach Status</h4>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>You are in the top 15% of coaches this month based on client retention.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

      </main>

      {/* Booking Modal (Receptionist Only) */}
      {isBookingModalOpen && (
          <div className="modal-overlay open" onClick={() => setIsBookingModalOpen(false)}>
              <div className="slide-pane" style={{ width: '450px' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Book into {selectedClass?.title}</h3>
                      <button onClick={() => setIsBookingModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} color="#fff" /></button>
                  </div>
                  <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Search member to book..." 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', color: 'white', width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '60vh' }}>
                      {members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                              <div>
                                  <p style={{ fontWeight: 700, margin: 0 }}>{m.name}</p>
                                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{m.plan}</p>
                              </div>
                              <button 
                                onClick={() => handleBookMember(selectedClass.id, m.id)}
                                style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Book
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Wellness Modal (Coaches Only) */}
       {isTrainer && (
         <div className={`modal-overlay ${isWellnessModalOpen ? 'open' : ''}`} onClick={() => setIsWellnessModalOpen(false)}>
            <div className="slide-pane" style={{ width: '650px', background: '#0c0c0e' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                <button onClick={() => setIsWellnessModalOpen(false)} style={{ position: 'absolute', right: '2rem', top: '2rem', background: 'rgba(255,255,255,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#fff" />
                </button>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                    {selectedMember?.name?.[0]}
                </div>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{selectedMember?.name}</h3>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Protocol ID: {selectedMember?.id?.substring(0, 8).toUpperCase()}</p>
                </div>
                </div>
            </div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                { id: 'workouts', icon: Dumbbell, label: 'Workouts', color: '#6366f1' },
                { id: 'diets', icon: Utensils, label: 'Nutrition', color: '#10b981' },
                { id: 'progress', icon: TrendingUp, label: 'Results', color: '#8b5cf6' },
                { id: 'notes', icon: Edit3, label: 'Internal', color: '#f59e0b' }
                ].map(t => (
                <button 
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{ 
                    flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: activeTab === t.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: activeTab === t.id ? t.color : '#94a3b8', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                >
                    <t.icon size={16} /> {t.label}
                </button>
                ))}
            </div>
            <div className="modal-body" style={{ padding: '2rem', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                {activeTab === 'workouts' && (
                <div className="fade-in">
                    <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '2rem', borderRadius: '24px', marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={20} color="#6366f1" /> Deploy Training Protocol</h4>
                        <form onSubmit={handleCreateWorkout} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div className="form-group">
                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>PROGRAM TITLE</label>
                            <input type="text" name="title" placeholder="e.g. Strength Phase - Week 1" required style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', color: 'white', width: '100%' }} />
                          </div>
                          <div className="form-group">
                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>EXERCISE SEQUENCE</label>
                            <textarea name="exercises" placeholder="Ex: Bicep Curls 3 sets 10 reps&#10;Ex: Squats 4 sets 12 reps..." rows="6" required style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', color: 'white', resize: 'none', width: '100%', lineHeight: '1.6' }}></textarea>
                          </div>
                          <button type="submit" style={{ padding: '1rem', borderRadius: '12px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)' }}>
                            <ShieldCheck size={18} /> Publish to Athlete Dashboard
                          </button>
                        </form>
                    </div>
                    <h4 style={{ marginBottom: '1rem', fontWeight: 800 }}>Prescribed Sessions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {wellnessData.workouts.map(w => (
                        <div key={w.id} style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>{w.title}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {w.exercises?.map((ex, i) => (
                                <span key={i} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>{ex.name}</span>
                            ))}
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
                )}
                {activeTab === 'diets' && (
                <div className="fade-in">
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '2rem', borderRadius: '24px', marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Utensils size={20} color="#10b981" /> Elite Nutrition Deployment</h4>
                        
                        {/* Elite Macro Calculator - Live Intelligence */}
                        <div style={{ padding: '1.5rem', background: '#09090b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', letterSpacing: '1px' }}>LIVE RATIO CALCULATION</span>
                                <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 900 }}>EST. {(macroCalc.p * 4 + macroCalc.c * 4 + macroCalc.f * 9)} KCAL</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>PROTEIN (G)</label>
                                    <input type="number" value={macroCalc.p} onChange={e => setMacroCalc({...macroCalc, p: parseInt(e.target.value) || 0})} style={{ background: 'transparent', border: '1px solid rgba(139, 92, 246, 0.3)', color: 'white', padding: '0.5rem', borderRadius: '8px', width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>CARBS (G)</label>
                                    <input type="number" value={macroCalc.c} onChange={e => setMacroCalc({...macroCalc, c: parseInt(e.target.value) || 0})} style={{ background: 'transparent', border: '1px solid rgba(59, 130, 246, 0.3)', color: 'white', padding: '0.5rem', borderRadius: '8px', width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>FATS (G)</label>
                                    <input type="number" value={macroCalc.f} onChange={e => setMacroCalc({...macroCalc, f: parseInt(e.target.value) || 0})} style={{ background: 'transparent', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'white', padding: '0.5rem', borderRadius: '8px', width: '100%' }} />
                                </div>
                            </div>
                            {/* Dynamic Ratio Bar */}
                            <div style={{ display: 'flex', gap: '4px', marginTop: '1.25rem', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ flex: (macroCalc.p * 4) || 1, background: '#8b5cf6', transition: 'all 0.5s ease' }}></div>
                                <div style={{ flex: (macroCalc.c * 4) || 1, background: '#3b82f6', transition: 'all 0.5s ease' }}></div>
                                <div style={{ flex: (macroCalc.f * 9) || 1, background: '#f59e0b', transition: 'all 0.5s ease' }}></div>
                            </div>
                        </div>

                        <form onSubmit={handleCreateDiet} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div className="form-group">
                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>PROTOCOL NAME</label>
                            <input type="text" name="title" placeholder="e.g. Cutting Macros - 2200 kcal" required style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', color: 'white', width: '100%' }} />
                          </div>
                          <div className="form-group">
                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>MEAL STRUCTURE</label>
                            <textarea name="meals" placeholder="Meal 1: Oats & Whey&#10;Meal 2: Chicken & Rice..." rows="4" required style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', color: 'white', resize: 'none', width: '100%', lineHeight: '1.6' }}></textarea>
                          </div>
                          <button type="submit" style={{ padding: '1rem', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}>
                            <Target size={18} /> Lock Transformation Plan
                          </button>
                        </form>
                    </div>
                    <h4 style={{ marginBottom: '1rem', fontWeight: 800 }}>Active Diet Logs</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {wellnessData.diets.map(d => (
                        <div key={d.id} style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>{d.title}</p>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            {d.meals?.map((m, i) => <p key={i} style={{ margin: '0 0 0.5rem 0' }}>• {m.content}</p>)}
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
                )}
                {activeTab === 'notes' && (
                <div className="fade-in">
                    <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Confidential Observations</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>These notes are encrypted and only visible to you. Members cannot see this data.</p>
                    <textarea 
                        placeholder="Document form issues, injuries, or personal coaching goals..."
                        style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.25rem', color: 'white', resize: 'none', marginBottom: '1.5rem' }}
                    ></textarea>
                    <button style={{ padding: '1rem 2rem', borderRadius: '12px', border: 'none', background: '#f59e0b', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Lock Coaching Note</button>
                </div>
                )}
                {activeTab === 'progress' && (
                <div className="fade-in">
                    <h4 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Performance Telemetry</h4>
                    {wellnessData.progress.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <TrendingUp size={48} style={{ opacity: 0.05, marginBottom: '1.5rem' }} />
                        <p style={{ color: '#94a3b8' }}>No telemetry data submitted by client yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {wellnessData.progress.map(log => (
                            <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{log.weight} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>kg</span></p>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>{new Date(log.date).toLocaleDateString()} · Body Fat: {log.bodyFat}%</p>
                            </div>
                            <TrendingUp size={24} color="#10b981" />
                            </div>
                        ))}
                        </div>
                    )}
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
            selectedMember={selectedMember} 
            plans={plans} 
        />

        <AddLeadModal 
            isOpen={isAddLeadModalOpen} 
            onClose={() => setIsAddLeadModalOpen(false)} 
            onSubmit={handleAddLead} 
        />

        <PaymentsModal 
            isOpen={isPaymentsModalOpen} 
            onClose={() => setIsPaymentsModalOpen(false)} 
            member={selectedMember} 
            payments={filteredPayments} 
        />

        {/* Toast Notification */}
        {toast && (
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem 2rem', borderRadius: '16px', background: toast.type === 'success' ? '#10b981' : '#ef4444', color: 'white', fontWeight: 800, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                {toast.message}
                <button onClick={() => setToast(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '1rem' }}><X size={16} /></button>
            </div>
        )}
    </div>
  );
}
