import React from 'react';

export default function EditMemberModal({ isOpen, onClose, onSubmit, selectedMember, plans }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="glass-card" style={{ width: '500px', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Update Member</h3>
                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Modify {selectedMember?.name}'s details.</p>
                
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" defaultValue={selectedMember?.name} required />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" defaultValue={selectedMember?.email} required />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="text" name="phone" defaultValue={selectedMember?.phone} required />
                    </div>
                    <div className="form-group">
                        <label>Current Plan</label>
                        <select name="plan" defaultValue={selectedMember?.planId} required style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: '#09090b', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ flex: 2, padding: '1rem', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
