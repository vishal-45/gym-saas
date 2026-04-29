import React, { useState } from 'react';
import { Calendar, Users, Plus, Award, X, Trash2, Clock, User, Timer, AlertCircle } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

export default function ClassesPage() {
  const { classes, addClass, deleteClass, isClassesLoading, trainers } = useGymContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', time: '', trainerId: '', capacity: 20 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to get booking status counts
  const getBookingStats = (bookings) => {
    const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
    const waitlist = bookings.filter(b => b.status === 'Waitlist').length;
    return { confirmed, waitlist };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Find trainer name for backwards compatibility or display
    const selectedTrainer = trainers.find(t => t.id === formData.trainerId);
    
    await addClass({
        ...formData,
        trainer: selectedTrainer ? selectedTrainer.name : 'Unassigned'
    });
    
    setIsModalOpen(false);
    setFormData({ title: '', time: '', trainerId: '', capacity: 20 });
    setIsSubmitting(false);
  };

  return (
    <div className="fade-in">
      <div className="page-actions-bar">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Operation Schedule</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Advanced scheduling and slot protocols.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Schedule Session
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Classes List */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
            <Clock size={22} color="var(--brand-primary)" /> Deployment Agenda
          </h3>
          
          <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isClassesLoading ? (
               <div style={{ textAlign: 'center', padding: '4rem' }}>
                 <div className="pulse-dot" style={{ margin: '0 auto 1rem' }}></div>
                 <p>Syncing Sessions...</p>
               </div>
            ) : classes.map(session => {
              const { confirmed, waitlist } = getBookingStats(session.bookings || []);
              const isFull = confirmed >= session.capacity;

              return (
                <div key={session.id} className="activity-item" style={{ padding: '1.5rem', borderLeft: isFull ? '4px solid #fbbf24' : '4px solid var(--brand-primary)' }}>
                  <div className="activity-user" style={{ flex: 1, gap: '1.5rem' }}>
                    <div className="activity-avatar" style={{ background: isFull ? '#fbbf24' : 'var(--brand-primary)', color: isFull ? '#000' : 'white', width: '50px', height: '50px' }}>
                      {session.time.split(':')[0]}
                    </div>
                    <div className="activity-details">
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{session.title}</p>
                      <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14}/> {session.trainer}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> {session.time}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: isFull ? '#fbbf24' : 'var(--text-primary)' }}>
                            <Users size={18} /> 
                            {confirmed} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {session.capacity}</span>
                        </div>
                        {waitlist > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                <Timer size={12} /> {waitlist} On Waitlist
                            </div>
                        )}
                    </div>

                    <button 
                      className="btn-icon-round" 
                      onClick={() => { if(window.confirm("Terminate this session?")) deleteClass(session.id) }}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {classes.length === 0 && !isClassesLoading && (
                <div style={{ textAlign: 'center', padding: '4rem', border: '2px dashed var(--border-color)', borderRadius: '1rem' }}>
                    <AlertCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>No active sessions detected.</p>
                </div>
            )}
          </div>
        </div>

        {/* Quick Stats / Legend */}
        <div className="glass-card">
           <h3 style={{ marginBottom: '2rem', fontWeight: 700 }}>Slot Metadata</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div className="glass-card" style={{ background: 'rgba(251, 191, 36, 0.05)', padding: '1rem' }}>
                   <p style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600, marginBottom: '0.5rem' }}>WAITLIST PROTOCOL</p>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Members automatically move to waitlist when capacity (MAX Personnel) is exceeded.</p>
               </div>
               <div className="glass-card" style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1rem' }}>
                   <p style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>AUTO-PROMOTION</p>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System promotes waitlist personnel in chronological order upon cancellation.</p>
               </div>
           </div>
        </div>
      </div>

      {/* Slide Pane for New Session */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={() => setIsModalOpen(false)}>
        <div className="slide-pane" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Deploy Session</h3>
            <button className="btn-icon-round" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="modal-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="form-group">
                <label>Discipline (Title)</label>
                <select 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                >
                    <option value="">-- Select Discipline --</option>
                    <option value="Yoga Flow">Yoga Flow</option>
                    <option value="Zumba Blast">Zumba Blast</option>
                    <option value="CrossFit Matrix">CrossFit Matrix</option>
                    <option value="Advanced Powerlifting">Advanced Powerlifting</option>
                    <option value="HIIT Circuit">HIIT Circuit</option>
                </select>
              </div>

              <div className="form-group">
                <label>Operational Trainer</label>
                <select 
                    value={formData.trainerId} 
                    onChange={(e) => setFormData({...formData, trainerId: e.target.value})}
                    required
                >
                    <option value="">-- Assign Specialist --</option>
                    {trainers.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Temporal Node (Time)</label>
                <input 
                  type="time" 
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}  
                  required 
                />
              </div>

              <div className="form-group">
                <label>Personnel Capacity</label>
                <input 
                  type="number" 
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}  
                  min="1"
                  required 
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: '2rem', justifyContent: 'center' }}>
                {isSubmitting ? 'Syncing...' : <><Calendar size={18} /> Add to Agenda</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
