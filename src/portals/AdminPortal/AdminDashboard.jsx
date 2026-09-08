import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MandiAnalysis } from './MandiAnalysis';
import { FarmerAnalysis } from './FarmerAnalysis';
import { DailyReports } from './DailyReports';
import { Shield, Building2, Users, Calendar, CheckCircle2, Clock, Scale, CreditCard, RefreshCw } from 'lucide-react';

export const AdminDashboard = () => {
  const { adminUser, refreshTrigger, triggerRefresh } = useApp();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab views: 'dashboard' | 'mandi' | 'farmer' | 'reports'
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchAdminStats();
  }, [selectedDate, refreshTrigger]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?date=${selectedDate}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Admin Portal Analytics...</div>;
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="card" style={{
        backgroundColor: '#FFFFFF',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FCD34D',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={28} />
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#111827' }}>Admin Portal — State Overview</h2>
            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.2rem' }}>
              Real-time monitoring across all mandis & farmer procurement activities
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', backgroundColor: '#F3F4F6', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
            <Calendar size={16} color="#D97706" />
            <input
              type="date"
              style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: '0.875rem', outline: 'none' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button className="btn btn-outline btn-sm" onClick={() => fetchAdminStats()} title="Refresh Live Data">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <button
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Shield size={16} /> Executive Dashboard
        </button>

        <button
          className={`btn ${activeTab === 'mandi' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('mandi')}
        >
          <Building2 size={16} /> Mandi Analysis
        </button>

        <button
          className={`btn ${activeTab === 'farmer' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('farmer')}
        >
          <Users size={16} /> Farmer Analysis
        </button>

        <button
          className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('reports')}
        >
          <Calendar size={16} /> Daily Mandi Reports ({stats?.dailyReports?.length || 0})
        </button>
      </div>

      {/* TAB 1: EXECUTIVE DASHBOARD */}
      {activeTab === 'dashboard' && stats && (
        <div>
          {/* Executive Overview Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {/* Card 1: Total Mandis */}
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Total Mandis</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0.25rem 0' }}>{stats.totalMandis}</div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Connected procurement mandis</div>
            </div>

            {/* Card 2: Total Farmers */}
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Total Farmers</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0.25rem 0' }}>{stats.totalFarmers}</div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Registered 8-digit farmer accounts</div>
            </div>

            {/* Card 3: Today's Bookings */}
            <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
              <div style={{ fontSize: '0.8rem', color: '#92400E', textTransform: 'uppercase', fontWeight: 700 }}>Today's Total Bookings</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706', margin: '0.25rem 0' }}>{stats.todayBooked}</div>
              <div style={{ fontSize: '0.78rem', color: '#B45309' }}>Slot reservations for {stats.date}</div>
            </div>

            {/* Card 4: Today's Verified Arrivals */}
            <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
              <div style={{ fontSize: '0.8rem', color: '#065F46', textTransform: 'uppercase', fontWeight: 700 }}>Verified Arrivals</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065F46', margin: '0.25rem 0' }}>{stats.todayVerified}</div>
              <div style={{ fontSize: '0.78rem', color: '#059669' }}>Gate verified via QR / Token</div>
            </div>

            {/* Card 5: Today's Pending */}
            <div className="card" style={{ borderLeft: '4px solid #FBBF24' }}>
              <div style={{ fontSize: '0.8rem', color: '#92400E', textTransform: 'uppercase', fontWeight: 700 }}>Pending / Not Arrived</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#92400E', margin: '0.25rem 0' }}>{stats.todayPending}</div>
              <div style={{ fontSize: '0.78rem', color: '#B45309' }}>Booked farmers yet to arrive</div>
            </div>

            {/* Card 6: Completed Procurements */}
            <div className="card" style={{ borderLeft: '4px solid #3B82F6' }}>
              <div style={{ fontSize: '0.8rem', color: '#1E40AF', textTransform: 'uppercase', fontWeight: 700 }}>Completed Procurements</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1D4ED8', margin: '0.25rem 0' }}>{stats.todayCompleted}</div>
              <div style={{ fontSize: '0.78rem', color: '#2563EB' }}>Weighed & billed procurements</div>
            </div>

            {/* Card 7: Total Qty Procured */}
            <div className="card" style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
              <div style={{ fontSize: '0.8rem', color: '#065F46', textTransform: 'uppercase', fontWeight: 700 }}>Total Qty Procured Today</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065F46', margin: '0.25rem 0' }}>{stats.totalQtyProcuredToday} Qtl</div>
              <div style={{ fontSize: '0.78rem', color: '#059669' }}>Actual weighed quintals</div>
            </div>

            {/* Card 8: Total Payment Amount */}
            <div className="card" style={{ backgroundColor: '#FFFBEB', borderColor: '#FCD34D' }}>
              <div style={{ fontSize: '0.8rem', color: '#92400E', textTransform: 'uppercase', fontWeight: 700 }}>Total Payment Processed</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706', margin: '0.25rem 0' }}>₹{stats.totalPaymentAmountToday.toLocaleString()}</div>
              <div style={{ fontSize: '0.78rem', color: '#B45309' }}>Confirmed prototype transactions</div>
            </div>
          </div>

          {/* Quick Mandi Performance Summary Table */}
          <MandiAnalysis mandiStats={stats.mandiStats} />
        </div>
      )}

      {/* TAB 2: MANDI ANALYSIS */}
      {activeTab === 'mandi' && stats && (
        <MandiAnalysis mandiStats={stats.mandiStats} />
      )}

      {/* TAB 3: FARMER ANALYSIS */}
      {activeTab === 'farmer' && stats && (
        <FarmerAnalysis
          cropStats={stats.cropStats}
          totalFarmers={stats.totalFarmers}
          todayBooked={stats.todayBooked}
          todayVerified={stats.todayVerified}
          todayCompleted={stats.todayCompleted}
        />
      )}

      {/* TAB 4: DAILY MANDI REPORTS */}
      {activeTab === 'reports' && stats && (
        <DailyReports
          selectedDate={selectedDate}
          onDateChange={(d) => setSelectedDate(d)}
        />
      )}
    </div>
  );
};
