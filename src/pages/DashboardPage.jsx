import { Users, CreditCard, Activity, TrendingUp, TrendingDown, Clock, Calendar, IndianRupee, BarChart3, ArrowUpRight } from 'lucide-react';
import { useGymContext } from '../context/GymContext';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardPage() {
  const { members, dashboardMetrics, payments, attendance } = useGymContext();
  const navigate = useNavigate();
  
  // 1. Calculate Active Members
  const activeMembers = members.filter(m => m.status === 'Active').length;

  // 2. Identify Expiring Memberships (Next 15 days)
  const expiringSoon = members.filter(m => {
    if (!m.subscriptionEnd) return false;
    const end = new Date(m.subscriptionEnd);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 15;
  });

  // 3. Daily Revenue (Payments recorded today)
  const today = new Date().toLocaleDateString();
  const dailyRevenue = payments
    .filter(p => new Date(p.createdAt).toLocaleDateString() === today)
    .reduce((sum, p) => sum + p.amount, 0);

  // 4. Daily Attendance Analytics
  const todayAttendance = attendance.filter(a => new Date(a.timestamp).toLocaleDateString() === today).length;

  // 5. Mock Data for Trends
  const revenueData = [
    { name: 'Mon', revenue: 2100 },
    { name: 'Tue', revenue: 3500 },
    { name: 'Wed', revenue: 2800 },
    { name: 'Thu', revenue: 5100 },
    { name: 'Fri', revenue: 4200 },
    { name: 'Sat', revenue: 7000 },
    { name: 'Sun', revenue: dailyRevenue || 1500 },
  ];

  return (
    <div className="fade-in">
      <div className="page-actions-bar">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Analytics Command</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Real-time synchronization with active node metrics.</p>
        </div>
      </div>
      
      <div className="dashboard-grid" style={{ paddingTop: 0 }}>
        <div className="glass-card hover-lift">
          <div className="stat-title">Active Database</div>
          <div className="stat-value">
            {activeMembers}
            <span className="stat-trend positive">
              <TrendingUp size={16} /> 12%
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Synched with local databanks</p>
        </div>

        <div className="glass-card hover-lift">
          <div className="stat-title">Daily Income</div>
          <div className="stat-value">
            ₹{dailyRevenue.toLocaleString()}
            <span className="stat-trend positive">
              <IndianRupee size={16} /> Live
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Real-time payment ledger</p>
        </div>

        <div className="glass-card hover-lift">
          <div className="stat-title">Check-ins Today</div>
          <div className="stat-value">
            {todayAttendance}
            <span className="stat-trend positive">
              <Activity size={16} /> Active
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Attendance analytics sync</p>
        </div>

        <div className="glass-card hover-lift">
          <div className="stat-title">Expiring Soon</div>
          <div className="stat-value" style={{ color: expiringSoon.length > 0 ? '#fbbf24' : 'inherit' }}>
            {expiringSoon.length}
            <span className="stat-trend" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <Clock size={16} /> Alert
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Renewals pending (15d)</p>
        </div>
      </div>

      <div className="dashboard-charts-grid" style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Main Analytics Block */}
        <div className="glass-card" style={{ minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} color="var(--brand-primary)" /> Weekly Growth Matrix
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>
                Last 7 Days
            </div>
          </div>
          
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
                  itemStyle={{ color: 'var(--brand-primary)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--brand-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Panel: Expiring Soon List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="#fbbf24" /> Renewal Queue
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                {expiringSoon.length > 0 ? expiringSoon.map(member => (
                    <div key={member.id} className="activity-item" style={{ background: 'rgba(251, 191, 36, 0.05)', borderLeft: '3px solid #fbbf24' }}>
                        <div className="activity-user" style={{ gap: '0.75rem' }}>
                            <div className="avatar micro" style={{ background: '#fbbf24', color: '#000' }}>{member.initial}</div>
                            <div className="activity-details">
                                <p style={{ fontSize: '0.9rem' }}>{member.name}</p>
                                <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>Expires: {new Date(member.subscriptionEnd).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <button 
                            className="btn-icon-round" 
                            style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}
                            onClick={() => navigate('/dashboard/members')}
                        >
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                        <Clock size={40} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                        <p>No memberships are expiring in the next 15 days.</p>
                    </div>
                )}
            </div>

            <button className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }} onClick={() => navigate('/dashboard/members')}>
                View All Members
            </button>
        </div>

      </div>
    </div>
  );
}
