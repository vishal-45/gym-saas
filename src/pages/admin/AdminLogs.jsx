import React, { useState, useEffect } from 'react';
import { History, Shield, Activity, User, Building2, Clock } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

export default function AdminLogs() {
  const { token } = useGymContext();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs");
    }
    setIsLoading(false);
  };

  const getActionColor = (action) => {
    if (action.includes('SUSPEND')) return '#ef4444';
    if (action.includes('REACTIVATE')) return '#10b981';
    if (action.includes('IMPERSONATE')) return '#f59e0b';
    return '#8b5cf6';
  };

  return (
    <div className="members-page fade-in">
      <div className="page-actions-bar">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Platform Audit History</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Security ledger recording all administrative actions in the ecosystem.</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary">
          <Activity size={18} /> Refresh Log
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action Type</th>
              <th>Target Business</th>
              <th>Admin Note</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '4rem' }}>Decrypting security logs...</td></tr>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="fade-in">
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '0.3rem 0.75rem', 
                      borderRadius: '2rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: getActionColor(log.action),
                      border: `1px solid ${getActionColor(log.action)}33`
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={16} opacity={0.6} />
                      {log.target || 'N/A'}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{log.details}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                  Audit log is currently empty. Administrative actions will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
