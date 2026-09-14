import React, { useState } from 'react';
import {
  CheckCircle2, Clock, Scale, Eye, Phone, Play,
  UserX, Zap, ArrowRight
} from 'lucide-react';

/* ── Procurement status badge helper ── */
const ProcurementBadge = ({ booking }) => {
  const isCancelled = booking.bookingStatus === 'CANCELLED';
  const isNoShow = booking.bookingStatus === 'NO_SHOW';
  const isServing = booking.procurementStage === 'IN_PROGRESS';
  const isCompleted = booking.procurementStatus === 'Completed' || booking.procurementStage === 'COMPLETED';
  const isWaiting = booking.arrivalStatus === 'Verified / Arrived' && booking.procurementStage === 'WAITING';

  if (isCancelled) return <span className="badge badge-red">Cancelled</span>;
  if (isNoShow) return <span className="badge" style={{ backgroundColor: '#F3E8FF', color: '#6B21A8', border: '1px solid #D8B4FE' }}>No-Show</span>;
  if (isServing) return <span className="badge badge-warning" style={{ fontWeight: 800 }}>Serving</span>;
  if (isCompleted) return <span className="badge badge-green">Completed</span>;
  if (isWaiting) return <span className="badge badge-info">In Queue</span>;
  return <span className="badge badge-yellow">Not Arrived</span>;
};

