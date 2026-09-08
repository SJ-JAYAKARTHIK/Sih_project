import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { FarmerLogin } from './portals/FarmerPortal/FarmerLogin';
import { FarmerRegister } from './portals/FarmerPortal/FarmerRegister';
import { FarmerDashboard } from './portals/FarmerPortal/FarmerDashboard';
import { MandiLogin } from './portals/MandiOfficerPortal/MandiLogin';
import { MandiDashboard } from './portals/MandiOfficerPortal/MandiDashboard';
import { AdminLogin } from './portals/AdminPortal/AdminLogin';
import { AdminDashboard } from './portals/AdminPortal/AdminDashboard';

const MainContainer = () => {
  const { activePortal, farmerUser, mandiUser, adminUser } = useApp();
  const [isRegisteringFarmer, setIsRegisteringFarmer] = useState(false);

  return (
    <div className="app-container">
      <Navbar />

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
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        textAlign: 'center',
        padding: '1rem',
        fontSize: '0.85rem',
        color: '#6B7280',
        marginTop: '2rem'
      }}>
        <div>SIH 2026 Problem Statement SIH26032 — <strong>Farmer Procurement Management System</strong></div>
        <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
          Connected Three-Portal Real-Time Prototype Architecture
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
