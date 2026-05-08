import React, { useState } from 'react';
import { Megaphone, Send, Clock, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

export default function AnnouncementsPage() {
  const { sendBroadcast, sendDirectNotification, notifications, members, trainers, staff } = useGymContext();
  const [mode, setMode] = useState('broadcast'); // broadcast | direct
  const [targetGroup, setTargetGroup] = useState('ALL'); // ALL | MEMBER | TRAINER | STAFF
  const [targetId, setTargetId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState(null);

  const allRecipients = [
    ...members.map(m => ({ id: m.id, name: m.name, type: 'Member' })),
    ...trainers.map(t => ({ id: t.id, name: t.name, type: 'Trainer' })),
    ...staff.map(s => ({ id: s.id, name: s.name, type: 'Staff' }))
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !message) return;
    if (mode === 'direct' && !targetId) return;

    setIsSending(true);
    let res;
    if (mode === 'broadcast') {
      res = await sendBroadcast(title, message, targetGroup);
    } else {
      res = await sendDirectNotification(targetId, title, message);
    }
    setIsSending(false);

    if (res.success) {
      setStatus(`Notification sent successfully to ${mode === 'broadcast' ? (targetGroup === 'ALL' ? 'everyone' : `all ${targetGroup.toLowerCase()}s`) : 'the selected recipient'}.`);
      setTitle('');
      setMessage('');
      setTargetId('');
      setTimeout(() => setStatus(null), 5000);
    } else {
      setStatus('Failed: ' + res.error);
    }
  };

  const broadcastHistory = notifications.filter(n => n.type === 'BROADCAST');

  return (
    <div className="members-page fade-in">
      <div className="page-actions-bar">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Communication Hub</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Broadcast important updates to your entire gym community instantly.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', marginTop: '2rem' }}>
        
        {/* Send Broadcast Form */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <Megaphone size={24} color="var(--brand-primary)" />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, margin: 0 }}>Create Broadcast</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Notifications will appear on Member & Staff portals.</p>
            </div>
          </div>

          {status && (
            <div style={{ 
              marginBottom: '2rem', 
              padding: '1rem', 
              background: status.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${status.includes('success') ? '#10b981' : '#ef4444'}`,
              borderRadius: '12px',
              color: status.includes('success') ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 600
            }}>
              {status.includes('success') ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
              {status}
            </div>
          )}

          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '2rem' }}>
            <button 
              onClick={() => setMode('broadcast')}
              style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', background: mode === 'broadcast' ? 'var(--brand-primary)' : 'transparent', color: mode === 'broadcast' ? 'white' : 'var(--text-secondary)' }}
            >
              Public Broadcast
            </button>
            <button 
              onClick={() => setMode('direct')}
              style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', background: mode === 'direct' ? 'var(--brand-primary)' : 'transparent', color: mode === 'direct' ? 'white' : 'var(--text-secondary)' }}
            >
              Direct Message
            </button>
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {mode === 'broadcast' && (
              <div className="form-group">
                <label>Target Audience</label>
                <select 
                  value={targetGroup} 
                  onChange={(e) => setTargetGroup(e.target.value)}
                  style={{ fontSize: '1rem', padding: '1rem' }}
                >
                  <option value="ALL">Everyone (Global)</option>
                  <option value="MEMBER">All Gym Members</option>
                  <option value="TRAINER">All Personal Trainers</option>
                  <option value="STAFF">All Administrative Staff</option>
                </select>
              </div>
            )}

            {mode === 'direct' && (
              <div className="form-group">
                <label>Select Recipient</label>
                <select 
                  value={targetId} 
                  onChange={(e) => setTargetId(e.target.value)}
                  required
                  style={{ fontSize: '1rem', padding: '1rem' }}
                >
                  <option value="">-- Choose Member, Trainer, or Staff --</option>
                  {allRecipients.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Announcement Title</label>
              <input 
                type="text" 
                placeholder="e.g. Personal Training Session Update" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ fontSize: '1rem', padding: '1rem' }}
              />
            </div>

            <div className="form-group">
              <label>Message Content</label>
              <textarea 
                placeholder="Write your message here... Try to be clear and concise." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                style={{ fontSize: '1rem', padding: '1rem', resize: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSending}
              className="btn-primary" 
              style={{ width: '100%', padding: '1.25rem', justifyContent: 'center', fontSize: '1.1rem', gap: '0.75rem' }}
            >
              <Send size={20} />
              {isSending ? 'Transmitting...' : 'Broadcast to All'}
            </button>
          </form>
        </div>

        {/* History / Status Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--brand-primary)" /> Broadcast Log
          </h3>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {broadcastHistory.length > 0 ? (
              broadcastHistory.map((n) => (
                <div key={n.id} className="activity-item" style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{n.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
                    <Users size={14} /> Delivered to All Active Channels
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                <Send size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p>No broadcast history found.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
