import React, { useState } from 'react';
import { useGymContext } from '../../context/GymContext';
import { Plus, Trash2, Video, FileText, Link, PlayCircle } from 'lucide-react';

export default function VaultManager() {
  const { vault, isVaultLoading, addVaultResource, deleteVaultResource } = useGymContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', type: 'video', url: '', category: 'Workout' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await addVaultResource(formData);
    if(res.success) {
      setIsModalOpen(false);
      setFormData({ title: '', type: 'video', url: '', category: 'Workout' });
    }
  };

  return (
    <div className="members-page fade-in">
      <div className="page-actions-bar">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>The Vault: Content Manager</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Upload workout videos, PDFs, and guides for your members.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add New Resource
        </button>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
        {isVaultLoading ? <p>Loading library...</p> : vault.map(item => (
          <div key={item.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#8b5cf6' }}>
                {item.type === 'video' ? <Video size={24} /> : (item.type === 'pdf' ? <FileText size={24} /> : <Link size={24} />)}
              </div>
              <div>
                <h4 style={{ margin: 0 }}>{item.title}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.category} • {item.type.toUpperCase()}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <a href={item.url} target="_blank" rel="noreferrer" className="btn-icon-round" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <PlayCircle size={18} />
               </a>
               <button onClick={() => deleteVaultResource(item.id)} className="btn-icon-round" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <Trash2 size={18} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay open" onClick={() => setIsModalOpen(false)}>
          <div className="slide-pane" onClick={e => e.stopPropagation()}>
             <div className="modal-header">
                <h3>Add Resource</h3>
                <button onClick={() => setIsModalOpen(false)} className="btn-icon-round"><Plus size={20} style={{ transform: 'rotate(45deg)' }}/></button>
             </div>
             <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Morning Yoga Routine" required />
                </div>
                <div className="form-group">
                    <label>Category</label>
                    <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Cardio / Nutrition" />
                </div>
                <div className="form-group">
                    <label>Resource Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="video">Video URL (YouTube/Vimeo)</option>
                        <option value="pdf">PDF Link</option>
                        <option value="link">Other Website Link</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>URL</label>
                    <input type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://..." required />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Publish to Member Portals</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
