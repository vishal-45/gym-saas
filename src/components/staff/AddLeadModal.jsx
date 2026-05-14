import React from 'react';

export default function AddLeadModal({ isOpen, onClose, onSubmit }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay open" onClick={onClose} style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <div className="glass-card" style={{ width: '500px', padding: '2.5rem', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>New Enquiry</h3>
                <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Capture a potential member's details.</p>
                
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Prospect Name</label>
                        <input type="text" name="name" required placeholder="Full Name" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Phone Number</label>
                        <input type="text" name="phone" required placeholder="+91..." style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Email (Optional)</label>
                        <input type="email" name="email" placeholder="email@example.com" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Interest Level</label>
                        <select name="interest" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', outline: 'none' }}>
                            <option value="Warm">Warm</option>
                            <option value="Hot">Hot (Ready to Join)</option>
                            <option value="Cold">Cold</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ flex: 2, padding: '1rem', borderRadius: '12px', background: '#f59e0b', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}>Save Enquiry</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
