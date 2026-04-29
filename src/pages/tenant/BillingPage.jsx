import React, { useState } from 'react';
import { CreditCard, Download, Plus, ArrowUpRight, CheckCircle2, History, User } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

export default function BillingPage() {
  const { payments, members, recordOfflinePayment, isPaymentsLoading } = useGymContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ memberId: '', amount: '', method: 'Cash' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tenant } = useGymContext();

  const generateInvoice = (payment) => {
    const printWindow = window.open('', '_blank');
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${payment.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; display: flex; justify-content: space-between; }
            .brand { color: #8b5cf6; font-size: 24px; font-weight: 800; }
            .details { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 50px; }
            th { text-align: left; background: #f4f4f5; padding: 12px; }
            td { padding: 12px; border-bottom: 1px solid #e4e4e7; }
            .total { margin-top: 30px; text-align: right; font-size: 20px; font-weight: 700; }
            .footer { margin-top: 100px; font-size: 12px; color: #71717a; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">CoreFitness</div>
            <div>
                <strong>TAX INVOICE</strong><br/>
                #${payment.id.substring(0, 8).toUpperCase()}<br/>
                Date: ${new Date(payment.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div class="details">
            <div>
                <small>Billed From:</small><br/>
                <strong>${tenant.name}</strong><br/>
                India
            </div>
            <div>
                <small>Billed To:</small><br/>
                <strong>${payment.member.name}</strong><br/>
                ${payment.member.email || 'No email provided'}
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Description</th><th>Qty</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Gym Membership Subscription - ${payment.type} payment (${payment.method})</td>
                <td>1</td>
                <td>₹${payment.amount}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">Total: ₹${payment.amount}</div>
          <div class="footer">
            Thank you for choosing CoreFitness. This is a computer-generated invoice.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const handleOfflinePayment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await recordOfflinePayment(formData);
    setIsModalOpen(false);
    setFormData({ memberId: '', amount: '', method: 'Cash' });
    setIsSubmitting(false);
  };

  const totalRevenue = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <div className={`members-page fade-in ${isModalOpen ? 'blur-background' : ''}`}>
        <div className="page-actions-bar">
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Financial Ledger</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Track all online and manual transactions for your gym.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Record Offline Payment
            </button>
          </div>
        </div>

        <div className="dashboard-grid" style={{ padding: '0 0 2rem 0' }}>
          <div className="glass-card hover-lift">
            <div className="stat-title">Total Processed</div>
            <div className="stat-value" style={{ color: 'var(--brand-primary)' }}>
              ₹{totalRevenue.toLocaleString()}
            </div>
          </div>
          
          <div className="glass-card hover-lift">
            <div className="stat-title">Pending Orders</div>
            <div className="stat-value" style={{ color: '#eab308' }}>
              ₹{pendingRevenue.toLocaleString()}
            </div>
          </div>

          <div className="glass-card hover-lift" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(24, 24, 27, 0.4))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '100%' }}>
              <div style={{ background: 'var(--brand-accent)', padding: '1rem', borderRadius: '50%', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>Razorpay Active</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Accepting online UPI & Cards</div>
              </div>
            </div>
          </div>
        </div>

        <div className="table-container fade-in">
          <h3 style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="var(--brand-primary)" /> Transaction History
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Method</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {isPaymentsLoading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading ledger...</td></tr>
              ) : payments.map(pay => (
                <tr key={pay.id}>
                  <td style={{ fontWeight: 600 }}>{pay.member.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{pay.method}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: pay.type === 'Online' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.05)', color: pay.type === 'Online' ? '#8b5cf6' : 'var(--text-secondary)' }}>
                        {pay.type}
                    </span>
                  </td>
                  <td>{new Date(pay.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{pay.amount}</td>
                  <td>
                    <span className={`status-badge ${pay.status === 'Paid' ? 'active' : 'inactive'}`}>
                      {pay.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-icon-round" 
                      style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
                      onClick={() => generateInvoice(pay)}
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length === 0 && !isPaymentsLoading && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No transactions recorded yet.</p>}
        </div>
      </div>

      {/* Record Offline Payment Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={() => setIsModalOpen(false)}>
        <div className="slide-pane" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Record Manual Payment</h3>
            <button className="btn-icon-round" onClick={() => setIsModalOpen(false)}>
              <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
            </button>
          </div>
          
          <div className="modal-body">
            <form onSubmit={handleOfflinePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Select Member</label>
                <select 
                  value={formData.memberId} 
                  onChange={e => setFormData({...formData, memberId: e.target.value})}
                  required
                >
                  <option value="">Choose a member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount (₹)</label>
                <input 
                  type="number" 
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="e.g. 1500"
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select 
                  value={formData.method}
                  onChange={e => setFormData({...formData, method: e.target.value})}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card (Offline)">Card (Swipe)</option>
                  <option value="UPI (Direct)">UPI (Direct Transfer)</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
                {isSubmitting ? 'Recording...' : 'Log Transaction'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
