import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MandiAnalysis } from './MandiAnalysis';
import { FarmerAnalysis } from './FarmerAnalysis';
import { DailyReports } from './DailyReports';
import { AdminComplaints } from './AdminComplaints';
import {
  Shield, Building2, Users, Calendar, CheckCircle2,
  Scale, CreditCard, RefreshCw, AlertTriangle,
  LayoutDashboard, Store, XCircle, FileText
} from 'lucide-react';

/* ── Custom Rupee Icon for Payment Card ── */
const RupeeIcon = ({ color = "#2563EB" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12M6 8h12M6 13l8.5 8M6 8a4.5 4.5 0 0 0 0 9h1" />
  </svg>
);

/* ── Custom Red Hazard Icon for Pending Card ── */
const RedHazardIcon = ({ color = "#DC2626" }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="2.5" fill={color} />
    <path d="M12 9.5V4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9.8 13.2L5 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M14.2 13.2L19 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ── 2-Leaf Watermark for Stat Cards matching reference image ── */
const CardLeafWatermark = () => (
  <svg
    width="70"
    height="75"
    viewBox="0 0 70 75"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: 'absolute',
      right: '12px',
      bottom: '8px',
      opacity: 0.65,
      pointerEvents: 'none'
    }}
  >
    <path
      d="M20 68 C 30 48, 45 30, 56 12"
      stroke="#CBE4D3"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M32 50 C 18 44, 10 32, 20 22 C 30 30, 32 40, 32 50 Z"
      fill="#D9ECE0"
    />
    <path
      d="M56 12 C 48 4, 38 8, 40 18 C 50 18, 54 14, 56 12 Z"
      fill="#D9ECE0"
    />
  </svg>
);

