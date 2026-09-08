import React from 'react';
import { CheckCircle2, Clock, Scale, Eye, Phone } from 'lucide-react';

export const TodayFarmerList = ({ bookings, onOpenVerify, onOpenProcurement }) => {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Today's Scheduled Farmers Queue (Time Slot Ordered)</h3>
        <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Total Farmers Today: <strong>{bookings.length}</strong></span>
      </div>

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6B7280' }}>
          <Clock size={40} color="#9CA3AF" style={{ margin: '0 auto 0.75rem' }} />
          <div>No farmer slot bookings scheduled for today yet.</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Time Slot</th>
                <th>Token No</th>
                <th>Farmer Name & ID</th>
                <th>Mobile</th>
                <th>Crop</th>
                <th>Expected Qty</th>
                <th>Actual Qty</th>
                <th>Arrival Status</th>
                <th>Procurement Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} style={{
                  backgroundColor: booking.procurementStatus === 'Completed' ? '#F9FAFB' : '#FFFFFF'
                }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: '#111827' }}>
                      <Clock size={14} color="#D97706" />
                      <span>{booking.timeSlot}</span>
                    </div>
                  </td>

                  <td>
                    <span style={{ color: '#D97706', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {booking.tokenNumber}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, color: '#111827' }}>{booking.farmerName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>ID: {booking.farmerId}</div>
                  </td>

                  <td>
                    <a href={`tel:${booking.mobile}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#D97706', textDecoration: 'none', fontWeight: 600 }}>
                      <Phone size={13} /> {booking.mobile}
                    </a>
                  </td>

                  <td>{booking.cropName}</td>

                  <td>
                    {booking.expectedQty ? `${booking.expectedQty} Quintals` : <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Blank</span>}
                  </td>

                  <td>
                    {booking.actualQty ? (
                      <strong style={{ color: '#059669' }}>{booking.actualQty} Quintals</strong>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>—</span>
                    )}
                  </td>

                  <td>
                    <span className={`badge ${booking.arrivalStatus === 'Verified / Arrived' ? 'badge-green' : 'badge-yellow'}`}>
                      {booking.arrivalStatus}
                    </span>
                  </td>

                  <td>
                    <span className={`badge ${booking.procurementStatus === 'Completed' ? 'badge-green' : 'badge-yellow'}`}>
                      {booking.procurementStatus}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      {booking.arrivalStatus === 'Pending' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => onOpenVerify(booking)}
                          title="Verify Farmer Arrival"
                        >
                          <CheckCircle2 size={14} /> Verify
                        </button>
                      )}

                      {booking.arrivalStatus === 'Verified / Arrived' && booking.procurementStatus !== 'Completed' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onOpenProcurement(booking)}
                          title="Weigh & Process Procurement"
                        >
                          <Scale size={14} /> Process
                        </button>
                      )}

                      {booking.procurementStatus === 'Completed' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenProcurement(booking)}
                          title="View Bill Details"
                        >
                          <Eye size={14} /> Bill
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
