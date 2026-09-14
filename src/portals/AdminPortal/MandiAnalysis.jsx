import React, { useState } from 'react';
import { MapPin, BarChart3 } from 'lucide-react';

export const StatusPill = ({ type }) => {
  if (type === 'ARRIVED') {
    return (
      <span style={{
        backgroundColor: '#DCFCE7',
        border: '1px solid #86EFAC',
        color: '#15803D',
        fontSize: '11px',
        fontWeight: 800,
        padding: '3px 10px',
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        ✓ ARRIVED
      </span>
    );
  }
  if (type === 'PENDING') {
    return (
      <span style={{
        backgroundColor: '#FEF3C7',
        border: '1px solid #FDE68A',
        color: '#B45309',
        fontSize: '11px',
        fontWeight: 800,
        padding: '3px 10px',
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        ⏳ PENDING
      </span>
    );
  }
  if (type === 'ACTIVE') {
    return (
      <span style={{
        backgroundColor: '#DCFCE7',
        border: '1px solid #86EFAC',
        color: '#15803D',
        fontSize: '11px',
        fontWeight: 800,
        padding: '3px 10px',
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        ● ACTIVE
      </span>
    );
  }
  return null;
};

export const FilterDropdown = ({ selectedValue, onChange, totalCount }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{ fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Filter:</span>
    <select
      value={selectedValue}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '7px 14px',
        borderRadius: '8px',
        border: '1px solid #D1D5DB',
        backgroundColor: '#FFFFFF',
        fontSize: '13px',
        fontWeight: 600,
        color: '#11382B',
        outline: 'none',
        cursor: 'pointer'
      }}
    >
      <option value="ALL">All Mandis ({totalCount})</option>
      <option value="MANDI01">Warangal Agriculture Market</option>
      <option value="MANDI02">Nizamabad APMC Mandi</option>
      <option value="MANDI03">Guntur Grain Yard</option>
      <option value="MANDI04">Khammam Procurement Yard</option>
    </select>
  </div>
);

export const DataTable = ({ data }) => (
  <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      fontSize: '13.5px'
    }}>
      <thead>
        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>MANDI &amp; LOCATION</th>
          <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>BOOKINGS</th>
          <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>VERIFIED</th>
          <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>PENDING</th>
          <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>COMPLETED</th>
          <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>QTY PROCURED</th>
          <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>PAYMENT</th>
          <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>STATUS</th>
        </tr>
      </thead>
      <tbody>
        {data.map((m, idx) => (
          <tr
            key={m.mandiId}
            style={{
              borderBottom: idx < data.length - 1 ? '1px solid #F1F5F9' : 'none',
              backgroundColor: '#FFFFFF',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            <td style={{ padding: '14px 18px' }}>
              <div style={{ fontWeight: 700, color: '#11382B', fontSize: '14px' }}>
                {m.mandiName}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <MapPin size={13} color="#15803D" />
                <span>{m.location}</span>
              </div>
            </td>
            <td style={{ padding: '14px 18px', fontWeight: 700, color: '#11382B' }}>
              {m.booked}
            </td>
            <td style={{ padding: '14px 18px' }}>
              <StatusPill type="ARRIVED" />
            </td>
            <td style={{ padding: '14px 18px' }}>
              <StatusPill type="PENDING" />
            </td>
            <td style={{ padding: '14px 18px', fontWeight: 700, color: '#11382B' }}>
              {m.completed} / {m.booked}
            </td>
            <td style={{ padding: '14px 18px', fontWeight: 700, color: '#15803D' }}>
              {m.totalQty} qtl
            </td>
            <td style={{ padding: '14px 18px', fontWeight: 700, color: '#11382B' }}>
              ₹{m.totalPayment.toLocaleString()}
            </td>
            <td style={{ padding: '14px 18px' }}>
              <StatusPill type="ACTIVE" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const MandiAnalysis = ({ mandiStats }) => {
  const [selectedMandiId, setSelectedMandiId] = useState('ALL');

  const defaultMandiData = [
    { mandiId: 'MANDI01', mandiName: 'Warangal Agriculture Market', location: 'Enugulagadda, Warangal, Telangana', booked: 1, verified: 1, pending: 1, completed: 0, totalQty: 0, totalPayment: 0 },
    { mandiId: 'MANDI02', mandiName: 'Nizamabad APMC Mandi', location: 'Market Yard, Nizamabad, Telangana', booked: 0, verified: 1, pending: 1, completed: 0, totalQty: 0, totalPayment: 0 },
    { mandiId: 'MANDI03', mandiName: 'Guntur Grain Yard', location: 'Guntur Central, Andhra Pradesh', booked: 0, verified: 1, pending: 1, completed: 0, totalQty: 0, totalPayment: 0 },
    { mandiId: 'MANDI04', mandiName: 'Khammam Procurement Yard', location: 'Wyra Road, Khammam, Telangana', booked: 0, verified: 1, pending: 1, completed: 0, totalQty: 0, totalPayment: 0 },
  ];

  const safeStats = (Array.isArray(mandiStats) && mandiStats.length > 0) ? mandiStats : defaultMandiData;

  const filteredStats = selectedMandiId === 'ALL'
    ? safeStats
    : safeStats.filter(m => m.mandiId === selectedMandiId);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #E2E8F0',
      padding: '24px 28px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
    }}>
      {/* Table Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BarChart3 size={22} color="#15803D" />
          </div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#11382B',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              Mandi Activity &amp; Performance
            </h3>
            <div style={{ fontSize: '13px', color: '#52635B', marginTop: '2px' }}>
              Turnout, arrivals, procurements and payouts by mandi
            </div>
          </div>
        </div>

        {/* Filter Dropdown Component */}
        <FilterDropdown
          selectedValue={selectedMandiId}
          onChange={setSelectedMandiId}
          totalCount={safeStats.length}
        />
      </div>

      {/* Styled Data Table Component */}
      <DataTable data={filteredStats} />
    </div>
  );
};