export const TodayFarmerList = ({ bookings, mandiId, onOpenVerify, onOpenProcurement, onRefresh }) => {
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const activeArrivedQueue = bookings.filter(b =>
    b.arrivalStatus === 'Verified / Arrived' &&
    (b.bookingStatus || 'ACTIVE') === 'ACTIVE' &&
    b.procurementStage !== 'COMPLETED' &&
    b.procurementStatus !== 'Completed'
  );

  const sortedActiveQueue = [...activeArrivedQueue].sort((a, b) => {
    if (a.timeSlot !== b.timeSlot) return a.timeSlot.localeCompare(b.timeSlot);
    const timeA = a.arrivedAt ? new Date(a.arrivedAt).getTime() : new Date(a.createdAt).getTime();
    const timeB = b.arrivedAt ? new Date(b.arrivedAt).getTime() : new Date(b.createdAt).getTime();
    return timeA - timeB;
  });

  const currentlyServing = sortedActiveQueue.find(b => b.procurementStage === 'IN_PROGRESS') || null;
  const waitingQueue = sortedActiveQueue.filter(b => b.procurementStage === 'WAITING');
  const nextFarmer = waitingQueue.length > 0 ? waitingQueue[0] : null;

  const handleStartProcurement = async (booking) => {
    try {
      setStatusLoadingId(booking.id);
      const res = await fetch('/api/queue/start-procurement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandiId, bookingId: booking.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start procurement');
      if (onRefresh) onRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleUpdateStatus = async (booking, action) => {
    const confirmMsg = action === 'NOSHOW' ? 'Mark this farmer as No-Show?' : 'Cancel this booking?';
    if (!window.confirm(confirmMsg)) return;

    try {
      setStatusLoadingId(booking.id);
      const res = await fetch('/api/queue/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandiId, bookingId: booking.id, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      if (onRefresh) onRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setStatusLoadingId(null);
    }
  };

  return (
    <div>
      {/* ── Currently Serving / Next in Queue ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* CURRENTLY SERVING */}
        <div className="card" style={{
          borderLeft: '4px solid var(--warning)',
          backgroundColor: 'var(--status-warning-bg)',
          borderColor: 'var(--status-warning-border)',
          borderLeftColor: 'var(--warning)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Zap size={14} color="var(--warning)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--status-warning-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Currently Serving
              </span>
            </div>
            <span className="badge badge-warning">In Progress</span>
          </div>

          {currentlyServing ? (
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--status-warning-text)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                {currentlyServing.tokenNumber}
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>
                {currentlyServing.farmerName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {currentlyServing.cropName} · Slot: {currentlyServing.timeSlot}
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.875rem', width: '100%' }}
                onClick={() => onOpenProcurement(currentlyServing)}
              >
                <Scale size={14} /> Weigh &amp; Complete Procurement
              </button>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.75rem 0', fontSize: '0.875rem' }}>
              No farmer currently being served. Start procurement on the next waiting farmer.
            </div>
          )}
        </div>

        {/* NEXT IN QUEUE */}
        <div className="card" style={{
          borderLeft: '4px solid var(--info)',
          backgroundColor: 'var(--status-info-bg)',
          borderColor: 'var(--status-info-border)',
          borderLeftColor: 'var(--info)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ArrowRight size={14} color="var(--info)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--status-info-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Next in Queue
              </span>
            </div>
            <span className="badge badge-info">Waiting</span>
          </div>

          {nextFarmer ? (
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--status-info-text)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                {nextFarmer.tokenNumber}
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>
                {nextFarmer.farmerName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {nextFarmer.cropName} · Slot: {nextFarmer.timeSlot}
              </div>
              <button
                className="btn btn-sm"
                style={{ marginTop: '0.875rem', width: '100%', backgroundColor: 'var(--info)', color: 'white', border: 'none' }}
                onClick={() => handleStartProcurement(nextFarmer)}
                disabled={statusLoadingId === nextFarmer.id}
              >
                <Play size={14} /> Start Procurement
              </button>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.75rem 0', fontSize: '0.875rem' }}>
              No farmers waiting in queue. Verify gate arrivals to add farmers.
            </div>
          )}
        </div>
      </div>

      {/* ── Daily Farmers Master Table ── */}
      <div className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Daily Farmers &amp; Queue Management</h3>
            <div className="section-subtitle" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <span>Total: <strong>{bookings.length}</strong></span>
              <span style={{ color: 'var(--status-success-text)' }}>Arrived: <strong>{sortedActiveQueue.length}</strong></span>
              <span style={{ color: 'var(--info)' }}>Waiting: <strong>{waitingQueue.length}</strong></span>
            </div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <Clock size={40} className="empty-state-icon" />
            <div className="empty-state-title">No bookings scheduled today</div>
            <div className="empty-state-desc">Farmer slot bookings will appear here when made</div>
          </div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="table-container desktop-table-only">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Time Slot</th>
                    <th>Token</th>
                    <th>Farmer</th>
                    <th>Contact</th>
                    <th>Crop</th>
                    <th>Exp / Act Qty</th>
                    <th>Gate Arrival</th>
                    <th>Procurement</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const isServing = booking.procurementStage === 'IN_PROGRESS';
                    const isCancelled = booking.bookingStatus === 'CANCELLED';
                    const isNoShow = booking.bookingStatus === 'NO_SHOW';
                    const isCompleted = booking.procurementStatus === 'Completed' || booking.procurementStage === 'COMPLETED';

                    return (
                      <tr key={booking.id} style={{
                        backgroundColor: isServing ? 'var(--status-warning-bg)' : isCompleted ? 'var(--surface-muted)' : 'var(--surface)',
                        borderLeft: isServing ? '3px solid var(--warning)' : '3px solid transparent'
                      }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                            <Clock size={13} color="var(--primary)" />
                            {booking.timeSlot}
                          </div>
                        </td>

                        <td>
                          <span style={{ color: 'var(--primary)', fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                            {booking.tokenNumber}
                          </span>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.875rem' }}>{booking.farmerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {booking.farmerId}</div>
                        </td>

                        <td>
                          <a href={`tel:${booking.mobile}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
                            <Phone size={12} /> {booking.mobile}
                          </a>
                        </td>

                        <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{booking.cropName}</td>

                        <td>
                          <div style={{ fontSize: '0.82rem' }}>
                            {booking.expectedQty ? `${booking.expectedQty} Qtl` : '—'}
                          </div>
                          {booking.actualQty && (
                            <div style={{ color: 'var(--status-success-text)', fontWeight: 700, fontSize: '0.82rem' }}>
                              {booking.actualQty} Qtl
                            </div>
                          )}
                        </td>

                        <td>
                          <span className={`badge ${booking.arrivalStatus === 'Verified / Arrived' ? 'badge-green' : 'badge-yellow'}`}>
                            {booking.arrivalStatus === 'Verified / Arrived' ? 'Arrived' : 'Pending'}
                          </span>
                        </td>

                        <td>
                          <ProcurementBadge booking={booking} />
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {/* Verify gate arrival */}
                            {booking.arrivalStatus === 'Pending' && !isCancelled && !isNoShow && (
                              <button className="btn btn-secondary btn-xs" onClick={() => onOpenVerify(booking)} title="Verify Arrival">
                                <CheckCircle2 size={12} /> Verify
                              </button>
                            )}

                            {/* Start procurement */}
                            {booking.arrivalStatus === 'Verified / Arrived' && booking.procurementStage === 'WAITING' && !isCancelled && !isNoShow && (
                              <button
                                className="btn btn-xs"
                                style={{ backgroundColor: 'var(--info)', color: 'white', border: 'none' }}
                                onClick={() => handleStartProcurement(booking)}
                                disabled={statusLoadingId === booking.id}
                                title="Start Procurement"
                              >
                                <Play size={12} /> Start
                              </button>
                            )}

                            {/* Complete procurement */}
                            {booking.procurementStage === 'IN_PROGRESS' && (
                              <button className="btn btn-primary btn-xs" onClick={() => onOpenProcurement(booking)} title="Weigh & Bill">
                                <Scale size={12} /> Bill
                              </button>
                            )}

                            {/* View bill */}
                            {isCompleted && (
                              <button className="btn btn-secondary btn-xs" onClick={() => onOpenProcurement(booking)} title="View Bill">
                                <Eye size={12} /> Bill
                              </button>
                            )}

                            {/* No-show */}
                            {!isCompleted && !isCancelled && !isNoShow && (
                              <button
                                className="btn btn-xs btn-outline"
                                style={{ color: '#6B21A8', borderColor: '#D8B4FE' }}
                                onClick={() => handleUpdateStatus(booking, 'NOSHOW')}
                                disabled={statusLoadingId === booking.id}
                                title="Mark No-Show"
                              >
                                <UserX size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Card Layout ── */}
            <div className="mobile-farmer-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bookings.map((booking) => {
                const isCancelled = booking.bookingStatus === 'CANCELLED';
                const isNoShow = booking.bookingStatus === 'NO_SHOW';
                const isServing = booking.procurementStage === 'IN_PROGRESS';
                const isCompleted = booking.procurementStatus === 'Completed' || booking.procurementStage === 'COMPLETED';

                return (
                  <div key={booking.id} style={{
                    border: `1px solid ${isServing ? 'var(--status-warning-border)' : 'var(--border)'}`,
                    backgroundColor: isServing ? 'var(--status-warning-bg)' : 'var(--surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem'
                  }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
                          {booking.tokenNumber}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginTop: '0.1rem' }}>
                          {booking.farmerName}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <span className={`badge ${booking.arrivalStatus === 'Verified / Arrived' ? 'badge-green' : 'badge-yellow'}`}>
                          {booking.arrivalStatus === 'Verified / Arrived' ? 'Arrived' : 'Pending'}
                        </span>
                        <ProcurementBadge booking={booking} />
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      <div><strong>Slot:</strong> {booking.timeSlot}</div>
                      <div><strong>Crop:</strong> {booking.cropName}</div>
                      <div><strong>ID:</strong> {booking.farmerId}</div>
                      <div>
                        <a href={`tel:${booking.mobile}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                          {booking.mobile}
                        </a>
                      </div>
                      {booking.expectedQty && <div><strong>Exp:</strong> {booking.expectedQty} Qtl</div>}
                      {booking.actualQty && <div style={{ color: 'var(--status-success-text)', fontWeight: 700 }}><strong>Act:</strong> {booking.actualQty} Qtl</div>}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {booking.arrivalStatus === 'Pending' && !isCancelled && !isNoShow && (
                        <button className="btn btn-secondary btn-sm" onClick={() => onOpenVerify(booking)}>
                          <CheckCircle2 size={13} /> Verify
                        </button>
                      )}
                      {booking.arrivalStatus === 'Verified / Arrived' && booking.procurementStage === 'WAITING' && !isCancelled && !isNoShow && (
                        <button
                          className="btn btn-sm"
                          style={{ backgroundColor: 'var(--info)', color: 'white', border: 'none' }}
                          onClick={() => handleStartProcurement(booking)}
                          disabled={statusLoadingId === booking.id}
                        >
                          <Play size={13} /> Start
                        </button>
                      )}
                      {booking.procurementStage === 'IN_PROGRESS' && (
                        <button className="btn btn-primary btn-sm" onClick={() => onOpenProcurement(booking)}>
                          <Scale size={13} /> Bill
                        </button>
                      )}
                      {isCompleted && (
                        <button className="btn btn-secondary btn-sm" onClick={() => onOpenProcurement(booking)}>
                          <Eye size={13} /> View Bill
                        </button>
                      )}
                      {!isCompleted && !isCancelled && !isNoShow && (
                        <button
                          className="btn btn-sm btn-outline"
                          style={{ color: '#6B21A8', borderColor: '#D8B4FE' }}
                          onClick={() => handleUpdateStatus(booking, 'NOSHOW')}
                          disabled={statusLoadingId === booking.id}
                        >
                          <UserX size={13} /> No-Show
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
