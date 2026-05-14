import React from 'react';
import { X, CreditCard } from 'lucide-react';

export default function PaymentsModal({ isOpen, onClose, member, payments }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay open" onClick={onClose} style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <div className="glass-card" style={{ width: '600px', padding: '2.5rem', maxHeight: '80vh', overflowY: 'auto', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#0f172a' }}>Financial Ledger</h3>
                        <p style={{ color: '#64748b' }}>Transaction history for {member?.name || 'Member'}</p>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={18} color="#0f172a" />
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {payments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <CreditCard size={48} style={{ marginBottom: '1.5rem', color: '#cbd5e1' }} />
                            <p style={{ color: '#64748b', fontWeight: 600 }}>No transactions found for this member.</p>
                        </div>
                    ) : (
                        payments.map(p => (
                            <div key={p.id} style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem 1rem', background: '#ecfdf5', color: '#10b981', fontSize: '0.7rem', fontWeight: 800, borderBottomLeftRadius: '12px', borderLeft: '1px solid #dcfce7', borderBottom: '1px solid #dcfce7' }}>
                                    PAID
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>Transaction ID</p>
                                        <p style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '1.25rem', color: '#0f172a' }}>{p.id.substring(0, 16)}</p>
                                        
                                        <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>Date</p>
                                        <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{new Date(p.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>Amount</p>
                                        <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2563eb', margin: 0 }}>₹{p.amount.toLocaleString()}</p>
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
