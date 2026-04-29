import { useState } from 'react';
import { Plus, X, Award, AlertCircle, Edit, Trash2, Calendar, IndianRupee } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

export default function PlansPage() {
  const { plans, isPlansLoading, addPlan, updatePlan, deletePlan } = useGymContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30' // default 30 days
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    let res;
    if (editingId) {
      res = await updatePlan(editingId, formData);
    } else {
      res = await addPlan(formData);
    }

    if (res.success) {
      handleCloseModal();
    } else {
      setErrorMsg(res.error);
    }
    
    setIsSubmitting(false);
  };

  const handleEdit = (plan) => {
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      duration: plan.duration.toString()
    });
    setEditingId(plan.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("High Risk Action: Are you sure you want to delete this plan? This cannot be undone if members are enrolled.")) {
      const res = await deletePlan(id);
      if (!res.success) {
        setErrorMsg(res.error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', duration: '30' });
    setErrorMsg('');
  };

  return (
    <>
      <div className={`members-page fade-in ${isModalOpen ? 'blur-background' : ''}`}>
        <div className="page-actions-bar">
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Membership Architect</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Design and manage subscription tiers for your gym.</p>
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Create New Plan
          </button>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {isPlansLoading ? (
            <p>Loading plans...</p>
          ) : plans.map(plan => (
            <div key={plan.id} className="glass-card plan-card hover-lift" style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <Award size={32} color="var(--brand-primary)" />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-icon-round small" onClick={() => handleEdit(plan)}><Edit size={14} /></button>
                  <button className="btn-icon-round small delete" onClick={() => handleDelete(plan.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              
              <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>{plan.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1 }}>{plan.description || 'No description provided.'}</p>
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Investment</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>₹{plan.price}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'flex-end' }}>
                    <Calendar size={12} /> Validity
                  </div>
                  <div style={{ fontWeight: 600 }}>{plan.duration} Days</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', background: 'rgba(139, 92, 246, 0.1)', padding: '0.5rem', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                {plan._count?.members || 0} Active Enrolled Members
              </div>
            </div>
          ))}
          {!isPlansLoading && plans.length === 0 && (
            <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center' }}>
              <Award size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No membership plans found. Create your first plan to start enrolling members.</p>
            </div>
          )}
        </div>
      </div>

      {/* Plan Form Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={handleCloseModal}>
        <div className="slide-pane" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{editingId ? 'Modify Subscription Tier' : 'Architect New Plan'}</h3>
            <button className="btn-icon-round" onClick={handleCloseModal}>
              <X size={20} />
            </button>
          </div>
          
          <div className="modal-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              
              {errorMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <AlertCircle size={18} />
                  <div>{errorMsg}</div>
                </div>
              )}

              <div className="form-group">
                <label>Plan Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange} 
                  placeholder="e.g. Platinum Annual Pass"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Description (Features)</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What does this plan include?"
                  style={{ minHeight: '100px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.8rem', color: 'white' }}
                />
              </div>

              <div className="form-group">
                <label>Price (₹)</label>
                <div style={{ position: 'relative' }}>
                  <IndianRupee size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}  
                    placeholder="2500"
                    style={{ paddingLeft: '2.5rem' }}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Duration (Days)</label>
                <select name="duration" value={formData.duration} onChange={handleInputChange}>
                  <option value="30">Monthly (30 Days)</option>
                  <option value="90">Quarterly (90 Days)</option>
                  <option value="180">Half-Yearly (180 Days)</option>
                  <option value="365">Yearly (365 Days)</option>
                  <option value="7">Weekly (7 Days)</option>
                </select>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {isSubmitting ? 'Syncing...' : (
                    editingId ? <><Edit size={18} /> Update Plan</> : <><Plus size={18} /> Deploy Plan</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
