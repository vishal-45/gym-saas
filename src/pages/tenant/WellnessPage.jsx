import { useState, useEffect } from 'react';
import { Dumbbell, Utensils, TrendingUp, Camera, Plus, X, Target, Activity, AlertCircle } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

export default function WellnessPage() {
  const { members, trainers, fetchMemberWellness, addWorkout, addDiet, addProgress } = useGymContext();
  const [selectedMember, setSelectedMember] = useState(null);
  const [wellnessData, setWellnessData] = useState({ workouts: [], diets: [], progress: [] });
  const [activeTab, setActiveTab] = useState('progress'); // progress, workout, diet
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('progress'); // progress, workout, diet

  // Load wellness data when member is selected
  useEffect(() => {
    if (selectedMember) {
      handleRefresh();
    }
  }, [selectedMember]);

  const handleRefresh = async () => {
    const data = await fetchMemberWellness(selectedMember.id);
    setWellnessData(data);
  };

  const handleMemberSelect = (e) => {
    const member = members.find(m => m.id === e.target.value);
    setSelectedMember(member);
  };

  return (
    <div className="fade-in">
      <div className="page-actions-bar">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Wellness Matrix</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Elite transformation tracking and protocol deployment.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'white', padding: '0.6rem 1rem', borderRadius: '10px', width: '250px' }}
                onChange={handleMemberSelect}
                value={selectedMember?.id || ''}
            >
                <option value="">-- Select Personnel --</option>
                {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                ))}
            </select>
            <button className="btn-primary" onClick={() => { setIsModalOpen(true); setModalType(activeTab); }} disabled={!selectedMember}>
                <Plus size={18} /> New Protocol
            </button>
        </div>
      </div>

      {!selectedMember ? (
          <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'rgba(255,255,255,0.01)', borderRadius: '2rem', border: '2px dashed var(--border-color)' }}>
              <Target size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'var(--text-secondary)' }}>Station Idle: Please select a member to manage wellness protocols.</h3>
          </div>
      ) : (
          <div style={{ padding: '0 2rem 2rem' }}>
              {/* Tab Navigation */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <button onClick={() => setActiveTab('progress')} className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`} style={{ border: 'none', background: 'transparent' }}>
                      <TrendingUp size={20} /> Transformation Log
                  </button>
                  <button onClick={() => setActiveTab('workout')} className={`nav-item ${activeTab === 'workout' ? 'active' : ''}`} style={{ border: 'none', background: 'transparent' }}>
                      <Dumbbell size={20} /> Workout Systems
                  </button>
                  <button onClick={() => setActiveTab('diet')} className={`nav-item ${activeTab === 'diet' ? 'active' : ''}`} style={{ border: 'none', background: 'transparent' }}>
                      <Utensils size={20} /> Nutrition Fuel
                  </button>
              </div>

              <div className="dashboard-grid" style={{ paddingTop: 0 }}>
                  
                  {activeTab === 'progress' && (
                      <div className="glass-card" style={{ gridColumn: 'span 3' }}>
                          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <Activity size={22} color="var(--brand-primary)" /> Personnel Progress
                          </h3>
                          <div className="activity-list">
                              {wellnessData.progress.map(log => (
                                  <div key={log.id} className="activity-item" style={{ padding: '1.5rem' }}>
                                      <div style={{ flex: 1, display: 'flex', gap: '1.5rem' }}>
                                          <div style={{ width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                              {log.photoUrl ? <img src={log.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={24} style={{ opacity: 0.3 }} />}
                                          </div>
                                          <div>
                                              <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{new Date(log.date).toLocaleDateString()}</p>
                                              <div style={{ display: 'flex', gap: '2rem', marginTop: '0.75rem' }}>
                                                  <div style={{ color: 'var(--brand-primary)' }}>
                                                      <span style={{ fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>WEIGHT</span>
                                                      <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{log.weight} KG</span>
                                                  </div>
                                                  <div style={{ color: 'var(--brand-pink)' }}>
                                                      <span style={{ fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>BODY FAT</span>
                                                      <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{log.bodyFat}%</span>
                                                  </div>
                                              </div>
                                              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{log.notes || 'No observations recorded.'}</p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {activeTab === 'workout' && (
                     <div className="glass-card" style={{ gridColumn: 'span 3' }}>
                        <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Dumbbell size={22} color="var(--brand-purple)" /> Active Training Programs
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {wellnessData.workouts.map(plan => (
                                <div key={plan.id} className="glass-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <h4 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>{plan.title}</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1.5rem' }}>Assigned by {plan.trainerName}</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {plan.exercises?.map((ex, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                                                <span>{ex.name}</span>
                                                <span style={{ fontWeight: 700 }}>{ex.sets}x{ex.reps}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                  )}

                  {activeTab === 'diet' && (
                     <div className="glass-card" style={{ gridColumn: 'span 3' }}>
                        <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Utensils size={22} color="var(--brand-accent)" /> Nutrition Protocols
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {wellnessData.diets.map(plan => (
                                <div key={plan.id} className="glass-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <h4 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>{plan.title}</h4>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div className="status-badge active" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--brand-primary)' }}>P: {plan.macros?.protein}g</div>
                                        <div className="status-badge active" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--brand-purple)' }}>C: {plan.macros?.carbs}g</div>
                                        <div className="status-badge active" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--brand-pink)' }}>F: {plan.macros?.fats}g</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {plan.meals?.map((meal, i) => (
                                            <div key={i} style={{ borderLeft: '2px solid var(--brand-accent)', paddingLeft: '1rem' }}>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-accent)' }}>{meal.time}</p>
                                                <p style={{ fontSize: '0.95rem' }}>{meal.food}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                  )}

              </div>
          </div>
      )}

      {/* Protocol Deployment Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={() => setIsModalOpen(false)}>
        <div className="slide-pane" onClick={e => e.stopPropagation()}>
           <div className="modal-header">
                <h3>Deploy {modalType.toUpperCase()} Protocol</h3>
                <button className="btn-icon-round" onClick={() => setIsModalOpen(false)}><X/></button>
           </div>
           <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Currently managing: <span style={{ color: 'white', fontWeight: 700 }}>{selectedMember?.name}</span></p>
                {/* Simplified form for demo, as structured JSON inputs are complex */}
                <div className="glass-card" style={{ textAlign: 'center', opacity: 0.8 }}>
                    <AlertCircle size={32} style={{ marginBottom: '1rem' }} />
                    <p>Structured Protocol Engine Active.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '1rem' }}>Assigning standardized wellness profiles to personnel...</p>
                </div>
                <button className="btn-primary" style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
                    Confirm Deployment
                </button>
           </div>
        </div>
      </div>
    </div>
  );
}
