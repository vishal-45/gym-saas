import React from 'react';
import { X, CreditCard } from 'lucide-react';

export default function PaymentsModal({ isOpen, onClose, member, payments }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="glass-card" style={{ width: '600px', padding: '2.5rem', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Financial Ledger</h3>
                        <p style={{ color: '#94a3b8' }}>Transaction history for {member?.name}</p>
                    </div>
                    <button onClick={onClose} className="btn-icon-round" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <X size={20} />
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {payments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                            <CreditCard size={48} style={{ marginBottom: '1rem' }} />
                            <p>No transactions found for this member.</p>
                        </div>
                    ) : (
                        payments.map(p => (
                            <div key={p.id} className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.7rem', fontWeight: 800, borderBottomLeftRadius: '12px' }}>
                                    PAID
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Transaction ID</p>
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>{p.id.substring(0, 12)}...</p>
                                        
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date</p>
                                        <p style={{ fontWeight: 600 }}>{new Date(p.date).toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Amount</p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>₹{p.amount}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
