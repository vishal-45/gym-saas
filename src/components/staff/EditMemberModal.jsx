import React from 'react';

export default function EditMemberModal({ isOpen, onClose, onSubmit, member, plans = [] }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay open" onClick={onClose} style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <div className="glass-card" style={{ width: '500px', padding: '2.5rem', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Update Member</h3>
                <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Modify {member?.name}'s details.</p>
                
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Full Name</label>
                        <input type="text" name="name" defaultValue={member?.name} required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Email Address</label>
                        <input type="email" name="email" defaultValue={member?.email} required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Phone Number</label>
                        <input type="text" name="phone" defaultValue={member?.phone} required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none' }} />
                    </div>
                    {plans?.length > 0 && (
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Current Plan</label>
                            <select name="plan" defaultValue={member?.planId} required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', outline: 'none' }}>
                                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ flex: 2, padding: '1rem', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
