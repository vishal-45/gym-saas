import { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, X, Award, AlertCircle, Edit, Trash2, Dumbbell, Banknote, Percent, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TrainersPage() {
  const { trainers, isTrainersLoading, addTrainer, updateTrainer, deleteTrainer, members, token } = useGymContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedTrainer, setExpandedTrainer] = useState(null);
  const [trainerEarnings, setTrainerEarnings] = useState({});
  const [processingPayout, setProcessingPayout] = useState(false);

  const getMemberCount = (trainerId) => {
    return members.filter(m => m.trainerId === trainerId).length;
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    password: '',
    status: 'Active',
    paymentModel: 'SALARY',
    baseSalary: 0,
    commissionRate: 0,
    perSessionRate: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredTrainers = trainers.filter(trainer => 
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (trainer.specialty && trainer.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
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
      res = await updateTrainer(editingId, formData);
    } else {
      res = await addTrainer(formData);
    }

    if (res.success) {
      handleCloseModal();
    } else {
      setErrorMsg(res.error);
    }
    
    setIsSubmitting(false);
  };

  const handleEdit = (trainer) => {
    setFormData({
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone || '',
      specialty: trainer.specialty || '',
      password: '',
      status: trainer.status,
      paymentModel: trainer.paymentModel || 'SALARY',
      baseSalary: trainer.baseSalary || 0,
      commissionRate: trainer.commissionRate || 0,
      perSessionRate: trainer.perSessionRate || 0
    });
    setEditingId(trainer.id);
    setIsModalOpen(true);
  };

  const fetchEarnings = async (trainerId) => {
    try {
        const res = await fetch(`${API_URL}/trainers/${trainerId}/earnings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setTrainerEarnings(prev => ({ ...prev, [trainerId]: data }));
    } catch (err) { console.error(err); }
  };

  const toggleExpand = (trainerId) => {
    if (expandedTrainer === trainerId) {
        setExpandedTrainer(null);
    } else {
        setExpandedTrainer(trainerId);
        if (!trainerEarnings[trainerId]) fetchEarnings(trainerId);
    }
  };

  const handleProcessPayout = async (trainerId, amount) => {
    if (!window.confirm(`Are you sure you want to process a payout of ₹${amount}?`)) return;
    setProcessingPayout(true);
    try {
        const res = await fetch(`${API_URL}/trainers/${trainerId}/payout`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount })
        });
        const data = await res.json();
        if (data.success) {
            alert('Payout processed successfully!');
            fetchEarnings(trainerId); // Refresh earnings
        } else {
            alert(data.error || 'Failed to process payout');
        }
    } catch (err) {
        alert('Failed to process payout');
    }
    setProcessingPayout(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ 
        name: '', email: '', phone: '', specialty: '', password: '', status: 'Active',
        paymentModel: 'SALARY', baseSalary: 0, commissionRate: 0, perSessionRate: 0 
    });
    setErrorMsg('');
  };

  return (
    <>
      <div className={`members-page fade-in ${isModalOpen ? 'blur-background' : ''}`}>
        <div className="page-actions-bar">
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Trainer Matrix</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Advanced payroll and commission management.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search trainers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                <UserPlus size={18} /> Add Professional
              </button>
          </div>
        </div>

        {/* Global Payroll Summary Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={24} color="#8b5cf6" />
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Professionals</p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{trainers.length}</p>
                </div>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #10b981' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calculator size={24} color="#10b981" />
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Monthly Liability</p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                        ₹{trainers.reduce((acc, t) => acc + (t.baseSalary || 0), 0).toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Banknote size={24} color="#f59e0b" />
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Commissions</p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Calculated Live</p>
                </div>
            </div>
        </div>

        <div className="members-grid">
          {isTrainersLoading ? (
             <div className="loading-state">Syncing Personnel Data...</div>
          ) : filteredTrainers.map(trainer => (
            <div key={trainer.id} className="member-card" style={{ borderLeft: `4px solid ${trainer.status === 'Active' ? '#6366f1' : '#ef4444'}` }}>
              <div className="member-card-header">
                <div className="member-info">
                  <div className="avatar" style={{ background: '#6366f1' }}>{trainer.name[0]}</div>
                  <div>
                    <h3>{trainer.name}</h3>
                    <p>{trainer.specialty || 'General Coach'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-icon-round" onClick={() => handleEdit(trainer)}><Edit size={16} /></button>
                    <button className="btn-icon-round" onClick={() => toggleExpand(trainer.id)}>
                        {expandedTrainer === trainer.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
              </div>

              <div className="member-details">
                <div className="detail-item">
                  <span className="label">Managed Clients</span>
                  <span className="value">{getMemberCount(trainer.id)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Pay Model</span>
                  <span className="value" style={{ textTransform: 'capitalize', color: 'var(--brand-primary)', fontWeight: 700 }}>
                    {trainer.paymentModel?.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              </div>

              {expandedTrainer === trainer.id && (
                  <div className="fade-in" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calculator size={14} /> Real-time Earnings (Current Month)
                    </h4>
                    {trainerEarnings[trainer.id] ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: '12px' }}>
                                <span style={{ fontWeight: 600 }}>Net Earnings</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-primary)' }}>₹{trainerEarnings[trainer.id].totalEarnings}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Based on {trainer.paymentModel}</span>
                                <span>Status: Estimated</span>
                            </div>
                            <button 
                                className="btn-primary" 
                                style={{ marginTop: '0.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}
                                onClick={() => handleProcessPayout(trainer.id, trainerEarnings[trainer.id].totalEarnings)}
                                disabled={processingPayout || trainerEarnings[trainer.id].totalEarnings === 0}
                            >
                                {processingPayout ? 'Processing...' : 'Process Payout'}
                            </button>
                        </div>
                    ) : (
                        <div className="pulse-dot">Calculating...</div>
                    )}
                  </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={handleCloseModal}>
        <div className="slide-pane" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{editingId ? 'Modify Trainer Profile' : 'Register New Professional'}</h3>
            <button className="btn-icon-round" onClick={handleCloseModal}><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body">
            {errorMsg && (
                <div className="error-alert">
                    <AlertCircle size={18} />
                    {errorMsg}
                </div>
            )}
            
            <div className="form-section">
                <h4>Identity & Credentials</h4>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Coach Name" />
                    </div>
                    <div className="form-group">
                        <label>Specialization</label>
                        <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} placeholder="e.g. Bodybuilding, Yoga" />
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="trainer@gym.com" />
                    </div>
                    <div className="form-group">
                        <label>Password {editingId && '(Leave blank to keep current)'}</label>
                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!editingId} placeholder="••••••••" />
                    </div>
                </div>
            </div>

            <div className="form-section" style={{ background: 'rgba(99,102,241,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.1)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-primary)' }}>
                    <Banknote size={18} /> Financial Configuration
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Select the primary payment model for this professional.</p>

                <div className="form-group">
                    <label>Payment Model</label>
                    <select name="paymentModel" value={formData.paymentModel} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'white' }}>
                        <option value="SALARY">Fixed Salary Model</option>
                        <option value="REVENUE_SHARE">Revenue Share (%)</option>
                        <option value="PER_SESSION">Pay Per Session</option>
                    </select>
                </div>

                <div className="form-grid" style={{ marginTop: '1rem' }}>
                    {formData.paymentModel === 'SALARY' && (
                        <div className="form-group">
                            <label>Monthly Salary (₹)</label>
                            <input type="number" name="baseSalary" value={formData.baseSalary} onChange={handleInputChange} />
                        </div>
                    )}
                    {formData.paymentModel === 'REVENUE_SHARE' && (
                        <div className="form-group">
                            <label>Commission Rate (%)</label>
                            <div style={{ position: 'relative' }}>
                                <input type="number" name="commissionRate" value={formData.commissionRate} onChange={handleInputChange} style={{ paddingRight: '2rem' }} />
                                <Percent size={14} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            </div>
                        </div>
                    )}
                    {formData.paymentModel === 'PER_SESSION' && (
                        <div className="form-group">
                            <label>Rate Per Session (₹)</label>
                            <input type="number" name="perSessionRate" value={formData.perSessionRate} onChange={handleInputChange} />
                        </div>
                    )}
                </div>
            </div>

            <div className="form-actions" style={{ marginTop: '2rem' }}>
              <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Syncing...' : editingId ? 'Update Profile' : 'Authorize Professional'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
