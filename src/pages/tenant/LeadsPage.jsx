import { useState } from 'react';
import { Search, Plus, X, Phone, Mail, Calendar, Edit, Trash2, UserPlus, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

export default function LeadsPage() {
  const { leads, isLeadsLoading, addLead, updateLead, deleteLead } = useGymContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Walk-in',
    interest: '',
    notes: '',
    nextFollowUp: '',
    status: 'New'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lead.phone.includes(searchTerm)
  );

  const stats = {
    total: leads.length,
    trials: leads.filter(l => l.status === 'Trial').length,
    converted: leads.filter(l => l.status === 'Converted').length,
    new: leads.filter(l => l.status === 'New').length
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    let res;
    if (editingId) {
      res = await updateLead(editingId, formData);
    } else {
      res = await addLead(formData);
    }

    if (res.success) {
      handleCloseModal();
    } else {
      setErrorMsg(res.error);
    }
    setIsSubmitting(false);
  };

  const handleEdit = (lead) => {
    setFormData({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      source: lead.source,
      interest: lead.interest || '',
      notes: lead.notes || '',
      nextFollowUp: lead.nextFollowUp ? lead.nextFollowUp.split('T')[0] : '',
      status: lead.status
    });
    setEditingId(lead.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', email: '', source: 'Walk-in', interest: '', notes: '', nextFollowUp: '', status: 'New' });
    setErrorMsg('');
  };

  return (
    <div className="fade-in">
      <div className="page-actions-bar">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Lead Acquisition</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track walk-ins, trials, and conversion health.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Capture Lead
        </button>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-grid" style={{ paddingTop: 0, paddingBottom: '2rem' }}>
          <div className="glass-card">
              <div className="stat-title">Uncontacted</div>
              <div className="stat-value" style={{ color: 'var(--brand-primary)' }}>{stats.new}</div>
          </div>
          <div className="glass-card">
              <div className="stat-title">On Active Trial</div>
              <div className="stat-value" style={{ color: '#fbbf24' }}>{stats.trials}</div>
          </div>
          <div className="glass-card">
              <div className="stat-title">Converted (Lifetime)</div>
              <div className="stat-value" style={{ color: 'var(--brand-accent)' }}>{stats.converted}</div>
          </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search by name or phone..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Lead Profile</th>
              <th>Status</th>
              <th>Next Follow-up</th>
              <th>Interests</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLeadsLoading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Loading dataset...</td></tr>
            ) : filteredLeads.map(lead => (
              <tr key={lead.id}>
                <td>
                  <div className="table-cell-user">
                    <div className="avatar micro" style={{ background: 'var(--bg-secondary)', color: 'var(--brand-primary)' }}>
                        <TrendingUp size={16} />
                    </div>
                    <div>
                        <p style={{ fontWeight: 700 }}>{lead.name}</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Source: {lead.source}</span>
                    </div>
                  </div>
                </td>
                <td>
                    <span className={`status-badge ${lead.status.toLowerCase()}`}>
                        {lead.status}
                    </span>
                </td>
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <Calendar size={14} color="var(--brand-primary)" />
                        {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : 'Unscheduled'}
                    </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{lead.interest || 'Not specified'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-icon-round" style={{ color: 'var(--brand-primary)' }} onClick={() => handleEdit(lead)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon-round" style={{ color: '#ef4444' }} onClick={() => deleteLead(lead.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && !isLeadsLoading && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No active leads found in this segment.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Capture Lead Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={handleCloseModal}>
        <div className="slide-pane" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{editingId ? 'Update Lead Matrix' : 'Capture New Lead'}</h3>
            <button className="btn-icon-round" onClick={handleCloseModal}>
              <X size={20} />
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {errorMsg && <div className="glass-card" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><AlertCircle size={18}/> {errorMsg}</div>}
              
              <div className="form-group">
                <label>Prospect Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Full Name" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+91 ..." />
                </div>
                <div className="form-group">
                    <label>Inquiry Source</label>
                    <select name="source" value={formData.source} onChange={handleInputChange}>
                        <option value="Walk-in">Walk-in</option>
                        <option value="Referral">Referral</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Website">Website</option>
                    </select>
                </div>
              </div>

              <div className="form-group">
                <label>Status Protocol</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="New">New / Uncontacted</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Trial">Active Trial</option>
                  <option value="Converted">Converted to Member</option>
                  <option value="Lost">Closed / Lost</option>
                </select>
              </div>

              <div className="form-group">
                <label>Next Contact Node (Follow-up)</label>
                <input type="date" name="nextFollowUp" value={formData.nextFollowUp} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Observation & Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" placeholder="Interests, budget, trial feedback..."></textarea>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                {isSubmitting ? 'Syncing...' : (editingId ? 'Update Lead' : 'Commence Capture')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
