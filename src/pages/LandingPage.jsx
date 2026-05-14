import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, ShieldCheck, Zap, TrendingUp, Users, CreditCard, CheckCircle, ArrowRight, Star, Heart, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={{ background: '#09090b', color: '#fff', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, background: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="landing-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', width: '35px', height: '35px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell size={20} color="white" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-1px' }}>CORE<span style={{ color: '#8b5cf6' }}>FIT</span></span>
          </div>
          
          <div className="landing-navbar-links" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Features</a>
            <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Pricing</a>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Login</Link>
            <Link to="/register-gym" style={{ background: '#8b5cf6', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}>Start Free Trial</Link>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ display: 'none', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
            className="mobile-menu-btn"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="fade-in" style={{ padding: '2rem', background: '#09090b', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <a href="#features" onClick={() => setIsMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem' }}>Features</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem' }}>Pricing</a>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem' }}>Login</Link>
            <Link to="/register-gym" style={{ background: '#8b5cf6', color: 'white', padding: '1rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, textAlign: 'center' }}>Start Free Trial</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: '10rem', paddingBottom: '8rem', position: 'relative' }}>
        <div className="landing-glow" style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
        
        <div className="landing-hero-grid">
          <div className="landing-hero-content">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '20px', color: '#8b5cf6', fontWeight: 700, fontSize: '0.8rem', marginBottom: '2rem' }}>
              <Zap size={14} /> NEW: Aura Kiosk v1.1 is now live
            </div>
            <h1 className="landing-title">
              The Operating System for <span style={{ background: 'linear-gradient(to right, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Elite Gyms.</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '3rem', maxWidth: '500px' }}>
              Stop managing. Start scaling. A complete SaaS ecosystem for modern gym owners, trainers, and athletes.
            </p>
            <div className="landing-hero-actions" style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/register-gym" style={{ background: '#8b5cf6', color: 'white', padding: '1.25rem 2.5rem', borderRadius: '16px', textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)' }}>
                Register Your Gym <ArrowRight size={20} />
              </Link>
              <Link to="/login" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem 2.5rem', borderRadius: '16px', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem' }}>
                View Demo
              </Link>
            </div>
            
            <div className="landing-stats" style={{ marginTop: '4rem', display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>500+</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Active Tenants</span>
              </div>
              <div className="stat-divider" style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>99.9%</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Uptime Secure</span>
              </div>
            </div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div style={{ 
              borderRadius: '32px', 
              overflow: 'hidden', 
              boxShadow: '0 40px 100px rgba(0,0,0,0.8)', 
              border: '1px solid rgba(255,255,255,0.1)',
              position: 'relative',
              zIndex: 2,
              background: '#0c0c0e'
            }}>
              <img 
                src="/gym_saas_hero_main_1777874638146.png" 
                alt="Gym SaaS Platform" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            {/* Floating UI Badges */}
            <div className="hero-badge" style={{ position: 'absolute', top: '-20px', right: '-20px', background: 'rgba(139, 92, 246, 0.95)', padding: '1rem 1.5rem', borderRadius: '16px', backdropFilter: 'blur(10px)', zIndex: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={24} color="#fff" />
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem' }}>Enterprise Grade</p>
                <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.8 }}>Secure Data Tunneling</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '10rem 0', background: '#0c0c0e' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px', marginBottom: '1.5rem' }} className="header-title">Unfair Advantage Tools</h2>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>We don't just provide a dashboard. We provide tools that help you out-compete every other gym in your city.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            <div className="feature-card" style={{ padding: '3rem', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                <Zap color="#8b5cf6" size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Aura Attendance Kiosk</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
                Automated check-ins with camera-based QR scanning. Visual feedback systems that handle your front door so you can focus on training.
              </p>
            </div>

            <div className="feature-card" style={{ padding: '3rem', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                <Heart color="#10b981" size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Elite Wellness Matrix</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
                Deploy structured workout and nutrition protocols. Interactive member adherence scores and live macro calculation tools.
              </p>
            </div>

            <div className="feature-card" style={{ padding: '3rem', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                <CreditCard color="#3b82f6" size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Global Billing Engine</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
                Automated subscription billing, Razorpay/Stripe integration, and professional tax invoicing for all your gym members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '10rem 0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px', marginBottom: '1.5rem' }} className="header-title">Simple, Transparent Pricing</h2>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Scale from one boutique studio to a nationwide franchise.</p>
          </div>
          
          <div className="pricing-grid">
            <div style={{ padding: '3rem', borderRadius: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>The Starter</h3>
               <p style={{ color: '#94a3b8', marginBottom: '2.5rem' }}>Perfect for boutique gyms and new studios.</p>
               <div style={{ marginBottom: '3rem' }}>
                  <span style={{ fontSize: '4rem', fontWeight: 900 }}>$49</span>
                  <span style={{ fontSize: '1.2rem', color: '#64748b' }}>/month</span>
               </div>
               <ul style={{ listStyle: 'none', padding: 0, marginBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="#10b981" /> Up to 200 Members</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="#10b981" /> Aura Kiosk Basic</li>
               </ul>
               <Link to="/register-gym" style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', justifyContent: 'center', textDecoration: 'none', fontWeight: 800 }}>Select Basic</Link>
            </div>

            <div style={{ padding: '3rem', borderRadius: '40px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))', border: '2px solid #8b5cf6', position: 'relative' }}>
               <div style={{ position: 'absolute', top: '2rem', right: '2rem', background: '#8b5cf6', color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px' }}>MOST POPULAR</div>
               <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>The Powerhouse</h3>
               <p style={{ color: '#94a3b8', marginBottom: '2.5rem' }}>Everything you need for a growing gym ecosystem.</p>
               <div style={{ marginBottom: '3rem' }}>
                  <span style={{ fontSize: '4rem', fontWeight: 900 }}>$99</span>
                  <span style={{ fontSize: '1.2rem', color: '#64748b' }}>/month</span>
               </div>
               <ul style={{ listStyle: 'none', padding: 0, marginBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="#10b981" /> Unlimited Members</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="#10b981" /> Full Aura Kiosk Suite</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="#10b981" /> Elite Wellness Matrix</li>
               </ul>
               <Link to="/register-gym" style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: '#8b5cf6', color: 'white', display: 'flex', justifyContent: 'center', textDecoration: 'none', fontWeight: 800, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.2)' }}>Get Started Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '10rem 0', background: 'linear-gradient(to bottom, #09090b, #0c0c0e)' }}>
         <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
            <h2 className="header-title" style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-3px', marginBottom: '2rem' }}>Ready to build your <br/><span style={{ color: '#8b5cf6' }}>Gym Empire?</span></h2>
            <p style={{ fontSize: '1.4rem', color: '#94a3b8', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem' }}>Join 500+ other gyms who have already switched to CoreFit. Register in under 60 seconds.</p>
            <Link to="/register-gym" style={{ background: '#8b5cf6', color: 'white', padding: '1.5rem 4rem', borderRadius: '20px', textDecoration: 'none', fontWeight: 900, fontSize: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '1rem', boxShadow: '0 30px 60px rgba(139, 92, 246, 0.2)' }}>
               Deploy Your Gym <ArrowRight size={28} />
            </Link>
         </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '6rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.5 }}>
            <Dumbbell size={24} />
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>CORE<span style={{ color: '#8b5cf6' }}>FIT</span></span>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
            © 2026 CoreFit SaaS. Built for the Next Generation of Fitness.
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
             <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Twitter</a>
             <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>LinkedIn</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fade-in 1s ease-out forwards; }
        .hover-lift { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .hover-lift:hover { transform: translateY(-10px); }
        .feature-card:hover { transform: translateY(-10px); border-color: rgba(139, 92, 246, 0.3) !important; background: rgba(255,255,255,0.04) !important; }
        html { scroll-behavior: smooth; }
        
        @media (max-width: 1024px) {
            .mobile-menu-btn { display: flex !important; }
            .landing-navbar-links { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const XCircle = ({ size = 20, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);
