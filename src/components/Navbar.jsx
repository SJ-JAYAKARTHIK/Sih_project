import React from 'react';
import { useApp } from '../context/AppContext';
import { Sprout, UserCheck, Shield, Globe, LogOut, Radio } from 'lucide-react';

export const Navbar = () => {
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
    t,
    wsConnected 
  } = useApp();

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FCD34D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D97706'
          }}>
            <Sprout size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
              Agri<span style={{ color: '#D97706' }}>Procure</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#6B7280' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: wsConnected ? '#10B981' : '#F59E0B',
                display: 'inline-block'
              }} />
              <span>SIH26032 Connected Procurement</span>
            </div>
          </div>
        </div>

        {/* Portal Switcher Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#F3F4F6',
          padding: '0.25rem',
          borderRadius: '10px',
          gap: '0.25rem'
        }}>
          <button
            onClick={() => setActivePortal('farmer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: activePortal === 'farmer' ? '#FFFFFF' : 'transparent',
              color: activePortal === 'farmer' ? '#D97706' : '#4B5563',
              boxShadow: activePortal === 'farmer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Sprout size={16} />
            <span>{t('portalFarmer')}</span>
          </button>

          <button
            onClick={() => setActivePortal('mandi')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: activePortal === 'mandi' ? '#FFFFFF' : 'transparent',
              color: activePortal === 'mandi' ? '#D97706' : '#4B5563',
              boxShadow: activePortal === 'mandi' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <UserCheck size={16} />
            <span>{t('portalMandi')}</span>
          </button>

          <button
            onClick={() => setActivePortal('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: activePortal === 'admin' ? '#FFFFFF' : 'transparent',
              color: activePortal === 'admin' ? '#D97706' : '#4B5563',
              boxShadow: activePortal === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Shield size={16} />
            <span>{t('portalAdmin')}</span>
          </button>
        </div>

        {/* Right Controls: Language Switcher & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Language Selection for Farmer Portal */}
          {activePortal === 'farmer' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', backgroundColor: '#FEF3C7', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid #FCD34D' }}>
              <Globe size={16} color="#B45309" />
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: '#92400E',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="EN">English</option>
                <option value="TE">తెలుగు (Telugu)</option>
                <option value="HI">हिंदी (Hindi)</option>
              </select>
            </div>
          )}

          {/* User Info / Logout */}
          {activePortal === 'farmer' && farmerUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 700, color: '#111827' }}>{farmerUser.name}</div>
                <div style={{ color: '#6B7280' }}>ID: {farmerUser.id}</div>
              </div>
              <button 
                onClick={logoutFarmer} 
                className="btn btn-outline btn-sm"
                title={t('navLogout')}
                style={{ padding: '0.35rem 0.6rem' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          )}

          {activePortal === 'mandi' && mandiUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 700, color: '#111827' }}>{mandiUser.name}</div>
                <div style={{ color: '#6B7280' }}>Mandi ID: {mandiUser.id}</div>
              </div>
              <button 
                onClick={logoutMandi} 
                className="btn btn-outline btn-sm"
                title="Logout Mandi"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          )}

          {activePortal === 'admin' && adminUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 700, color: '#111827' }}>Admin Portal</div>
                <div style={{ color: '#6B7280' }}>System Administrator</div>
              </div>
              <button 
                onClick={logoutAdmin} 
                className="btn btn-outline btn-sm"
                title="Logout Admin"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
