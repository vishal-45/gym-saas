import React, { useState, useEffect, useRef } from 'react';
import { QrCode, ShieldCheck, ShieldAlert, Clock, User, Zap, Camera, Monitor, Settings } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

export default function AuraKiosk() {
  const { tenant, token } = useGymContext();
  const [scanInput, setScanInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle, processing, success, denied
  const [lastMember, setLastMember] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Focus management for USB Scanners
  useEffect(() => {
    if (!useCamera) {
      const timer = setInterval(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [useCamera]);

  // Camera Management
  useEffect(() => {
    if (useCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [useCamera]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
        videoRef.current.play();
        scanIntervalRef.current = setInterval(scanFrame, 300);
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setCameraError(true);
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || status !== 'idle') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // jsQR is loaded via CDN in index.html
      if (window.jsQR) {
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          triggerCheckIn(code.data);
        }
      }
    }
  };

  const triggerCheckIn = async (memberId) => {
    if (status !== 'idle') return;
    
    setStatus('processing');
    const API_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
    
    try {
      const res = await fetch(`${API_URL}/attendance/check-in`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ memberId })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setLastMember(data.attendance.member);
        setTimeout(() => {
            setStatus('idle');
            setLastMember(null);
        }, 4000);
      } else {
        setStatus('denied');
        setErrorMsg(data.error);
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch (err) {
      setStatus('denied');
      setErrorMsg("Connection Offline.");
      setTimeout(() => setStatus('idle'), 4000);
    }
    setScanInput('');
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (scanInput) triggerCheckIn(scanInput);
  };

  return (
    <div style={{ 
        height: '100vh', width: '100vw', 
        backgroundColor: status === 'success' ? '#065f46' : status === 'denied' ? '#7f1d1d' : '#09090b',
        color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.5s ease', overflow: 'hidden', position: 'fixed', top: 0, left: 0, zIndex: 10000
    }}>
      
      {/* Dynamic Background Effects */}
      {status === 'success' && <div className="kiosk-pulse-green"></div>}
      {status === 'denied' && <div className="kiosk-pulse-red"></div>}

      {/* Header Info */}
      <div style={{ position: 'absolute', top: '2rem', left: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.6 }}>
        <Zap color="#8b5cf6" size={24} />
        <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '2px' }}>AURA KIOSK v1.1</span>
      </div>

      <div style={{ position: 'absolute', top: '2rem', right: '3rem', textAlign: 'right', opacity: 0.6 }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{tenant?.name || 'Secure Station'}</p>
        <p style={{ margin: 0, fontSize: '0.8rem' }}>{useCamera ? 'CAMERA SENSOR ACTIVE' : 'AWAITING EXTERNAL SCANNER'}</p>
      </div>

      {/* Main Scanner UI */}
      <div className="fade-in" style={{ textAlign: 'center', maxWidth: '600px', width: '90%' }}>
        {status === 'idle' && (
          <>
            <div style={{ marginBottom: '2rem', position: 'relative' }}>
              <div className="scanner-glow" style={{ 
                width: '240px', height: '240px', borderRadius: '40px', 
                border: '2px solid #8b5cf6', margin: '0 auto', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                position: 'relative', overflow: 'hidden',
                background: '#000'
              }}>
                {useCamera ? (
                  <video 
                    ref={videoRef} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                  />
                ) : (
                  <QrCode size={100} color="#8b5cf6" className="floating-icon" />
                )}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: '#8b5cf6', boxShadow: '0 0 20px #8b5cf6', animation: 'scan-line 2s infinite' }}></div>
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-2px' }}>READY TO TRAIN?</h1>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '2rem' }}>
                {useCamera ? 'Position your ID in front of the camera.' : 'Position your ID or scan with hardware.'}
            </p>
            
            <form onSubmit={handleManualSubmit}>
              <input 
                ref={inputRef}
                type="text"
                autoFocus
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder={useCamera ? "Awaiting visual detection..." : "Awaiting scanner input..."}
                style={{ 
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'white', padding: '1.25rem 2rem', borderRadius: '15px', 
                    fontSize: '1.2rem', textAlign: 'center', width: '100%', outline: 'none'
                }}
              />
            </form>

            {/* Mode Selector */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button 
                    onClick={() => setUseCamera(false)}
                    style={{ 
                        padding: '0.6rem 1.2rem', borderRadius: '10px', 
                        background: !useCamera ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                        border: 'none', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600
                    }}
                >
                    <Monitor size={16} /> USB Scanner
                </button>
                <button 
                    onClick={() => setUseCamera(true)}
                    style={{ 
                        padding: '0.6rem 1.2rem', borderRadius: '10px', 
                        background: useCamera ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                        border: 'none', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600
                    }}
                >
                    <Camera size={16} /> Tablet Camera
                </button>
            </div>
            {cameraError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '1rem' }}>Camera access failed. Check browser permissions.</p>}
          </>
        )}

        {status === 'processing' && (
          <div className="fade-in">
            <div className="pulse-dot" style={{ width: '80px', height: '80px', margin: '0 auto 2rem' }}></div>
            <h2 style={{ fontSize: '3rem', fontWeight: 900 }}>SECURE VERIFICATION...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="fade-in">
            <ShieldCheck size={180} color="#10b981" style={{ marginBottom: '2rem' }} />
            <h1 style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '0.5rem' }}>WELCOME</h1>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 700, color: '#a7f3d0' }}>{lastMember?.name || 'ATHLETE'}</h2>
            <p style={{ fontSize: '1.2rem', marginTop: '1rem', opacity: 0.8 }}>Identity Validated. Session Logged.</p>
          </div>
        )}

        {status === 'denied' && (
          <div className="fade-in">
            <ShieldAlert size={180} color="#f87171" style={{ marginBottom: '2rem' }} />
            <h1 style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>ACCESS DENIED</h1>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fca5a5' }}>{errorMsg || 'SECURITY EXCEPTION'}</h2>
            <p style={{ fontSize: '1.2rem', marginTop: '1rem', opacity: 0.8 }}>Please see a staff member immediately.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ position: 'absolute', bottom: '3rem', display: 'flex', gap: '4rem', opacity: 0.4 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} />
            <span style={{ fontWeight: 600 }}>{new Date().toLocaleTimeString()}</span>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} />
            <span style={{ fontWeight: 600 }}>ENCRYPTION ACTIVE</span>
         </div>
      </div>

      <style>{`
        @keyframes scan-line { 0% { top: 0; } 100% { top: 100%; } }
        .kiosk-pulse-green { position: absolute; width: 100%; height: 100%; background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%); animation: pulse-ring 2s infinite; }
        .kiosk-pulse-red { position: absolute; width: 100%; height: 100%; background: radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%); animation: pulse-ring 2s infinite; }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 0.2; } 100% { transform: scale(0.8); opacity: 0.5; } }
        .scanner-glow { box-shadow: 0 0 60px rgba(139, 92, 246, 0.2); }
      `}</style>
    </div>
  );
}
