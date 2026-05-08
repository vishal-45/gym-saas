import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useGymContext } from '../../context/GymContext';
import { Camera, CheckCircle, XCircle, Users } from 'lucide-react';

export default function AttendanceScanner() {
  const { checkInMember, attendance } = useGymContext();
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    let scanner;
    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 } 
      });

      scanner.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [isScanning]);

  async function onScanSuccess(decodedText) {
    // Expected decodedText is the member uuid
    setIsScanning(false);
    setStatus({ type: 'loading', message: 'Verifying member...' });
    
    const res = await checkInMember(decodedText);
    
    if (res.success) {
      setStatus({ type: 'success', message: res.message });
      setScanResult(res.attendance);
    } else {
      setStatus({ type: 'error', message: res.error || "Unknown member" });
    }

    // Reset after 3 seconds to allow next scan
    setTimeout(() => {
      setStatus({ type: '', message: '' });
      setScanResult(null);
      setIsScanning(true);
    }, 3000);
  }

  function onScanError(err) {
    // console.warn(err);
  }

  return (
    <div className="members-page fade-in">
      <div className="page-actions-bar">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Front Desk Check-In</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Point the camera at a member's Digital ID to log their visit.</p>
        </div>
        <button 
          className={isScanning ? "btn-secondary" : "btn-primary"} 
          onClick={() => setIsScanning(!isScanning)}
        >
          <Camera size={18} /> {isScanning ? "Stop Scanner" : "Start Scanner"}
        </button>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem', paddingTop: 0 }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', background: 'var(--bg-primary)', borderStyle: 'dashed' }}>
          {!isScanning && !status.message && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Camera size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Scanner is offline. Click "Start Scanner" above.</p>
            </div>
          )}
          
          <div id="reader" style={{ width: '100%', display: isScanning ? 'block' : 'none' }}></div>

          {status.message && (
            <div className={`fade-in`} style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : (status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)'),
                borderRadius: '12px',
                width: '80%'
            }}>
              {status.type === 'success' && <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />}
              {status.type === 'error' && <XCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />}
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{status.message}</h3>
              {scanResult && <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Checked in at {new Date(scanResult.timestamp).toLocaleTimeString()}</p>}
            </div>
          )}
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
              <Users size={18} color="var(--brand-primary)" />
            </span> 
            Today's Check-ins
          </h3>
          <div className="activity-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
             {attendance && attendance.length > 0 ? (
               attendance.slice(0, 10).map((record, index) => (
                 <div key={record.id || index} className="activity-item fade-in" style={{ padding: '0.75rem', marginBottom: '0.75rem' }}>
                   <div className="activity-user">
                     <div className="avatar micro" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                       {record.member?.name?.charAt(0) || 'U'}
                     </div>
                     <div className="activity-details">
                       <p style={{ fontSize: '0.9rem' }}>{record.member?.name || 'Unknown Member'}</p>
                       <span style={{ fontSize: '0.75rem' }}>{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                   </div>
                 </div>
               ))
             ) : (
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
                 No scans recorded today yet.
               </p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
