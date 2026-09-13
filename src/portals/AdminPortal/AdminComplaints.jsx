import React, { useState, useEffect } from 'react';
import { ShieldAlert, Filter, CheckCircle2, MessageSquare, RefreshCw, Building2 } from 'lucide-react';

export const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMandi, setSelectedMandi] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');

  // Status Action Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('Under Review');
  const [responseComment, setResponseComment] = useState('');
  const [adminName, setAdminName] = useState('System Admin');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMandis();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [selectedMandi, selectedStatus, selectedCategory, selectedDate]);

  const fetchMandis = async () => {
    try {
      const res = await fetch('/api/master/mandis');
      const data = await res.json();
      setMandis(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let url = `/api/complaints/admin?mandiId=${selectedMandi}&status=${selectedStatus}&category=${selectedCategory}`;
      if (selectedDate) url += `&date=${selectedDate}`;
      const res = await fetch(url);
      const data = await res.json();
      setComplaints(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdateModal = (c) => {
    setSelectedComplaint(c);
    setNewStatus(c.status === 'Submitted' ? 'Under Review' : c.status);
    setResponseComment(c.responseComment || '');
    setErrorMsg('');
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!responseComment.trim()) {
      setErrorMsg("Please enter an administrative response comment.");
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/complaints/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: selectedComplaint.id,
          updatedBy: `${adminName} (State Admin)`,
          role: 'ADMIN',
          newStatus,
          responseComment: responseComment.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update complaint status.");
      }

      alert(`✅ Complaint ${selectedComplaint.id} status updated to '${newStatus}'!`);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Submitted': return { bg: '#FEF3C7', color: '#B45309', border: '#FCD34D' };
      case 'Under Review': return { bg: '#EFF6FF', color: '#1D4ED8', border: '#93C5FD' };
      case 'Resolved': return { bg: '#ECFDF5', color: '#047857', border: '#6EE7B7' };
      case 'Rejected': return { bg: '#FEF2F2', color: '#B91C1C', border: '#FCA5A5' };
      default: return { bg: '#F3F4F6', color: '#374151', border: '#D1D5DB' };
    }
  };

  const totalCount = complaints.length;
  const submittedCount = complaints.filter(c => c.status === 'Submitted').length;
  const reviewCount = complaints.filter(c => c.status === 'Under Review').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert color="#D97706" /> Global Complaints & Dispute Management
          </h3>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Cross-Mandi dispute oversight with multi-filter search, status monitoring, and resolution auditing.
          </p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={fetchComplaints}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>TOTAL COMPLAINTS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111827' }}>{totalCount}</div>
        </div>
        <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: 700 }}>SUBMITTED</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#D97706' }}>{submittedCount}</div>
        </div>
        <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 700 }}>UNDER REVIEW</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1D4ED8' }}>{reviewCount}</div>
        </div>
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 700 }}>RESOLVED</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>{resolvedCount}</div>
        </div>
      </div>

      {/* Multi-Filter Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#F9FAFB', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #E5E7EB', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={16} color="#4B5563" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Mandi:</span>
          <select
            value={selectedMandi}
            onChange={(e) => setSelectedMandi(e.target.value)}
            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Mandis</option>
            {mandis.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="#4B5563" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Categories</option>
            <option value="Incorrect quantity">Incorrect quantity</option>
            <option value="Incorrect rate">Incorrect rate</option>
            <option value="Payment issue">Payment issue</option>
            <option value="Bill issue">Bill issue</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
          />
          {selectedDate && (
            <button className="btn btn-sm btn-outline" onClick={() => setSelectedDate('')} style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading complaints data...</div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6B7280' }}>
          <CheckCircle2 size={40} color="#10B981" style={{ margin: '0 auto 0.5rem' }} />
          <div>No complaints found for the selected filter parameters.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {complaints.map(c => {
            const badge = getBadgeStyle(c.status);
            return (
              <div key={c.id} style={{ border: `1px solid ${badge.border}`, borderLeft: `5px solid ${badge.color}`, borderRadius: '10px', padding: '1rem', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, borderRadius: '6px', padding: '0.15rem 0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>
                        {c.status}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace' }}>
                        ID: {c.id}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 700 }}>
                        Mandi: {c.mandiName} ({c.mandiId})
                      </span>
                    </div>

                    <h4 style={{ margin: '0.35rem 0 0.15rem', color: '#111827', fontSize: '1.05rem' }}>
                      Category: <span style={{ color: '#D97706' }}>{c.category}</span>
                    </h4>

                    <div style={{ fontSize: '0.825rem', color: '#4B5563', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                      <div><strong>Farmer:</strong> {c.farmerName} (ID: {c.farmerId}, Mobile: {c.mobile})</div>
                      <div><strong>Crop:</strong> {c.cropName}</div>
                      <div><strong>Actual Qty:</strong> {c.actualQty} Qtl</div>
                      <div><strong>Final Amount:</strong> ₹{c.totalAmount.toLocaleString()}</div>
                      <div><strong>Txn Ref:</strong> {c.paymentRef}</div>
                    </div>
                  </div>

                  <button className="btn btn-outline btn-sm" onClick={() => handleOpenUpdateModal(c)}>
                    Admin Action / Override
                  </button>
                </div>

                {/* Farmer Description */}
                <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '6px', padding: '0.65rem 0.85rem', fontSize: '0.85rem', color: '#92400E', margin: '0.5rem 0' }}>
                  <strong>Farmer Description:</strong> {c.description}
                </div>

                {/* Officer Response */}
                {c.responseComment && (
                  <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', padding: '0.65rem 0.85rem', fontSize: '0.85rem', color: '#065F46', margin: '0.5rem 0' }}>
                    <strong>Latest Response ({c.lastUpdatedBy}):</strong> {c.responseComment}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ADMIN UPDATE MODAL */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827' }}>
                <MessageSquare color="#D97706" /> Admin Action: {selectedComplaint.id}
              </h4>
              <button onClick={() => setSelectedComplaint(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '0.75rem', borderRadius: '6px', fontSize: '0.825rem', marginBottom: '1rem' }}>
              <div><strong>Farmer:</strong> {selectedComplaint.farmerName} (ID: {selectedComplaint.farmerId})</div>
              <div><strong>Mandi:</strong> {selectedComplaint.mandiName}</div>
              <div><strong>Category:</strong> {selectedComplaint.category}</div>
            </div>

            {errorMsg && (
              <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdateStatusSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Set Complaint Status *
                </label>
                <select
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Admin Name / Designation *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Admin Remarks / Decision Note *
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter administrative directive or resolution comment..."
                  value={responseComment}
                  onChange={(e) => setResponseComment(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setSelectedComplaint(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Update & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