/* ── Reusable OverviewBanner Component ── */
export const OverviewBanner = ({ selectedDate, onDateChange, onRefresh }) => (
  <div style={{
    backgroundColor: '#EDF6F0',
    borderRadius: '16px',
    padding: '20px 28px',
    marginBottom: '20px',
    border: '1px solid #D2E7D6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '88px'
  }}>
    {/* Left Title Box */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1 }}>
      <div style={{
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        backgroundColor: '#DCFCE7',
        border: '1px solid #86EFAC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <img
          src="/assets/admin_portal_assets/07_overview_banner_icon.png"
          alt="Shield Icon"
          style={{ width: '28px', height: '28px', objectFit: 'contain' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <Shield size={24} color="#15803D" style={{ display: 'none' }} />
      </div>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.38rem', color: '#0F532B', fontWeight: 800, letterSpacing: '-0.01em' }}>
          Admin Portal — State Overview
        </h1>
        <div style={{ fontSize: '0.86rem', color: '#52635B', marginTop: '2px', fontWeight: 500 }}>
          Real-time monitoring across all mandis &amp; procurement activities
        </div>
      </div>
    </div>

    {/* Right Controls */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1, flexWrap: 'wrap' }}>
      {/* Date Selector Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #C8E3CE',
        padding: '6px 14px',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <Calendar size={16} color="#15803D" />
        <input
          type="date"
          style={{
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: '0.88rem',
            outline: 'none',
            color: '#0F532B',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #C8E3CE',
          color: '#15803D',
          padding: '7px 15px',
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '0.88rem',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FAF2'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
      >
        <RefreshCw size={15} color="#15803D" />
        <span>Refresh</span>
      </button>
    </div>
  </div>
);

/* ── Reusable DashboardTabs Component ── */
export const DashboardTabs = ({ tabs, activeTab, onTabChange }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginTop: '16px',
    marginBottom: '24px',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '0',
    overflowX: 'auto'
  }}>
    {tabs.map(({ key, label, icon: Icon }) => {
      const isActive = activeTab === key;
      return (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 4px 12px 4px',
            border: 'none',
            backgroundColor: 'transparent',
            color: isActive ? '#0F532B' : '#52635B',
            fontWeight: isActive ? 800 : 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            position: 'relative',
            borderBottom: isActive ? '3px solid #0F532B' : '3px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <Icon size={18} color={isActive ? '#0F532B' : '#52635B'} strokeWidth={isActive ? 2.5 : 2} />
          <span>{label}</span>
        </button>
      );
    })}
  </div>
);

/* ── Reusable KPICard Component ── */
export const KPICard = ({
  title,
  value,
  description,
  accentColor,
  iconBgColor,
  iconColor,
  icon: Icon
}) => (
  <div style={{
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    borderLeft: `4px solid ${accentColor}`,
    padding: '18px 22px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  }}>
    <CardLeafWatermark />
    <div style={{
      width: '46px',
      height: '46px',
      borderRadius: '50%',
      backgroundColor: iconBgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={22} color={iconColor} />
    </div>
    <div>
      <div style={{ fontSize: '11px', fontWeight: 800, color: iconColor, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {title}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 800, color: title === "TODAY'S BOOKINGS" ? '#EA580C' : title === 'VERIFIED ARRIVALS' ? '#059669' : title === 'PENDING / NOT ARRIVED' ? '#DC2626' : title === 'COMPLETED PROCUREMENTS' ? '#9333EA' : title === 'TOTAL QTY PROCURED' ? '#0D9488' : title === 'TOTAL PAYMENT PROCESSED' ? '#2563EB' : '#11382B', lineHeight: 1.1, margin: '2px 0' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: '#64748B' }}>
        {description}
      </div>
    </div>
  </div>
);

/* ── Bottom Corner Leaf Illustration Component ── */
export const BottomLeafDecoration = () => (
  <div style={{
    position: 'absolute',
    bottom: '-25px',
    left: '-20px',
    right: '-20px',
    pointerEvents: 'none',
    zIndex: 0,
    display: 'flex',
    justifyContent: 'space-between'
  }}>
    <img
      src="/assets/admin_portal_assets/26_bottom_left_decoration.png"
      alt="Bottom Left Decoration"
      style={{ width: '260px', height: 'auto', objectFit: 'contain' }}
      onError={(e) => { e.target.style.display = 'none'; }}
    />
    <img
      src="/assets/admin_portal_assets/27_bottom_right_decoration.png"
      alt="Bottom Right Decoration"
      style={{ width: '260px', height: 'auto', objectFit: 'contain' }}
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  </div>
);

const defaultAdminStats = {
  date: new Date().toISOString().split('T')[0],
  totalMandis: 4,
  totalFarmers: 6,
  todayBooked: 1,
  todayVerified: 0,
  todayPending: 1,
  todayCompleted: 0,
  totalQtyProcuredToday: 0,
  totalPaymentAmountToday: 0,
  mandiStats: [
    { mandiId: 'MANDI01', mandiName: 'Warangal Agriculture Market', location: 'Enugulagadda, Warangal, Telangana', booked: 1, verified: 1, pending: 1, completed: 0, totalQty: 0, totalPayment: 0 },
    { mandiId: 'MANDI02', mandiName: 'Nizamabad APMC Mandi', location: 'Market Yard, Nizamabad, Telangana', booked: 0, verified: 1, pending: 1, completed: 0, totalQty: 0, totalPayment: 0 },
    { mandiId: 'MANDI03', mandiName: 'Guntur Grain Yard', location: 'Guntur Central, Andhra Pradesh', booked: 0, verified: 1, pending: 1, completed: 0, totalQty: 0, totalPayment: 0 },
    { mandiId: 'MANDI04', mandiName: 'Khammam Procurement Yard', location: 'Wyra Road, Khammam, Telangana', booked: 0, verified: 1, pending: 1, completed: 0, totalQty: 0, totalPayment: 0 },
  ],
  cropStats: [
    { cropId: 'crop-1', cropName: 'Paddy / Rice (వరి / धान)', ratePerQuintal: 2300, totalBooked: 1, totalQty: 0, totalPayment: 0 },
    { cropId: 'crop-2', cropName: 'Wheat (గోధుమలు / गेहूं)', ratePerQuintal: 2275, totalBooked: 0, totalQty: 0, totalPayment: 0 }
  ],
  dailyReports: []
};

export const AdminDashboard = () => {
  const { adminUser, refreshTrigger, triggerRefresh } = useApp();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState(defaultAdminStats);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchAdminStats();
  }, [selectedDate, refreshTrigger]);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`/api/admin/stats?date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setStats(data);
        }
      }
    } catch (e) {
      console.error('Error fetching admin stats:', e);
    }
  };

  const currentStats = stats || defaultAdminStats;

  const tabs = [
    { key: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { key: 'mandi', label: 'Mandi Analysis', icon: Building2 },
    { key: 'farmer', label: 'Farmer Analysis', icon: Users },
    { key: 'reports', label: `Reports (${currentStats?.dailyReports?.length || 0})`, icon: FileText },
    { key: 'complaints', label: 'Complaints', icon: AlertTriangle },
  ];

  return (
    <div className="admin-portal-wrapper" style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#EDF5F0',
      padding: '24px 35px 60px 35px'
    }}>
      <div style={{
        maxWidth: '1640px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>

        {/* ── Top Header Banner Component ── */}
        <OverviewBanner
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onRefresh={fetchAdminStats}
        />

        {/* ── Secondary Navigation Bar Tabs Component ── */}
        <DashboardTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* ═══════════════════════════════════════
          TAB: EXECUTIVE DASHBOARD
          ═══════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* 8 Stat Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
              marginBottom: '28px'
            }}>
              <KPICard
                title="TOTAL MANDIS"
                value={currentStats.totalMandis}
                description="Connected procurement mandis"
                accentColor="#10B981"
                iconBgColor="#DCFCE7"
                iconColor="#15803D"
                icon={Store}
              />

              <KPICard
                title="TOTAL FARMERS"
                value={currentStats.totalFarmers}
                description="Registered 8-digit accounts"
                accentColor="#0EA5E9"
                iconBgColor="#E0F2FE"
                iconColor="#0284C7"
                icon={Users}
              />

              <KPICard
                title="TODAY'S BOOKINGS"
                value={currentStats.todayBooked}
                description={`Slot reservations for ${currentStats.date || selectedDate}`}
                accentColor="#F97316"
                iconBgColor="#FFEDD5"
                iconColor="#EA580C"
                icon={Calendar}
              />

              <KPICard
                title="VERIFIED ARRIVALS"
                value={currentStats.todayVerified}
                description="Gate verified via QR / Token"
                accentColor="#10B981"
                iconBgColor="#D1FAE5"
                iconColor="#059669"
                icon={CheckCircle2}
              />

              <KPICard
                title="PENDING / NOT ARRIVED"
                value={currentStats.todayPending}
                description="Booked farmers yet to arrive"
                accentColor="#EF4444"
                iconBgColor="#FEE2E2"
                iconColor="#DC2626"
                icon={RedHazardIcon}
              />

              <KPICard
                title="COMPLETED PROCUREMENTS"
                value={currentStats.todayCompleted}
                description="Weighed & billed today"
                accentColor="#A855F7"
                iconBgColor="#F3E8FF"
                iconColor="#9333EA"
                icon={CheckCircle2}
              />

              <KPICard
                title="TOTAL QTY PROCURED"
                value={`${currentStats.totalQtyProcuredToday} qtl`}
                description="Actual weighted quintals"
                accentColor="#14B8A6"
                iconBgColor="#CCFBF1"
                iconColor="#0D9488"
                icon={Scale}
              />

              <KPICard
                title="TOTAL PAYMENT PROCESSED"
                value={`₹${(currentStats.totalPaymentAmountToday || 0).toLocaleString()}`}
                description="Confirmed transactions"
                accentColor="#3B82F6"
                iconBgColor="#DBEAFE"
                iconColor="#2563EB"
                icon={RupeeIcon}
              />
            </div>

            {/* Mandi Activity & Performance Table Component */}
            <MandiAnalysis mandiStats={currentStats.mandiStats} />
          </div>
        )}

        {/* TAB: MANDI ANALYSIS */}
        {activeTab === 'mandi' && (
          <div style={{ position: 'relative', zIndex: 1 }}>
            <MandiAnalysis mandiStats={currentStats.mandiStats} />
          </div>
        )}

        {/* TAB: FARMER ANALYSIS */}
        {activeTab === 'farmer' && (
          <div style={{ position: 'relative', zIndex: 1 }}>
            <FarmerAnalysis
              cropStats={currentStats.cropStats}
              totalFarmers={currentStats.totalFarmers}
              todayBooked={currentStats.todayBooked}
              todayVerified={currentStats.todayVerified}
              todayCompleted={currentStats.todayCompleted}
            />
          </div>
        )}

        {/* TAB: DAILY REPORTS */}
        {activeTab === 'reports' && (
          <div style={{ position: 'relative', zIndex: 1 }}>
            <DailyReports
              selectedDate={selectedDate}
              onDateChange={(d) => setSelectedDate(d)}
            />
          </div>
        )}

        {/* TAB: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div style={{ position: 'relative', zIndex: 1 }}>
            <AdminComplaints />
          </div>
        )}
      </div>
    </div>
  );
};


