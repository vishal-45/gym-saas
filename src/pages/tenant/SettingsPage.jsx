import React from 'react';
import { Building, Globe, Bell, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="members-page fade-in">
      <div className="page-actions-bar">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>System Configuration</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Update your gym profile and notification routing.</p>
        </div>
        <button className="btn-primary">
          <Save size={18} /> Save Settings
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr', gap: '2rem' }}>
        
        {/* Settings Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="glass-card" style={{ padding: '0.5rem', border: 'none', background: 'transparent' }}>
            <div className="nav-item active" style={{ cursor: 'pointer', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--text-primary)', borderLeft: '3px solid var(--brand-primary)' }}>
              <Building size={18} /> Gym Profile
            </div>
            <div className="nav-item" style={{ cursor: 'pointer' }}>
              <Globe size={18} /> Regional & Local
            </div>
            <div className="nav-item" style={{ cursor: 'pointer' }}>
              <Bell size={18} /> Notifications
            </div>
          </div>
        </div>

        {/* Settings Form Body */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <Building size={20} color="var(--brand-primary)" /> Core Business Details
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Tenant ID (Read Only)</label>
              <input type="text" value="TENANT_CF_8849" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Gym Trading Name</label>
                <input type="text" defaultValue="CoreFitness Studio" />
              </div>
              <div className="form-group">
                <label>Support Email Address</label>
                <input type="email" defaultValue="support@corefitness.com" />
              </div>
            </div>

            <div className="form-group">
              <label>Physical Address</label>
              <input type="text" defaultValue="Sector 18, NOIDA, Uttar Pradesh 201301" />
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={20} color="var(--brand-purple)" /> Localization
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Currency</label>
                <select defaultValue="INR">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select defaultValue="IST">
                  <option value="IST">India Standard Time (IST)</option>
                  <option value="GST">Gulf Standard Time (GST)</option>
                  <option value="SGT">Singapore Time (SGT)</option>
                </select>
              </div>
            </div>

            
          </div>
        </div>

      </div>
    </div>
  );
}
