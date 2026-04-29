import React from 'react';

export default function AddLeadModal({ isOpen, onClose, onSubmit }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="glass-card" style={{ width: '500px', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>New Enquiry</h3>
                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Capture a potential member's details.</p>
                
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label>Prospect Name</label>
                        <input type="text" name="name" required placeholder="Full Name" />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="text" name="phone" required placeholder="+91..." />
                    </div>
                    <div className="form-group">
                        <label>Email (Optional)</label>
                        <input type="email" name="email" placeholder="email@example.com" />
                    </div>
                    <div className="form-group">
                        <label>Interest Level</label>
                        <select name="interest" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: '#09090b', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <option value="Warm">Warm</option>
                            <option value="Hot">Hot (Ready to Join)</option>
                            <option value="Cold">Cold</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ flex: 2, padding: '1rem', borderRadius: '12px', background: '#f59e0b', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Save Enquiry</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
