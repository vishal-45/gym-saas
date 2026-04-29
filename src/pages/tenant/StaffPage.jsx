import { useState } from 'react';
import { Search, Plus, UserPlus, X, Award, AlertCircle, Edit, Trash2, Users, ShieldCheck, Camera, TrendingUp, CreditCard, Calendar, CheckCircle2 } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

export default function StaffPage() {
  const { staff, isStaffLoading, addStaff, updateStaff, deleteStaff } = useGymContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Receptionist',
    password: '',
    status: 'Active',
    permissions: ['scanner', 'members', 'schedule'] // Default permissions
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    if (e.target.name === 'role' && e.target.value === 'Manager') {
      setFormData({ 
        ...formData, 
        role: e.target.value, 
        permissions: ['scanner', 'members', 'leads', 'payments', 'schedule'] 
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const togglePermission = (perm) => {
    const current = formData.permissions || [];
    if (current.includes(perm)) {
      setFormData({ ...formData, permissions: current.filter(p => p !== perm) });
    } else {
      setFormData({ ...formData, permissions: [...current, perm] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    let res;
    if (editingId) {
      res = await updateStaff(editingId, formData);
    } else {
      res = await addStaff(formData);
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
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      password: '',
      status: member.status,
      permissions: member.permissions ? JSON.parse(member.permissions) : []
    });
    setEditingId(member.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this team member?")) {
      const res = await deleteStaff(id);
      if (!res.success) {
        setErrorMsg(res.error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ 
      name: '', email: '', phone: '', role: 'Receptionist', password: '', status: 'Active', 
      permissions: ['scanner', 'members', 'schedule'] 
    });
    setErrorMsg('');
  };

  return (
    <>
      <div className={`members-page fade-in ${isModalOpen ? 'blur-background' : ''}`}>
      <div className="page-actions-bar">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Our Team</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage staff accounts and portal access.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search team members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Member
          </button>
        </div>
      </div>

      <div className="table-container fade-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isStaffLoading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Loading team...</td></tr>
            ) : filteredStaff.map(member => (
              <tr key={member.id}>
                <td>
                  <div className="table-cell-user">
                    <div className="avatar micro" style={{ background: 'var(--accent-gradient)' }}>{member.initial}</div>
                    <span style={{ fontWeight: 600 }}>{member.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--accent-color)', fontWeight: 500 }}>{member.role}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {member.email}<br/>{member.phone}
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
            {!isStaffLoading && filteredStaff.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Users size={48} style={{ opacity: 0.5, margin: '0 auto 1rem auto' }} />
                  <p>No team members found. Add your first staff member.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Staff Form Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={handleCloseModal}>
        <div className="slide-pane" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{editingId ? 'Update Team Member' : 'Add New Team Member'}</h3>
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
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange} 
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
                  required 
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}  
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select name="role" value={formData.role} onChange={handleInputChange}>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Manager">Manager</option>
                  <option value="Sales">Sales</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Portal Password {editingId && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep current)</span>}</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={editingId ? '••••••••' : 'Set login password'}
                  required={!editingId}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Staff uses this to login at <strong>/staff-login</strong></p>
              </div>

              {editingId && (
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <ShieldCheck size={18} color="var(--accent-color)" /> Authorized Modules
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {[
                        { id: 'members', label: 'Member Roster', icon: Users },
                        { id: 'scanner', label: 'QR Scanner', icon: Camera },
                        { id: 'leads', label: 'Enquiry Board', icon: TrendingUp },
                        { id: 'payments', label: 'Financial Ledger', icon: CreditCard },
                        { id: 'schedule', label: 'Gym Schedule', icon: Calendar },
                    ].map(perm => (
                        <div 
                            key={perm.id} 
                            onClick={() => togglePermission(perm.id)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', 
                                background: formData.permissions?.includes(perm.id) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                border: `1px solid ${formData.permissions?.includes(perm.id) ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: formData.permissions?.includes(perm.id) ? '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {formData.permissions?.includes(perm.id) && <CheckCircle2 size={12} color="white" />}
                            </div>
                            <perm.icon size={16} color={formData.permissions?.includes(perm.id) ? '#6366f1' : '#94a3b8'} />
                            <span style={{ fontSize: '0.85rem', fontWeight: formData.permissions?.includes(perm.id) ? 700 : 500, color: formData.permissions?.includes(perm.id) ? 'white' : '#94a3b8' }}>{perm.label}</span>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>Select which modules this staff member can access in their portal.</p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {isSubmitting ? 'Processing...' : (
                    editingId ? <><Edit size={18} /> Update Member</> : <><Plus size={18} /> Add Member</>
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
