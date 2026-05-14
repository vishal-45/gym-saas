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
      theme: { color: "#2563eb" },
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
          background: #f8fafc;
          position: relative;
          min-height: 100vh;
        }
        .glass-card-premium {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 2.5rem;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
          overflow: hidden;
        }
        .glass-card-premium:hover {
          transform: translateY(-5px);
          border-color: #2563eb;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .membership-card-glow {
          background: linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
        }
        .membership-card-glow:hover {
          border-color: #2563eb;
        }
        .animate-gradient-text {
          background: linear-gradient(to right, #2563eb, #3b82f6, #6366f1, #2563eb);
          background-size: 200% auto;
          color: #2563eb;
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
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: all 0.2s ease;
        }
        .activity-item-premium:hover {
          background: #ffffff;
          border-color: #2563eb;
          transform: translateX(4px);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .floating-icon {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .member-main {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
          padding: 2.5rem;
          transition: all 0.3s ease;
        }
        .member-sidebar {
          width: 260px;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          position: fixed;
          height: 100vh;
          display: flex;
          flex-direction: column;
          z-index: 200;
          transition: transform 0.3s ease;
          box-shadow: 4px 0 24px rgba(0,0,0,0.02);
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
            padding: 1.5rem !important;
          }
          .dashboard-grid, .wellness-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .header-title {
            font-size: 2rem !important;
          }
        }
        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          width: calc(100% - 1.5rem);
          padding: 0.85rem 1rem;
          margin: 0.25rem 0.75rem;
          background: none;
          border: none;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 12px;
        }
        .nav-button:hover {
          background: #f1f5f9;
          color: #2563eb;
        }
        .nav-button.active {
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
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
              <Dumbbell color="#2563eb" size={32} />
              <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-1px', color: '#0f172a' }}>Member Portal</span>
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

          <div style={{ padding: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
            <button onClick={() => setShowQR(true)} className="nav-button" style={{ color: '#2563eb', background: '#eff6ff', marginBottom: '0.5rem' }}>
              <QrCode size={20} /> Digital ID
            </button>
            <button onClick={handleLogout} className="nav-button" style={{ color: '#ef4444' }}>
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </aside>

        <main className="member-main">
          {/* Mobile Header */}
          <div className="mobile-header" style={{ display: 'none', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: '#ffffff', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 100 }}>
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer' }}>
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Dumbbell color="#2563eb" size={24} />
              <span style={{ fontWeight: 800, color: '#0f172a' }}>CoreFit</span>
            </div>
          </div>
          
          {activeTab === 'overview' && (
            <div className="fade-in">
              {/* Personal Reminders */}
              {notifications.filter(n => n.status === 'Unread' && n.type === 'EXPIRY').map(n => (
                <div key={n.id} className="glass-card-premium fade-in" style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#fef3c7', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Bell size={18} color="#d97706" />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontWeight: 800, color: '#92400e', fontSize: '0.95rem' }}>{n.title}</h4>
                            <p style={{ margin: '0.2rem 0 0 0', color: '#b45309', fontSize: '0.85rem' }}>{n.message}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => markNotificationRead(n.id)}
                        style={{ background: '#fff', border: '1px solid #fbbf24', color: '#92400e', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', width: '100%', maxWidth: '120px' }}
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
                  <div className="stat-icon-wrapper floating-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <Award size={28} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#64748b', marginBottom: '0.5rem', fontWeight: 700 }}>Membership</h3>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.25rem', letterSpacing: '-1px', textTransform: 'capitalize' }}>
                    {tenant?.plan || 'Active Pass'}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '20px', color: '#059669', fontWeight: 700, fontSize: '0.75rem', marginBottom: '2rem' }}>
                    <div className="pulse-dot" style={{ background: '#10b981', width: '6px', height: '6px' }}></div>
                    ACCOUNT STATUS: ACTIVE
                  </div>
                  
                  <button 
                    onClick={handlePayment} 
                    disabled={isPaying}
                    className="btn-primary" 
                    style={{ width: '100%', background: '#2563eb', color: '#fff', padding: '0.9rem', borderRadius: '12px', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 700, boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)', border: 'none', cursor: 'pointer' }}
                  >
                    <CreditCard size={18} /> {isPaying ? 'Processing...' : 'Pay Subscription'}
                  </button>
                </div>

                {/* Upcoming Classes Card */}
                <div className="glass-card-premium" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '10px' }}>
                        <Calendar size={20} color="#2563eb" /> 
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Schedule</h3>
                    </div>
                    {myBookings.length > 0 && (
                      <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.4rem 0.8rem', borderRadius: '15px', fontWeight: 700, fontSize: '0.75rem', border: '1px solid #dbeafe' }}>
                        {myBookings.length} BOOKED
                      </span>
                    )}
                  </div>
                  
                  {myBookings.length > 0 ? (
                    <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                      {myBookings.map(booking => (
                        <div key={booking.id} className="activity-item-premium" style={{ padding: '1rem' }}>
                           <div style={{ background: '#2563eb', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                             <CheckCircle size={20} />
                           </div>
                           <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 700, margin: 0, fontSize: '1rem', color: '#0f172a' }}>{booking.class.title}</p>
                              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                                {booking.class.time}
                              </span>
                           </div>
                        </div>
                      ))}
                      <button onClick={() => setShowExplore(true)} className="btn-secondary" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', background: '#f1f5f9', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                         Book Session
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
                      <Calendar size={40} style={{ color: '#e2e8f0', marginBottom: '1rem' }} />
                      <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '1rem' }}>No active bookings.</p>
                      <button onClick={() => setShowExplore(true)} className="btn-primary" style={{ background: '#2563eb', color: '#fff', border: 'none', margin: '0 auto', padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
                        Explore Classes
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Announcements */}
              {notifications.filter(n => n.type === 'BROADCAST').length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
                        <Bell size={24} color="#2563eb" /> Gym Announcements
                    </h3>
                    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', padding: 0 }}>
                        {notifications.filter(n => n.type === 'BROADCAST').slice(0, 3).map(n => (
                            <div key={n.id} className="glass-card-premium" style={{ padding: '1.5rem' }}>
                                <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{n.title}</h4>
                                <p style={{ margin: '0.5rem 0', color: '#475569', fontSize: '0.9rem' }}>{n.message}</p>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
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
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Wellness</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Your personalized plans.</p>
              </div>

              <div className="wellness-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                {/* Workouts */}
                <div className="glass-card-premium" style={{ padding: '2rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    <Dumbbell color="#2563eb" size={24} /> Training
                  </h3>
                  {wellnessData.workouts.length > 0 ? wellnessData.workouts.map(plan => (
                    <div key={plan.id} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{plan.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 1rem 0' }}>By {plan.trainerName}</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {Array.isArray(plan.exercises) ? plan.exercises.map((ex, i) => (
                                <div key={i} className="activity-item-premium" style={{ margin: 0, padding: '0.75rem 1rem', background: '#fff' }}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{ex.name}</span>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ex.sets}x{ex.reps}</div>
                                    </div>
                                </div>
                            )) : <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{plan.exercises}</p>}
                        </div>
                    </div>
                  )) : <p style={{ color: '#64748b' }}>No workouts assigned.</p>}
                </div>

                {/* Diets */}
                <div className="glass-card-premium" style={{ padding: '2rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    <Heart color="#db2777" size={24} /> Nutrition
                  </h3>
                  {wellnessData.diets.length > 0 ? wellnessData.diets.map(plan => (
                    <div key={plan.id}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>{plan.title}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {Array.isArray(plan.meals) ? plan.meals.map((m, i) => (
                                <div key={i} style={{ padding: '1rem', background: '#fdf2f8', borderRadius: '12px', border: '1px solid #fce7f3' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#db2777', marginBottom: '0.2rem' }}>MEAL {i+1}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>{m.content}</div>
                                </div>
                            )) : <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{plan.meals}</p>}
                        </div>
                    </div>
                  )) : <p style={{ color: '#64748b' }}>No diet plans assigned.</p>}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="glass-card-premium" style={{ background: '#f0f9ff', border: '1px solid #bae6fd', marginTop: '2rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0369a1' }}>
                      <Bell size={18} color="#0284c7" /> Coach's Brief
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#0c4a6e', lineHeight: '1.6' }}>
                      "Focus on explosive tempo today. Keep your rest periods under 60 seconds to maintain metabolic stress. Drink 1L extra water."
                  </p>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="fade-in">
               <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Body Transformation</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Log your metrics and track your evolution.</p>
              </div>
              
              <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
                {/* Log Form */}
                <div className="glass-card-premium">
                    <h3 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Log Stats</h3>
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
                        <button type="submit" className="btn-primary" disabled={isLoggingProgress} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', background: '#2563eb', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                            {isLoggingProgress ? 'Saving...' : 'Record Metrics'}
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="glass-card-premium">
                    <h3 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Evolution Timeline</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {wellnessData.progress.length > 0 ? wellnessData.progress.map(log => (
                            <div key={log.id} className="activity-item-premium" style={{ justifyContent: 'space-between', background: '#fff' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.5rem 1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #dbeafe' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{log.weight}</div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 700 }}>KG</div>
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{log.bodyFat ? `${log.bodyFat}% Body Fat` : 'Weight Entry'}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{new Date(log.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {log.notes && <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', maxWidth: '200px' }}>"{log.notes}"</p>}
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
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Transaction & Activity History</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Verify your past check-ins and subscription payments.</p>
              </div>

              <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* Attendance */}
                <div className="glass-card-premium">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', color: '#0f172a' }}>
                        <QrCode color="#10b981" /> Gym Visits
                    </h3>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {attendance.filter(a => a.memberId === tenant.id).map(a => (
                            <div key={a.id} className="activity-item-premium" style={{ background: '#fff' }}>
                                <CheckCircle color="#10b981" size={20} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Check-in Successful</p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{new Date(a.checkIn).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        {attendance.filter(a => a.memberId === tenant.id).length === 0 && <p style={{ color: '#64748b' }}>No check-in history found.</p>}
                    </div>
                </div>

                {/* Payments */}
                <div className="glass-card-premium">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', color: '#0f172a' }}>
                        <CreditCard color="#2563eb" /> Payment Receipts
                    </h3>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {payments.filter(p => p.memberId === tenant.id).map(p => (
                            <div key={p.id} className="activity-item-premium" style={{ justifyContent: 'space-between', background: '#fff' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <CreditCard color="#2563eb" size={20} />
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>₹{p.amount}</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{new Date(p.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #10b981' }}>
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
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>The Vault</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Access premium training resources and educational content.</p>
              </div>

              <div className="dashboard-grid">
                {isVaultLoading ? <p style={{ color: '#64748b' }}>Loading resources...</p> : vault.map(item => (
                  <div key={item.id} className="glass-card-premium" style={{ overflow: 'hidden', padding: 0 }}>
                    <div style={{ height: '140px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.type === 'video' ? <Play size={40} color="#2563eb" /> : <FileText size={40} color="#3b82f6" />}
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#2563eb', fontWeight: 700 }}>{item.category || 'Guide'}</span>
                      <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem', color: '#0f172a' }}>{item.title}</h3>
                      <a href={item.url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                        View Resource <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
                {vault.length === 0 && !isVaultLoading && <p style={{ color: '#64748b' }}>No resources available yet.</p>}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Digital ID (QR) Modal */}
      <div className={`modal-overlay ${showQR ? 'open' : ''}`} onClick={() => setShowQR(false)}>
        <div className="glass-card-premium" style={{ width: '350px', padding: '2.5rem', textAlign: 'center', position: 'relative', background: '#fff' }} onClick={e => e.stopPropagation()}>
          <button className="btn-icon-round" onClick={() => setShowQR(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={20} />
          </button>
          
          <div style={{ background: '#2563eb', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
            <Award size={32} />
          </div>
          
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#0f172a', fontWeight: 800 }}>Digital ID</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Scan this code at the gym front desk to check-in.</p>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', display: 'inline-block', marginBottom: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <QRCodeCanvas value={tenant?.id || "unknown"} size={200} level="H" />
          </div>
          
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
            <p style={{ fontWeight: 800, margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{tenant?.name}</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Member ID: {tenant?.id?.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Explore Classes Modal */}
      <div className={`modal-overlay ${showExplore ? 'open' : ''}`} onClick={() => setShowExplore(false)}>
        <div className="slide-pane" style={{ width: '600px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>Explore Gym Sessions</h3>
            <button className="btn-icon-round" onClick={() => setShowExplore(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          
          <div className="modal-body" style={{ padding: '1.5rem' }}>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Book your spot in today's upcoming classes.</p>
            
            <div className="activity-list">
              {isClassesLoading ? (
                <p>Syncing schedule...</p>
              ) : classes.map(session => {
                const isBooked = myBookings.some(b => b.classId === session.id);
                const isFull = session.bookings?.length >= session.capacity;
                
                return (
                  <div key={session.id} className="activity-item-premium" style={{ border: isBooked ? '1px solid #2563eb' : '1px solid #e2e8f0', background: isBooked ? '#eff6ff' : '#fff' }}>
                    <div className="activity-user" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="activity-avatar" style={{ background: '#2563eb', color: '#fff', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                        {session.time.split(':')[0]}
                      </div>
                      <div className="activity-details">
                        <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{session.title}</p>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{session.trainer} • {session.time}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
                            <Users size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {session.bookings?.length || 0} / {session.capacity}
                        </div>
                        
                        {isBooked ? (
                            <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={16}/> Booked
                            </span>
                        ) : (
                            <button 
                                className="btn-primary" 
                                disabled={isFull || bookingStatus.loading}
                                onClick={() => handleBook(session.id)}
                                style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
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
