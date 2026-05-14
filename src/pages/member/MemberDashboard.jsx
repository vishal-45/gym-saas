import React, { useState, useEffect } from 'react';
import { useGymContext } from '../../context/GymContext';
import { LogOut, Dumbbell, Calendar, Award, X, Users, CheckCircle, Plus, QrCode, BookOpen, LineChart, Play, FileText, ExternalLink, CreditCard, Bell, LayoutDashboard, Heart, History, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { QRCodeCanvas } from 'qrcode.react';

export default function MemberDashboard() {
  const { 
    tenant, logout, classes, bookClass, myBookings, fetchMyBookings, isClassesLoading,
    vault, isVaultLoading, fetchVaultResources, createPaymentOrder, verifyPayment,
    notifications, fetchNotifications, markNotificationRead,
    fetchMemberWellness, addProgress, payments, fetchPaymentHistory, attendance, loadAttendance
  } = useGymContext();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({ id: null, loading: false });
  const [isPaying, setIsPaying] = useState(false);
  const [wellnessData, setWellnessData] = useState({ workouts: [], diets: [], progress: [] });
  const [isWellnessLoading, setIsWellnessLoading] = useState(false);
  const [progressForm, setProgressForm] = useState({ weight: '', bodyFat: '', notes: '' });
  const [isLoggingProgress, setIsLoggingProgress] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      fetchMyBookings();
      fetchVaultResources();
      fetchNotifications();
      fetchPaymentHistory();
      loadAttendance();
      loadWellness();
    }
  }, [tenant]);

  const loadWellness = async () => {
    setIsWellnessLoading(true);
    const data = await fetchMemberWellness(tenant.id);
    setWellnessData(data);
    setIsWellnessLoading(false);
  };

  const handleLogProgress = async (e) => {
    e.preventDefault();
    setIsLoggingProgress(true);
    const res = await addProgress({ ...progressForm, memberId: tenant.id });
    if (res) {
        alert("Progress logged successfully!");
        setProgressForm({ weight: '', bodyFat: '', notes: '' });
        loadWellness();
    }
    setIsLoggingProgress(false);
  };

  const handlePayment = async () => {
    setIsPaying(true);
    // Mock mapping for demo
    const amount = tenant?.plan === 'Premium Pass' ? 89 : (tenant?.plan === 'Basic Month' ? 49 : 15);
    
    const orderData = await createPaymentOrder(amount, tenant.id);
    if(orderData.error) {
      alert(orderData.error);
      setIsPaying(false);
      return;
    }

    const options = {
      key: "rzp_test_placeholder",
      amount: orderData.amount,
      currency: orderData.currency,
      name: "CoreFitness Gym",
      description: `Subscription for ${tenant.plan}`,
      order_id: orderData.orderId,
      handler: async (response) => {
        const verifyRes = await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
        if(verifyRes.success) {
          alert("Payment Successful! Your subscription is active.");
        }
      },
      prefill: {
        name: tenant.name,
      },
      theme: { color: "#8b5cf6" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setIsPaying(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/member-login');
  };

  const handleBook = async (classId) => {
    setBookingStatus({ id: classId, loading: true });
    const res = await bookClass(classId);
    if (!res.success) {
        alert(res.error);
    }
    setBookingStatus({ id: null, loading: false });
  };

  return (
    <>
      <style>{`
        .premium-bg {
          background: radial-gradient(circle at top left, #1a103c 0%, #09090b 50%),
                      radial-gradient(circle at bottom right, #0d1b2a 0%, #09090b 50%);
          position: relative;
          overflow: hidden;
        }
        .premium-bg::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)" opacity="0.4"/></svg>');
          opacity: 0.04;
          pointer-events: none;
        }
        .glass-card-premium {
          background: rgba(22, 25, 31, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 28px;
          padding: 2.5rem;
          position: relative;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          overflow: hidden;
        }
        .glass-card-premium::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        }
        .glass-card-premium:hover {
          transform: translateY(-8px);
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 25px 50px rgba(139, 92, 246, 0.15);
        }
        .membership-card-glow {
          background: linear-gradient(145deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.02) 100%);
          box-shadow: inset 0 0 0 1px rgba(139, 92, 246, 0.2), 0 15px 35px rgba(0,0,0,0.4);
        }
        .membership-card-glow:hover {
          box-shadow: inset 0 0 0 1px rgba(139, 92, 246, 0.4), 0 20px 50px rgba(139, 92, 246, 0.2);
        }
        .animate-gradient-text {
          background: linear-gradient(to right, #c4b5fd, #8b5cf6, #3b82f6, #c4b5fd);
          background-size: 200% auto;
          color: #fff;
          background-clip: text;
          text-fill-color: transparent;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 4s linear infinite;
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
        .activity-item-premium {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: all 0.3s ease;
        }
        .activity-item-premium:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateX(6px);
        }
        .floating-icon {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .member-main {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
          padding: 2rem 3rem;
          transition: all 0.3s ease;
        }
        .member-sidebar {
          width: 260px;
          background: rgba(15, 17, 21, 0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255,255,255,0.05);
          position: fixed;
          height: 100vh;
          display: flex;
          flex-direction: column;
          z-index: 200;
          transition: transform 0.3s ease;
        }
        @media (max-width: 1024px) {
          .member-sidebar {
            transform: translateX(-100%);
          }
          .member-sidebar.open {
            transform: translateX(0);
          }
          .member-main {
            margin-left: 0 !important;
            padding: 1rem !important;
          }
          .dashboard-grid, .wellness-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .header-title {
            font-size: 2.2rem !important;
          }
        }
        .nav-button {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          color: #94a3b8;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 12px;
          margin-bottom: 0.25rem;
        }
        .nav-button:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }
        .nav-button.active {
          background: #8b5cf6;
          color: #fff;
          box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
        }
      `}</style>
      <div className={`premium-bg ${(showExplore || showQR) ? 'blur-background' : ''}`} style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 195, backdropFilter: 'blur(4px)' }}
          />
        )}

        {/* Sidebar */}
        <aside className={`member-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div style={{ padding: '2.5rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Dumbbell color="#8b5cf6" size={32} />
              <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-1px' }}>Member Portal</span>
            </div>
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav style={{ padding: '0 1rem', flex: 1 }}>
            <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Overview
            </button>
            <button onClick={() => { setActiveTab('wellness'); setIsSidebarOpen(false); }} className={`nav-button ${activeTab === 'wellness' ? 'active' : ''}`}>
              <Heart size={20} /> Wellness
            </button>
            <button onClick={() => { setActiveTab('vault'); setIsSidebarOpen(false); }} className={`nav-button ${activeTab === 'vault' ? 'active' : ''}`}>
              <BookOpen size={20} /> The Vault
            </button>
            <button onClick={() => { setActiveTab('progress'); setIsSidebarOpen(false); }} className={`nav-button ${activeTab === 'progress' ? 'active' : ''}`}>
              <LineChart size={20} /> Progress
            </button>
            <button onClick={() => { setActiveTab('history'); setIsSidebarOpen(false); }} className={`nav-button ${activeTab === 'history' ? 'active' : ''}`}>
              <History size={20} /> History
            </button>
          </nav>

          <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setShowQR(true)} className="nav-button" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.05)', marginBottom: '0.5rem' }}>
              <QrCode size={20} /> Digital ID
            </button>
            <button onClick={handleLogout} className="nav-button" style={{ color: '#ef4444' }}>
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </aside>

        <main className="member-main">
          {/* Mobile Header */}
          <div className="mobile-header" style={{ display: 'none', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(15, 17, 21, 0.5)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Dumbbell color="#8b5cf6" size={24} />
              <span style={{ fontWeight: 800 }}>CoreFit</span>
            </div>
          </div>
          
          {activeTab === 'overview' && (
            <div className="fade-in">
              {/* Personal Reminders */}
              {notifications.filter(n => n.status === 'Unread' && n.type === 'EXPIRY').map(n => (
                <div key={n.id} className="glass-card fade-in" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.2)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Bell size={18} color="#f59e0b" />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontWeight: 800, color: '#f59e0b', fontSize: '0.95rem' }}>{n.title}</h4>
                            <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>{n.message}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => markNotificationRead(n.id)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', width: '100%', maxWidth: '120px' }}
                    >
                        Got it
                    </button>
                </div>
              ))}

              <div style={{ marginBottom: '3rem', marginTop: '1rem' }}>
                <h1 className="header-title" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                  Welcome back, <span className="animate-gradient-text">{tenant?.name?.split(' ')[0]}!</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 400 }}>Your personal fitness dashboard.</p>
              </div>

              <div className="dashboard-grid fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '2.5rem' }}>
                {/* Plan Info Card */}
                <div className="glass-card-premium membership-card-glow" style={{ padding: '2rem' }}>
                  <div className="stat-icon-wrapper floating-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <Award size={28} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 700 }}>Membership</h3>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-1px', textTransform: 'capitalize' }}>
                    {tenant?.plan || 'Active Pass'}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '20px', color: '#10b981', fontWeight: 700, fontSize: '0.75rem', marginBottom: '2rem' }}>
                    <div className="pulse-dot" style={{ background: '#10b981', width: '6px', height: '6px' }}></div>
                    ACCOUNT STATUS: ACTIVE
                  </div>
                  
                  <button 
                    onClick={handlePayment} 
                    disabled={isPaying}
                    className="btn-primary" 
                    style={{ width: '100%', background: 'linear-gradient(135deg, #8b5cf6, #4f46e5)', padding: '0.9rem', borderRadius: '12px', justifyContent: 'center', fontSize: '0.95rem', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}
                  >
                    <CreditCard size={18} /> {isPaying ? 'Processing...' : 'Pay Subscription'}
                  </button>
                </div>

                {/* Upcoming Classes Card */}
                <div className="glass-card-premium" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '8px', borderRadius: '10px' }}>
                        <Calendar size={20} color="#3b82f6" /> 
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Schedule</h3>
                    </div>
                    {myBookings.length > 0 && (
                      <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.4rem 0.8rem', borderRadius: '15px', fontWeight: 700, fontSize: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        {myBookings.length} BOOKED
                      </span>
                    )}
                  </div>
                  
                  {myBookings.length > 0 ? (
                    <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                      {myBookings.map(booking => (
                        <div key={booking.id} className="activity-item-premium" style={{ padding: '1rem' }}>
                           <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                             <CheckCircle size={20} />
                           </div>
                           <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>{booking.class.title}</p>
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                                {booking.class.time}
                              </span>
                           </div>
                        </div>
                      ))}
                      <button onClick={() => setShowExplore(true)} className="btn-secondary" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                         Book Session
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <Calendar size={40} style={{ color: 'rgba(255,255,255,0.05)', marginBottom: '1rem' }} />
                      <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '1rem' }}>No active bookings.</p>
                      <button onClick={() => setShowExplore(true)} className="btn-primary" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', margin: '0 auto', padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                        Explore Classes
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Announcements */}
              {notifications.filter(n => n.type === 'BROADCAST').length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Bell size={24} color="#8b5cf6" /> Gym Announcements
                    </h3>
                    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', padding: 0 }}>
                        {notifications.filter(n => n.type === 'BROADCAST').slice(0, 3).map(n => (
                            <div key={n.id} className="glass-card-premium" style={{ padding: '1.5rem' }}>
                                <h4 style={{ margin: 0, fontWeight: 700, color: '#fff' }}>{n.title}</h4>
                                <p style={{ margin: '0.5rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>{n.message}</p>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wellness' && (
            <div className="fade-in">
              <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Wellness</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Your personalized plans.</p>
              </div>

              <div className="wellness-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                {/* Workouts */}
                <div className="glass-card-premium" style={{ padding: '2rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 800 }}>
                    <Dumbbell color="#8b5cf6" size={24} /> Training
                  </h3>
                  {wellnessData.workouts.length > 0 ? wellnessData.workouts.map(plan => (
                    <div key={plan.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{plan.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 1rem 0' }}>By {plan.trainerName}</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {Array.isArray(plan.exercises) ? plan.exercises.map((ex, i) => (
                                <div key={i} className="activity-item-premium" style={{ margin: 0, padding: '0.75rem 1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ex.name}</span>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ex.sets}x{ex.reps}</div>
                                    </div>
                                </div>
                            )) : <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{plan.exercises}</p>}
                        </div>
                    </div>
                  )) : <p style={{ color: '#64748b' }}>No workouts assigned.</p>}
                </div>

                {/* Diets */}
                <div className="glass-card-premium" style={{ padding: '2rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 800 }}>
                    <Heart color="#ec4899" size={24} /> Nutrition
                  </h3>
                  {wellnessData.diets.length > 0 ? wellnessData.diets.map(plan => (
                    <div key={plan.id}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>{plan.title}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {Array.isArray(plan.meals) ? plan.meals.map((m, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ec4899', marginBottom: '0.2rem' }}>MEAL {i+1}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#fff' }}>{m.content}</div>
                                </div>
                            )) : <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{plan.meals}</p>}
                        </div>
                    </div>
                  )) : <p style={{ color: '#64748b' }}>No diet plans assigned.</p>}
                </div>
              </div>
            </div>
          )}

                    {/* Quick Tips */}
                    <div className="glass-card-premium" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Bell size={18} color="#8b5cf6" /> Coach's Brief
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6' }}>
                            "Focus on explosive tempo today. Keep your rest periods under 60 seconds to maintain metabolic stress. Drink 1L extra water."
                        </p>
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="fade-in">
               <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Body Transformation</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Log your metrics and track your evolution.</p>
              </div>
              
              <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
                {/* Log Form */}
                <div className="glass-card-premium">
                    <h3 style={{ marginBottom: '1.5rem' }}>Log Stats</h3>
                    <form onSubmit={handleLogProgress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Current Weight (kg)</label>
                            <input type="number" step="0.1" value={progressForm.weight} onChange={e => setProgressForm({...progressForm, weight: e.target.value})} placeholder="75.5" required />
                        </div>
                        <div className="form-group">
                            <label>Body Fat % (Optional)</label>
                            <input type="number" step="0.1" value={progressForm.bodyFat} onChange={e => setProgressForm({...progressForm, bodyFat: e.target.value})} placeholder="15.2" />
                        </div>
                        <div className="form-group">
                            <label>Notes</label>
                            <textarea value={progressForm.notes} onChange={e => setProgressForm({...progressForm, notes: e.target.value})} placeholder="How are you feeling?" />
                        </div>
                        <button type="submit" className="btn-primary" disabled={isLoggingProgress} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                            {isLoggingProgress ? 'Saving...' : 'Record Metrics'}
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="glass-card-premium">
                    <h3 style={{ marginBottom: '1.5rem' }}>Evolution Timeline</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {wellnessData.progress.length > 0 ? wellnessData.progress.map(log => (
                            <div key={log.id} className="activity-item-premium" style={{ justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '0.5rem 1rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{log.weight}</div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 700 }}>KG</div>
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700 }}>{log.bodyFat ? `${log.bodyFat}% Body Fat` : 'Weight Entry'}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(log.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {log.notes && <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', maxWidth: '200px' }}>"{log.notes}"</p>}
                            </div>
                        )) : <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No progress logs yet. Start your journey!</p>}
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="fade-in">
               <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Transaction & Activity History</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Verify your past check-ins and subscription payments.</p>
              </div>

              <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* Attendance */}
                <div className="glass-card-premium">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <QrCode color="#10b981" /> Gym Visits
                    </h3>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {attendance.filter(a => a.memberId === tenant.id).map(a => (
                            <div key={a.id} className="activity-item-premium">
                                <CheckCircle color="#10b981" size={20} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700 }}>Check-in Successful</p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(a.checkIn).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        {attendance.filter(a => a.memberId === tenant.id).length === 0 && <p style={{ color: '#64748b' }}>No check-in history found.</p>}
                    </div>
                </div>

                {/* Payments */}
                <div className="glass-card-premium">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <CreditCard color="#3b82f6" /> Payment Receipts
                    </h3>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {payments.filter(p => p.memberId === tenant.id).map(p => (
                            <div key={p.id} className="activity-item-premium" style={{ justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <CreditCard color="#3b82f6" size={20} />
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700 }}>₹{p.amount}</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(p.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                                    {p.status}
                                </span>
                            </div>
                        ))}
                        {payments.filter(p => p.memberId === tenant.id).length === 0 && <p style={{ color: '#64748b' }}>No transaction records found.</p>}
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="fade-in">
              <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>The Vault</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Access premium training resources and educational content.</p>
              </div>

              <div className="dashboard-grid">
                {isVaultLoading ? <p>Loading resources...</p> : vault.map(item => (
                  <div key={item.id} className="glass-card hover-lift" style={{ overflow: 'hidden', padding: 0 }}>
                    <div style={{ height: '140px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.type === 'video' ? <Play size={40} color="#8b5cf6" /> : <FileText size={40} color="#3b82f6" />}
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--brand-primary)', fontWeight: 700 }}>{item.category || 'Guide'}</span>
                      <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{item.title}</h3>
                      <a href={item.url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                        View Resource <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
                {vault.length === 0 && !isVaultLoading && <p>No resources available yet.</p>}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Digital ID (QR) Modal */}
      <div className={`modal-overlay ${showQR ? 'open' : ''}`} onClick={() => setShowQR(false)}>
        <div className="glass-card" style={{ width: '350px', padding: '2rem', textAlign: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button className="btn-icon-round" onClick={() => setShowQR(false)} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
            <X size={20} />
          </button>
          
          <div style={{ background: 'var(--brand-primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white' }}>
            <Award size={32} />
          </div>
          
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Digital ID</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>Scan this code at the gym front desk to check-in.</p>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', display: 'inline-block', marginBottom: '2rem', boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)' }}>
            <QRCodeCanvas value={tenant?.id || "unknown"} size={200} level="H" />
          </div>
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <p style={{ fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>{tenant?.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Member ID: {tenant?.id?.substring(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Explore Classes Modal */}
      <div className={`modal-overlay ${showExplore ? 'open' : ''}`} onClick={() => setShowExplore(false)}>
        <div className="slide-pane" style={{ width: '600px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Explore Gym Sessions</h3>
            <button className="btn-icon-round" onClick={() => setShowExplore(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="modal-body">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Book your spot in today's upcoming classes.</p>
            
            <div className="activity-list">
              {isClassesLoading ? (
                <p>Syncing schedule...</p>
              ) : classes.map(session => {
                const isBooked = myBookings.some(b => b.classId === session.id);
                const isFull = session.bookings?.length >= session.capacity;
                
                return (
                  <div key={session.id} className="activity-item" style={{ border: isBooked ? '1px solid var(--brand-primary)' : '1px solid transparent' }}>
                    <div className="activity-user" style={{ flex: 1 }}>
                      <div className="activity-avatar" style={{ background: 'linear-gradient(135deg, var(--brand-purple), var(--brand-pink))' }}>
                        {session.time.split(':')[0]}
                      </div>
                      <div className="activity-details">
                        <p>{session.title}</p>
                        <span>{session.trainer} • {session.time}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <Users size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {session.bookings?.length || 0} / {session.capacity}
                        </div>
                        
                        {isBooked ? (
                            <span style={{ color: 'var(--brand-primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={16}/> Booked
                            </span>
                        ) : (
                            <button 
                                className="btn-primary" 
                                disabled={isFull || bookingStatus.loading}
                                onClick={() => handleBook(session.id)}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            >
                                {bookingStatus.id === session.id ? '...' : (isFull ? 'Full' : 'Book Spot')}
                            </button>
                        )}
                    </div>
                  </div>
                );
              })}
              {classes.length === 0 && !isClassesLoading && <p>No classes available yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
