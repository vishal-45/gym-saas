import { useState, useEffect } from 'react';
import { Server, Building2, CreditCard, Activity } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

export default function AdminDashboard() {
  const { token } = useGymContext();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to load platform stats");
      }
      setIsLoading(false);
    };

    if (token) fetchStats();
  }, [token]);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Synchronizing Platform Metrics...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div className="dashboard-grid">
        <div className="glass-card" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
          <div className="stat-title">Platform MRR</div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            ${stats?.estimatedMRR?.toLocaleString() || '0'}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Based on total ecosystem members</p>
        </div>

        <div className="glass-card" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
          <div className="stat-title">Total Active Gyms</div>
          <div className="stat-value">{stats?.totalTenants || '0'}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            +{stats?.newTenantsThisWeek || '0'} provisioned this week
          </p>
        </div>

        <div className="glass-card" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
          <div className="stat-title">System Health</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{stats?.systemHealth || '99.9%'}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Core Engine status: Optimal</p>
        </div>
      </div>
    </div>
  );
}
