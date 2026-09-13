import React from 'react';
import { Sprout, Store, Landmark, ArrowRight } from 'lucide-react';

export const LandingPage = ({ onGetStarted }) => {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#EFF7F1',
      backgroundImage: 'radial-gradient(circle at 85% 20%, rgba(220, 252, 231, 0.7) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(220, 252, 231, 0.6) 0%, transparent 45%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    }}>
      {/* ── Top Decorative Corner Leaf (Left) ── */}
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0.85 }}>
        <path d="M-20 20C20 40 60 40 90 10C50 40 30 70 -20 20Z" fill="#A7F3D0" fillOpacity="0.7"/>
        <path d="M-10 60C30 70 70 60 110 30C70 60 40 90 -10 60Z" fill="#86EFAC" fillOpacity="0.6"/>
        <path d="M-30 -10C10 20 50 10 80 -20C40 10 10 30 -30 -10Z" fill="#34D399" fillOpacity="0.5"/>
      </svg>

      {/* ── Bottom Decorative Corner Leaf (Right) ── */}
      <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none', opacity: 0.85, transform: 'scaleX(-1)' }}>
        <path d="M-20 20C20 40 60 40 90 10C50 40 30 70 -20 20Z" fill="#A7F3D0" fillOpacity="0.7"/>
        <path d="M-10 60C30 70 70 60 110 30C70 60 40 90 -10 60Z" fill="#86EFAC" fillOpacity="0.6"/>
      </svg>

      {/* ── 1. TOP HEADER BAR ── */}
      <header style={{
        maxWidth: '1540px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 40px 10px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box'
      }}>
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/assets/krishidwaar_wheat_logo.png"
            alt="KrishiDwaar Logo"
            style={{ height: '52px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#11382B', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              KrishiDwaar
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4B6358', marginTop: '2px', letterSpacing: '0.02em' }}>
              Farmers • Markets • Better Tomorrow
            </div>
          </div>
        </div>

        {/* Top Right Motto & Quick Access Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#527063', letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Empowering Farmers</span>
            <span style={{ color: '#A7F3D0' }}>|</span>
            <span>Strengthening Markets</span>
            <span style={{ color: '#A7F3D0' }}>|</span>
            <span>Building a Smarter Tomorrow</span>
          </div>

          <button
            onClick={() => onGetStarted && onGetStarted('farmer')}
            style={{
              backgroundColor: '#11382B',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 20px',
              borderRadius: '24px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(17, 56, 43, 0.25)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#15803D';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#11382B';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Portal Login →
          </button>
        </div>
      </header>

      {/* ── 2. HERO MAIN CONTENT ── */}
      <div style={{
        maxWidth: '1540px',
        width: '100%',
        margin: '0 auto',
        padding: '10px 40px 30px 40px',
        display: 'grid',
        gridTemplateColumns: '1.15fr 1fr',
        gap: '40px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 5,
        boxSizing: 'border-box'
      }}>
        {/* LEFT COLUMN: Text & Actions */}
        <div>
          {/* Category Eyebrow */}
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#15803D',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: '14px'
          }}>
            WELCOME TO KRISHIDWAAR
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: '3.1rem',
            fontWeight: 800,
            color: '#11382B',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 20px 0'
          }}>
            From Farm to Market,<br />
            <span style={{ color: '#166534' }}>We Bridge the Gap</span>
          </h1>

          {/* Subtitle Paragraph */}
          <p style={{
            fontSize: '1.05rem',
            color: '#4B6358',
            lineHeight: 1.6,
            maxWidth: '510px',
            margin: '0 0 32px 0',
            fontWeight: 500
          }}>
            A unified platform for farmers, mandis and administrators to ensure transparent, efficient and seamless agri-procurement services.
          </p>

          {/* Primary Action Button */}
          <div style={{ marginBottom: '40px' }}>
            <button
              onClick={() => onGetStarted && onGetStarted('farmer')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#0E6E41',
                color: '#FFFFFF',
                fontSize: '1.1rem',
                fontWeight: 700,
                padding: '12px 28px 12px 14px',
                borderRadius: '40px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(14, 110, 65, 0.28)',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#107F4B';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 110, 65, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0E6E41';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(14, 110, 65, 0.28)';
              }}
            >
              {/* White Circle Arrow Icon */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ArrowRight size={20} color="#0E6E41" strokeWidth={2.8} />
              </div>
              <span>Get Started</span>
            </button>
          </div>

          {/* 3 Column Feature Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            paddingTop: '10px'
          }}>
            {/* Feature 1: For Farmers */}
            <div
              onClick={() => onGetStarted && onGetStarted('farmer')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid #C8E3CE',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(21, 128, 61, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.65)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="Click to enter Farmer Portal"
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sprout size={22} color="#15803D" />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#11382B' }}>
                  For Farmers
                </div>
                <div style={{ fontSize: '0.78rem', color: '#527063', marginTop: '2px', lineHeight: 1.3 }}>
                  Better Prices<br />&amp; Fair Opportunities
                </div>
              </div>
            </div>

            {/* Feature 2: For Mandis */}
            <div
              onClick={() => onGetStarted && onGetStarted('mandi')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid #C8E3CE',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(21, 128, 61, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.65)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="Click to enter Mandi Officer Portal"
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Store size={22} color="#15803D" />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#11382B' }}>
                  For Mandis
                </div>
                <div style={{ fontSize: '0.78rem', color: '#527063', marginTop: '2px', lineHeight: 1.3 }}>
                  Smarter Operations<br />&amp; Transparent Trade
                </div>
              </div>
            </div>

            {/* Feature 3: For Administrators */}
            <div
              onClick={() => onGetStarted && onGetStarted('admin')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid #C8E3CE',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(21, 128, 61, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.65)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="Click to enter Admin Portal"
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Landmark size={22} color="#15803D" />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#11382B' }}>
                  For Administrators
                </div>
                <div style={{ fontSize: '0.78rem', color: '#527063', marginTop: '2px', lineHeight: 1.3 }}>
                  Real-time Insights<br />&amp; Efficient Management
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Circular Illustration & Floating Badges */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '560px' }}>
            <img
              src="/assets/krishidwaar_hero_circular_illustration.jpg"
              alt="KrishiDwaar Farmer & Mandi Procurement Platform"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '24px',
                objectFit: 'contain',
                display: 'block',
                filter: 'drop-shadow(0 10px 25px rgba(21, 128, 61, 0.12))'
              }}
              onError={(e) => {
                e.target.src = '/assets/14_welcome_right_illustration.png';
              }}
            />
          </div>
        </div>
      </div>

      {/* ── 3. BOTTOM LANDSCAPE WAVE DECORATION ── */}
      <div style={{ position: 'relative', width: '100%', pointerEvents: 'none' }}>
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="none">
          <path d="M0 30C240 10 480 40 720 20C960 0 1200 35 1440 15V80H0V30Z" fill="#D2EAD6" fillOpacity="0.6"/>
          <path d="M0 45C320 25 640 55 960 35C1280 15 1380 30 1440 25V80H0V45Z" fill="#BAE3BF" fillOpacity="0.5"/>
        </svg>
      </div>
    </div>
  );
};
