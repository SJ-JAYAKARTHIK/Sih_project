import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { FarmerLogin } from './portals/FarmerPortal/FarmerLogin';
import { FarmerRegister } from './portals/FarmerPortal/FarmerRegister';
import { FarmerDashboard } from './portals/FarmerPortal/FarmerDashboard';
import { MandiLogin } from './portals/MandiOfficerPortal/MandiLogin';
import { MandiDashboard } from './portals/MandiOfficerPortal/MandiDashboard';
import { AdminLogin } from './portals/AdminPortal/AdminLogin';
import { AdminDashboard } from './portals/AdminPortal/AdminDashboard';

const MainContainer = () => {
  const { activePortal, setActivePortal, farmerUser, mandiUser, adminUser } = useApp();
  const [isRegisteringFarmer, setIsRegisteringFarmer] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const isLoggedIn = Boolean(farmerUser || mandiUser || adminUser);

  const handleGetStarted = (targetPortal = 'farmer') => {
    if (targetPortal) {
      setActivePortal(targetPortal);
    }
    setHasStarted(true);
  };

  // 1. Initial Entry Page: Always land on Home Page (LandingPage) first when entering website
  if (!hasStarted) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="app-container">
      <Navbar onBackToLanding={() => setHasStarted(false)} />

      <main className="main-content">
        {/* FARMER PORTAL VIEW */}
        {activePortal === 'farmer' && (
          farmerUser ? (
            <FarmerDashboard />
          ) : isRegisteringFarmer ? (
            <FarmerRegister onSwitchToLogin={() => setIsRegisteringFarmer(false)} />
          ) : (
            <FarmerLogin onSwitchToRegister={() => setIsRegisteringFarmer(true)} />
          )
        )}

        {/* MANDI OFFICER PORTAL VIEW */}
        {activePortal === 'mandi' && (
          mandiUser ? (
            <MandiDashboard />
          ) : (
            <MandiLogin />
          )
        )}

        {/* ADMIN PORTAL VIEW */}
        {activePortal === 'admin' && (
          adminUser ? (
            <AdminDashboard />
          ) : (
            <AdminLogin />
          )
        )}
      </main>

      <footer style={{
        position: 'relative',
        marginTop: 'auto',
        backgroundColor: '#EAF4EC',
        borderTop: '1px solid #D1E5D5',
        overflow: 'hidden'
      }}>
        {/* Green Hill Wave Landscape SVG Background */}
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            opacity: 0.85
          }}
          preserveAspectRatio="none"
        >
          <path d="M0 40C240 10 480 50 720 30C960 10 1200 45 1440 25V100H0V40Z" fill="#D3EAD6" fillOpacity="0.7"/>
          <path d="M0 60C320 35 640 70 960 45C1280 20 1380 40 1440 35V100H0V60Z" fill="#BFE3C4" fillOpacity="0.6"/>
        </svg>

        {/* Left Leaf Sprout */}
        <svg width="100" height="70" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: 0, bottom: 0, pointerEvents: 'none', opacity: 0.95 }}>
          <path d="M10 70C20 40 45 20 70 10C50 35 30 55 10 70Z" fill="#15803D" fillOpacity="0.6"/>
          <path d="M0 70C15 30 50 15 85 5C60 30 35 55 0 70Z" fill="#166534" fillOpacity="0.7"/>
          <path d="M30 70C40 50 70 30 100 20C80 45 55 60 30 70Z" fill="#86EFAC" fillOpacity="0.8"/>
        </svg>

        {/* Right Leaf Sprout */}
        <svg width="100" height="70" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', right: 0, bottom: 0, pointerEvents: 'none', opacity: 0.95, transform: 'scaleX(-1)' }}>
          <path d="M10 70C20 40 45 20 70 10C50 35 30 55 10 70Z" fill="#15803D" fillOpacity="0.6"/>
          <path d="M0 70C15 30 50 15 85 5C60 30 35 55 0 70Z" fill="#166534" fillOpacity="0.7"/>
          <path d="M30 70C40 50 70 30 100 20C80 45 55 60 30 70Z" fill="#86EFAC" fillOpacity="0.8"/>
        </svg>

        <div style={{
          maxWidth: '1640px',
          margin: '0 auto',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.82rem',
          color: '#374151',
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <strong style={{ color: '#166534', fontWeight: 800 }}>KrishiDwaar</strong> — SIH 2026 Problem Statement SIH26032 — Farmer Procurement Management System
          </div>
          <div style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600 }}>
            Three-Portal Real-Time Architecture · WebSocket Sync
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContainer />
    </AppProvider>
  );
}
