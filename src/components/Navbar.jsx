import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Globe, LogOut, Menu, X, Landmark, Shield, ChevronDown, User, Home } from 'lucide-react';

export const Navbar = ({ onBackToLanding }) => {
  const {
    activePortal,
    setActivePortal,
    farmerUser,
    mandiUser,
    adminUser,
    logoutFarmer,
    logoutMandi,
    logoutAdmin,
    language,
    changeLanguage,
    t
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const activeUser = activePortal === 'farmer' ? farmerUser
    : activePortal === 'mandi' ? mandiUser
    : adminUser;

  const handleLogout = activePortal === 'farmer' ? logoutFarmer
    : activePortal === 'mandi' ? logoutMandi
    : logoutAdmin;

  const isLoggedIn = Boolean(activeUser);

  const displayName = isLoggedIn
    ? (activePortal === 'admin' ? 'Admin' : activeUser?.name || 'User')
    : (activePortal === 'admin' ? 'Admin Portal' : activePortal === 'mandi' ? 'Mandi Portal' : 'Farmer Portal');

  const displayId = isLoggedIn
    ? (activePortal === 'admin'
        ? `ID: ${activeUser?.id || 'ADM001'}`
        : activePortal === 'mandi'
          ? `Mandi ID: ${activeUser?.id}`
          : `Farmer ID: ${activeUser?.id}`)
    : 'Not Logged In';

  return (
    <header style={{
      backgroundColor: '#11382B',
      height: '82px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid #0D2C22',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
    }}>
      <div style={{
        maxWidth: '1640px',
        margin: '0 auto',
        height: '100%',
        padding: '0 35px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>

        {/* ── BRAND LOGO & TAGLINE ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => {
            if (onBackToLanding) {
              onBackToLanding();
            } else {
              setActivePortal('farmer');
            }
          }}
          title="Return to KrishiDwaar Starting Page"
        >
          <img
            src="/assets/krishidwaar_wheat_logo.png"
            alt="KrishiDwaar - Farmers · Markets · Better Tomorrow"
            style={{
              height: '48px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
              fontSize: '25px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              KrishiDwaar
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              color: '#7ECEBE',
              letterSpacing: '0.04em',
              lineHeight: 1,
              marginTop: '3px'
            }}>
              Farmers • Markets • Better Tomorrow
            </div>
          </div>
        </div>

        {/* ── CENTER PORTAL SWITCHER (Desktop) ── */}
        <div className="portal-switcher-desktop" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {onBackToLanding && (
            <button
              onClick={() => { onBackToLanding(); setMobileMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                marginRight: '6px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              title="Return to Starting Page"
            >
              <Home size={16} color="#FFFFFF" />
              <span>Home</span>
            </button>
          )}
          {/* 1. Farmer Portal */}
          <button
            onClick={() => { setActivePortal('farmer'); setMobileMenuOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '24px',
              backgroundColor: activePortal === 'farmer' ? '#235E43' : 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            {/* Farmer with Hat Icon matching screenshot */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 11C4 11 7 10 12 10C17 10 20 11 20 11C21 11 22 11.5 22 12.5C22 13 21 13.5 19 13.5C18 13.5 6 13.5 5 13.5C3 13.5 2 13 2 12.5C2 11.5 3 11 4 11Z" fill="#FFFFFF"/>
              <path d="M7.5 10.5C7.5 7.5 9 5.5 12 5.5C15 5.5 16.5 7.5 16.5 10.5Z" fill="#FFFFFF"/>
              <circle cx="12" cy="14" r="3.2" fill="#FFFFFF"/>
              <path d="M6.5 21C6.5 18.2 8.8 17.2 12 17.2C15.2 17.2 17.5 18.2 17.5 21" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round"/>
            </svg>
            <span>{t('portalFarmer') || 'Farmer Portal'}</span>
          </button>

          {/* 2. Mandi Officer Portal */}
          <button
            onClick={() => { setActivePortal('mandi'); setMobileMenuOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '24px',
              backgroundColor: activePortal === 'mandi' ? '#235E43' : 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: activePortal === 'mandi' ? 700 : 500,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <Landmark size={18} color="#FFFFFF" />
            <span>{t('portalMandi') || 'Mandi Officer Portal'}</span>
          </button>

          {/* 3. Admin Portal */}
          <button
            onClick={() => { setActivePortal('admin'); setMobileMenuOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '24px',
              backgroundColor: activePortal === 'admin' ? '#235E43' : 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: activePortal === 'admin' ? 700 : 500,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <Shield size={18} color="#FFFFFF" />
            <span>{t('portalAdmin') || 'Admin Portal'}</span>
          </button>
        </div>

        {/* ── RIGHT CONTROLS ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>

          {/* Language selector pill */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: '7px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            cursor: 'pointer'
          }}>
            <Globe size={16} color="#FFFFFF" />
            <span style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.88rem' }}>
              {language === 'HI' ? 'हिंदी' : language === 'TE' ? 'తెలుగు' : 'English'}
            </span>
            <ChevronDown size={14} color="#FFFFFF" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
              aria-label="Select language"
            >
              <option value="EN" style={{ color: '#11382B' }}>English</option>
              <option value="TE" style={{ color: '#11382B' }}>తెలుగు</option>
              <option value="HI" style={{ color: '#11382B' }}>हिंदी</option>
            </select>
          </div>

          {/* User profile menu — rendered ONLY after login */}
          {isLoggedIn && (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  padding: '4px 14px 4px 6px',
                  borderRadius: '30px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer'
                }}
              >
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
                  <User size={20} color="#11382B" />
                </div>

                <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap'
                  }}>
                    {displayName}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'rgba(255, 255, 255, 0.75)',
                    whiteSpace: 'nowrap'
                  }}>
                    {displayId}
                  </div>
                </div>

                <ChevronDown size={14} color="#FFFFFF" style={{ marginLeft: '4px' }} />
              </div>

              {/* Profile / Logout Dropdown */}
              {profileDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '52px',
                  right: 0,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  border: '1px solid #E5E7EB',
                  width: '190px',
                  padding: '6px',
                  zIndex: 200
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', fontSize: '0.78rem', color: '#6B7280' }}>
                    Signed in as <strong>{displayName}</strong>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#DC2626',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .portal-switcher-desktop { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
        }
      `}</style>

      {/* Mobile portal switcher dropdown */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '82px',
          left: 0,
          right: 0,
          backgroundColor: '#11382B',
          borderBottom: '2px solid #235E43',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          zIndex: 99,
          padding: '1rem 1.5rem'
        }}>
          {[
            { key: 'farmer', label: 'Farmer Portal' },
            { key: 'mandi', label: 'Mandi Officer Portal' },
            { key: 'admin', label: 'Admin Portal' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setActivePortal(key); setMobileMenuOpen(false); }}
              style={{
                width: '100%',
                padding: '10px 14px',
                marginBottom: '8px',
                borderRadius: '8px',
                backgroundColor: activePortal === key ? '#235E43' : 'rgba(255,255,255,0.05)',
                color: '#FFFFFF',
                fontWeight: activePortal === key ? 700 : 500,
                border: 'none',
                textAlign: 'left',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
