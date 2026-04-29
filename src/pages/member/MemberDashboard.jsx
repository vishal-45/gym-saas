import React, { useState, useEffect } from 'react';
import { useGymContext } from '../../context/GymContext';
import { LogOut, Dumbbell, Calendar, Award, X, Users, CheckCircle, Plus, QrCode, BookOpen, LineChart, Play, FileText, ExternalLink, CreditCard, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { QRCodeCanvas } from 'qrcode.react';

export default function MemberDashboard() {
  const { 
    tenant, logout, classes, bookClass, myBookings, fetchMyBookings, isClassesLoading,
    vault, isVaultLoading, fetchVaultResources, createPaymentOrder, verifyPayment,
    notifications, fetchNotifications, markNotificationRead
  } = useGymContext();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showExplore, setShowExplore] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({ id: null, loading: false });
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    fetchMyBookings();
    fetchVaultResources();
    fetchNotifications();
  }, []);

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
      <div className={`member-portal-bg ${(showExplore || showQR) ? 'blur-background' : ''}`} style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fff' }}>
        {/* Top Nav */}
        <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(10px)', sticky: 'top', zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Dumbbell color="#8b5cf6" size={24} />
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Member Portal</span>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'tab-active' : 'tab-inactive'} style={{ background: 'none', border: 'none', color: activeTab === 'overview' ? '#8b5cf6' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}>Overview</button>
            <button onClick={() => setActiveTab('vault')} className={activeTab === 'vault' ? 'tab-active' : 'tab-inactive'} style={{ background: 'none', border: 'none', color: activeTab === 'vault' ? '#8b5cf6' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}>The Vault</button>
            <button onClick={() => setActiveTab('progress')} className={activeTab === 'progress' ? 'tab-active' : 'tab-inactive'} style={{ background: 'none', border: 'none', color: activeTab === 'progress' ? '#8b5cf6' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}>Progress</button>
            
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>
            
            <button onClick={() => setShowQR(true)} className="btn-icon-round" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <QrCode size={20} />
            </button>
            
            <button onClick={handleLogout} className="btn-icon-round" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <LogOut size={18} />
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          
          {activeTab === 'overview' && (
            <div className="fade-in">
              {/* Personal Reminders */}
              {notifications.filter(n => n.status === 'Unread' && n.type === 'EXPIRY').map(n => (
                <div key={n.id} className="glass-card fade-in" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.2)', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bell size={20} color="#f59e0b" />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontWeight: 800, color: '#f59e0b' }}>{n.title}</h4>
                            <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>{n.message}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => markNotificationRead(n.id)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Got it
                    </button>
                </div>
              ))}

              <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome back, {tenant?.name?.split(' ')[0]}!</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Your current fitness status and upcoming sessions.</p>
              </div>

              <div className="dashboard-grid fade-in" style={{ gridTemplateColumns: '1fr 2fr' }}>
                {/* Plan Info Card */}
                <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '2rem' }}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.2)', marginBottom: '1.5rem' }}>
                    <Award size={28} color="#8b5cf6" />
                  </div>
                  <h3 className="stat-title" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Current Membership</h3>
                  <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
                    {tenant?.plan || 'Active Pass'}
                  </div>
                  <div className="status-badge active" style={{ display: 'inline-flex', padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
                    <div className="pulse-dot"></div>
                    Account Status: Active
                  </div>
                  
                  <button 
                    onClick={handlePayment} 
                    disabled={isPaying}
                    className="btn-primary" 
                    style={{ width: '100%', background: 'var(--brand-primary)', justifyContent: 'center' }}
                  >
                    <CreditCard size={18} /> {isPaying ? 'Processing...' : 'Pay Subscription (Online)'}
                  </button>
                </div>

                {/* Upcoming Classes Card */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Calendar size={24} color="var(--brand-primary)" /> 
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Upcoming Sessions</h3>
                    </div>
                    {myBookings.length > 0 && (
                      <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-primary)' }}>
                        {myBookings.length} Booked
                      </span>
                    )}
                  </div>
                  
                  {myBookings.length > 0 ? (
                    <div className="activity-list" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                      {myBookings.map(booking => (
                        <div key={booking.id} className="activity-item" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.75rem' }}>
                           <div className="activity-user" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                             <div className="activity-avatar" style={{ background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <CheckCircle size={18} />
                             </div>
                             <div className="activity-details">
                                <p style={{ fontWeight: 600, margin: 0 }}>{booking.class.title}</p>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                  {booking.class.trainer} • {booking.class.time}
                                </span>
                             </div>
                           </div>
                        </div>
                      ))}
                      <button onClick={() => setShowExplore(true)} className="btn-secondary" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
                         <Calendar size={18} /> Book Another Session
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <Calendar size={48} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>No active bookings found in your schedule.</p>
                      <button onClick={() => setShowExplore(true)} className="btn-primary" style={{ background: 'var(--brand-primary)', margin: '0 auto', padding: '0.8rem 2rem' }}>
                        <Plus size={18} /> Explore Classes
                      </button>
                    </div>
                  )}
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

          {activeTab === 'progress' && (
            <div className="fade-in">
               <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fitness Progress</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Track your metrics and see your results over time.</p>
              </div>
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <LineChart size={48} color="var(--brand-primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>Progress Analytics Coming Soon</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '1rem auto' }}>We're building a comprehensive tracking engine to help you visualize your body composition and lift PRS.</p>
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
