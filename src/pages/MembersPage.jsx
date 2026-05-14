import { useState } from 'react';
import { Search, Plus, UserPlus, X, Award, AlertCircle, Edit, Trash2, Dumbbell, Radio } from 'lucide-react';
import { useGymContext } from '../context/GymContext';

export default function MembersPage() {
  const { members, isMembersLoading, addMember, updateMember, deleteMember, plans, trainers } = useGymContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ title: '', message: '' });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    planId: '',
    trainerId: '',
    status: 'Active',
    autoRenew: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    let res;
    if (editingId) {
      res = await updateMember(editingId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        planId: formData.planId,
        trainerId: formData.trainerId,
        status: formData.status,
        password: formData.password,
        autoRenew: formData.autoRenew
      });
    } else {
      res = await addMember({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        planId: formData.planId,
        trainerId: formData.trainerId
      });
    }

    if (res.success) {
      handleCloseModal();
    } else {
      setErrorMsg(res.error);
    }
    
    setIsSubmitting(false);
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      password: '',
      planId: member.planId || '',
      trainerId: member.trainerId || '',
      status: member.status,
      autoRenew: member.autoRenew || false
    });
    setEditingId(member.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("High Risk Action: Are you sure you want to terminate this member? This will immediately revoke their access.")) {
      const res = await deleteMember(id);
      if (!res.success) {
        setErrorMsg(res.error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', password: '', planId: '', status: 'Active', autoRenew: false });
    setErrorMsg('');
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setIsBroadcasting(true);
    try {
      const res = await fetch(`${import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')}/notifications/broadcast`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(broadcastData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Broadcast sent to all members successfully!');
        setIsBroadcastOpen(false);
        setBroadcastData({ title: '', message: '' });
      } else {
        alert(data.error || 'Failed to send broadcast');
      }
    } catch (err) {
      alert('Failed to send broadcast');
    }
    setIsBroadcasting(false);
  };

  return (
    <>
      <div className={`members-page fade-in ${isModalOpen ? 'blur-background' : ''}`}>
      <div className="page-actions-bar">
        <div>
          <h2 className="header-title" style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Personnel Database</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage active member connections and access protocols.</p>
        </div>
        <div className="page-actions-group" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-box" style={{ flex: '1 1 200px' }}>
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Filter index..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', width: 'auto' }}>
              <button className="btn-secondary" onClick={() => setIsBroadcastOpen(true)} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.2)', padding: '0.6rem 1rem' }}>
                <Radio size={18} /> <span className="hide-mobile">Broadcast</span>
              </button>
              <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '0.6rem 1.25rem' }}>
                <Plus size={18} /> <span className="hide-mobile">Enroll New</span>
                <span className="show-mobile" style={{ display: 'none' }}>Enroll</span>
              </button>
            </div>
        </div>
      </div>

      <div className="table-container fade-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Member Name</th>
              <th>System Plan</th>
              <th>Assigned Trainer</th>
              <th>Subscription End</th>
              <th>Data Connectivity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isMembersLoading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Fetching databanks...</td></tr>
            ) : filteredMembers.map(member => (
              <tr key={member.id}>
                <td style={{ color: 'var(--text-secondary)' }}>...{member.id.substring(0,6)}</td>
                <td>
                  <div className="table-cell-user">
                    <div className="avatar micro">{member.initial}</div>
                    <span style={{ fontWeight: 600 }}>{member.name}</span>
                  </div>
                </td>
                <td style={{ color: '#8b5cf6', fontWeight: 600 }}>{member.plan}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{member.trainer?.name || 'Unassigned'}</td>
                <td style={{ color: new Date(member.subscriptionEnd) < new Date() ? '#ef4444' : 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {member.subscriptionEnd ? new Date(member.subscriptionEnd).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {member.email || member.phone || 'No Contact Meta'}
                </td>
                <td>
                  <span className={`status-badge ${member.status.toLowerCase()}`}>
                    <div className="pulse-dot"></div>
                    {member.status}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-icon-round" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }} onClick={() => handleEdit(member)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon-round" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} onClick={() => handleDelete(member.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!isMembersLoading && filteredMembers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <UserPlus size={48} style={{ opacity: 0.5, margin: '0 auto 1rem auto' }} />
                  <p>Database is empty. Enroll your first member.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Database Enrollment Form */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={handleCloseModal}>
        <div className="slide-pane" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{editingId ? 'Update Member Profile' : 'Enroll New Member'}</h3>
            <button className="btn-icon-round" onClick={handleCloseModal}>
              <X size={20} />
            </button>
          </div>
          
          <div className="modal-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              
              {errorMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', lineHeight: 1.4 }}>
                  <AlertCircle size={18} style={{ marginTop: '0.1rem' }} />
                  <div>{errorMsg}</div>
                </div>
              )}

              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange} 
                  placeholder="e.g. Michael Jordan" 
                  style={{ borderColor: errorMsg.includes('Name') ? '#ef4444' : undefined }}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}  
                  placeholder="mike@example.com" 
                  style={{ borderColor: errorMsg.includes('Rule') ? '#ef4444' : undefined }}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}  
                  placeholder="(555) 123-4567" 
                  style={{ borderColor: errorMsg.includes('Rule') ? '#ef4444' : undefined }}
                />
              </div>

              <div className="form-group">
                <label>{editingId ? 'Reset Portal Password (Optional)' : 'Portal Login Password (Optional)'}</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}  
                  placeholder={editingId ? "Leave empty to keep current password" : "Set an initial password for member access"} 
                />
              </div>

              {editingId && (
                <div className="form-group">
                  <label>Membership Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={16} color="#8b5cf6" /> Select Active Plan
                </label>
                <select 
                  name="planId"
                  value={formData.planId}
                  onChange={handleInputChange} 
                  required
                >
                  <option value="">-- Choose a Plan --</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Dumbbell size={16} color="#3b82f6" /> Assign Personal Trainer
                </label>
                <select 
                  name="trainerId"
                  value={formData.trainerId}
                  onChange={handleInputChange} 
                >
                  <option value="">-- No Trainer Assigned --</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                  ))}
                </select>
              </div>


              {editingId && (
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                    <input 
                        type="checkbox" 
                        name="autoRenew" 
                        checked={formData.autoRenew} 
                        onChange={(e) => setFormData({...formData, autoRenew: e.target.checked})} 
                        style={{ width: '20px', height: '20px' }}
                    />
                    <label style={{ margin: 0 }}>Enable Auto-Renewal logic</label>
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {isSubmitting ? 'Syncing to Database...' : (
                    editingId ? <><Edit size={18} /> Update Profile</> : <><UserPlus size={18} /> Provision Member</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      <div className={`modal-overlay ${isBroadcastOpen ? 'open' : ''}`} onClick={() => setIsBroadcastOpen(false)}>
        <div className="slide-pane" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Radio color="#8b5cf6" /> System Broadcast</h3>
            <button className="btn-icon-round" onClick={() => setIsBroadcastOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="modal-body">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Send an announcement to the member app dashboard. All active members will receive this notification.
            </p>
            <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              <div className="form-group">
                <label>Announcement Title</label>
                <input 
                  type="text" 
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({...broadcastData, title: e.target.value})} 
                  placeholder="e.g. Gym Closed Tomorrow" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Message Content</label>
                <textarea 
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({...broadcastData, message: e.target.value})}  
                  placeholder="Provide details about the announcement..." 
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'white', minHeight: '150px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <button type="submit" disabled={isBroadcasting} className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                  {isBroadcasting ? 'Transmitting...' : <><Radio size={18} /> Send Broadcast</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
