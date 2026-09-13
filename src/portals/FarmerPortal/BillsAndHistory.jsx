import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import html2canvas from 'html2canvas';
import { FileText, Download, Printer, CheckCircle2, Eye, X, Receipt, AlertTriangle, ShieldCheck, Clock, MessageSquare, PlusCircle } from 'lucide-react';

export const BillsAndHistory = () => {
  const { farmerUser, t, refreshTrigger } = useApp();
  const [bills, setBills] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('bills'); // 'bills' | 'complaints'
  
  // Selected Bill Modal state
  const [selectedBill, setSelectedBill] = useState(null);
  const billPrintRef = useRef(null);

  // Issue Filing Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingBill, setReportingBill] = useState(null);
  const [complaintCategory, setComplaintCategory] = useState('Incorrect quantity');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintError, setComplaintError] = useState('');

  useEffect(() => {
    if (farmerUser) {
      fetchBills();
      fetchComplaints();
    }
  }, [farmerUser, refreshTrigger]);

  const fetchBills = async () => {
    try {
      const res = await fetch(`/api/bills/farmer/${farmerUser.id}`);
      const data = await res.json();
      setBills(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`/api/complaints/farmer/${farmerUser.id}`);
      const data = await res.json();
      setComplaints(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadImage = async (bill) => {
    setSelectedBill(bill);
    setTimeout(async () => {
      if (billPrintRef.current) {
        try {
          const canvas = await html2canvas(billPrintRef.current, { scale: 2 });
          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = image;
          link.download = `Procurement_Receipt_${bill.tokenNumber}_${bill.date}.png`;
          link.click();
        } catch (err) {
          console.error("Failed to generate receipt image", err);
        }
      }
    }, 300);
  };

  const handlePrint = (bill) => {
    setSelectedBill(bill);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleOpenReportModal = (bill) => {
    setReportingBill(bill);
    setComplaintCategory('Incorrect quantity');
    setComplaintDesc('');
    setComplaintError('');
    setIsReportModalOpen(true);
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintDesc.trim()) {
      setComplaintError("Please enter a short description of the issue.");
      return;
    }

    setSubmittingComplaint(true);
    setComplaintError('');

    try {
      const res = await fetch('/api/complaints/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: farmerUser.id,
          bookingId: reportingBill.bookingId,
          category: complaintCategory,
          description: complaintDesc.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit complaint.");
      }

      alert(`✅ Issue Reported Successfully! Complaint ID: ${data.complaint.id}`);
      setIsReportModalOpen(false);
      setReportingBill(null);
      fetchComplaints();
      setActiveSubTab('complaints');
    } catch (err) {
      setComplaintError(err.message);
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Submitted': return 'badge-yellow';
      case 'Under Review': return 'badge-blue';
      case 'Resolved': return 'badge-green';
      case 'Rejected': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', margin: 0 }}>Procurement Transparency & Records</h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Authoritative procurement receipts, payment records, and dispute handling for farmers.
          </p>
        </div>

        {/* Sub-Tabs: Bills vs Complaints */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#F3F4F6', padding: '0.25rem', borderRadius: '10px' }}>
          <button
            className={`btn btn-sm ${activeSubTab === 'bills' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveSubTab('bills')}
            style={{ border: 'none' }}
          >
            <Receipt size={15} /> Official Receipts ({bills.length})
          </button>

          <button
            className={`btn btn-sm ${activeSubTab === 'complaints' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveSubTab('complaints')}
            style={{ border: 'none', position: 'relative' }}
          >
            <AlertTriangle size={15} /> Reported Issues ({complaints.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: OFFICIAL BILLS & RECEIPTS */}
      {activeSubTab === 'bills' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading bills...</div>
          ) : bills.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <FileText size={48} color="#9CA3AF" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ margin: 0, color: '#4B5563' }}>No Procurement Bills Found</h4>
              <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Bills will appear here automatically once your mandi officer completes your procurement weighing and payment.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {bills.map((bill) => (
                <div key={bill.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={12} /> Payment Completed
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#4B5563', fontFamily: 'monospace' }}>
                          Txn ID: <strong>{bill.paymentRef}</strong>
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                          • {new Date(bill.createdTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.2rem', color: '#111827' }}>
                        {bill.cropName} — <span style={{ color: '#059669', fontWeight: 800 }}>{bill.actualQty} Quintals</span> (Actual Weighed)
                      </h4>

                      {/* 14 Mandatory Transparency Fields Preview */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.4rem 1rem',
                        fontSize: '0.85rem',
                        color: '#4B5563',
                        backgroundColor: '#F9FAFB',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #F3F4F6'
                      }}>
                        <div><strong>Farmer Name:</strong> {bill.farmerName}</div>
                        <div><strong>Farmer ID:</strong> {bill.farmerId}</div>
                        <div><strong>Mobile:</strong> {bill.mobile}</div>
                        <div><strong>Mandi:</strong> {bill.mandiName}</div>
                        <div><strong>Expected Qty:</strong> {bill.expectedQty ? `${bill.expectedQty} Quintals` : 'N/A'}</div>
                        <div><strong>Actual Qty:</strong> <span style={{ color: '#047857', fontWeight: 700 }}>{bill.actualQty} Quintals</span></div>
                        <div><strong>Rate / Quintal:</strong> ₹{bill.ratePerQuintal.toLocaleString()}</div>
                        <div><strong>Final Amount:</strong> <span style={{ color: '#B45309', fontWeight: 800 }}>₹{bill.totalAmount.toLocaleString()}</span></div>
                        <div><strong>Billed By Staff:</strong> {bill.billedBy}</div>
                        <div><strong>Procurement Date:</strong> {bill.date}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '180px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#D97706' }}>
                        ₹{bill.totalAmount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                        Authoritative Rate: ₹{bill.ratePerQuintal}/Qtl
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelectedBill(bill)} title="View Digital Receipt">
                          <Eye size={14} /> Receipt
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadImage(bill)} title="Download Receipt PNG">
                          <Download size={14} />
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', color: '#991B1B' }}
                          onClick={() => handleOpenReportModal(bill)}
                          title="Report Issue / Dispute"
                        >
                          <AlertTriangle size={14} /> Report Issue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: REPORTED COMPLAINTS & DISPUTES */}
      {activeSubTab === 'complaints' && (
        <div>
          {complaints.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <ShieldCheck size={48} color="#10B981" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ margin: 0, color: '#065F46' }}>No Issues or Complaints Filed</h4>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                If you find any mismatch in actual quantity, rate, or payment for a completed procurement, click <strong>"Report Issue"</strong> on your bill card.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {complaints.map(c => (
                <div key={c.id} className="card" style={{ borderLeft: c.status === 'Resolved' ? '5px solid #10B981' : c.status === 'Rejected' ? '5px solid #EF4444' : '5px solid #F59E0B' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${getStatusBadgeClass(c.status)}`} style={{ fontWeight: 800 }}>
                          {c.status}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827', fontFamily: 'monospace' }}>
                          ID: {c.id}
                        </span>
                      </div>
                      <h4 style={{ margin: '0.35rem 0 0.15rem', color: '#B45309', fontSize: '1.05rem' }}>
                        Category: {c.category}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                        Mandi: <strong>{c.mandiName}</strong> | Crop: <strong>{c.cropName}</strong> | Token: <strong>{c.tokenNumber}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#6B7280' }}>
                      <div>Filed: {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div>Last Updated: {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({c.lastUpdatedBy})</div>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', color: '#92400E', marginBottom: '0.75rem' }}>
                    <strong>Farmer Issue Description:</strong>
                    <div style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{c.description}</div>
                  </div>

                  {/* Mandi Officer Response Box */}
                  {c.responseComment ? (
                    <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', color: '#065F46' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                        <MessageSquare size={14} color="#059669" />
                        Mandi Officer Response / Comment:
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{c.responseComment}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', fontStyle: 'italic' }}>
                      ⏳ Pending response from Mandi Officer / System Administrator.
                    </div>
                  )}

                  {/* Timeline status history toggle preview */}
                  {c.statusHistory && c.statusHistory.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #E5E7EB', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#4B5563' }}>
                      <strong>Audit History:</strong>
                      {c.statusHistory.map((h, idx) => (
                        <span key={idx} style={{ backgroundColor: '#F3F4F6', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {h.status} ({new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REDESIGNED PROFESSIONAL DIGITAL RECEIPT MODAL */}
      {selectedBill && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065F46' }}>
                <Receipt color="#059669" /> Official Digital Procurement Receipt
              </h4>
              <button onClick={() => setSelectedBill(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            {/* Print Container */}
            <div
              ref={billPrintRef}
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #059669',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#111827',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {/* Official Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #059669', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', letterSpacing: '0.5px' }}>
                  GOVERNMENT OF INDIA / STATE AGRICULTURAL MARKETING BOARD
                </div>
                <h3 style={{ margin: '0.25rem 0', color: '#065F46', fontSize: '1.3rem', fontWeight: 900 }}>
                  {selectedBill.mandiName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 700 }}>
                  OFFICIAL FARMER PROCUREMENT TRANSACTION RECEIPT & PAYMENT CERTIFICATE
                </div>
              </div>

              {/* Grid of 14 Transparency Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem', fontSize: '0.825rem', marginBottom: '1rem', backgroundColor: '#F9FAFB', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <div><strong>Bill ID:</strong> {selectedBill.id}</div>
                <div><strong>Token Number:</strong> <span style={{ color: '#D97706', fontWeight: 800 }}>{selectedBill.tokenNumber}</span></div>
                <div><strong>Farmer Name:</strong> {selectedBill.farmerName}</div>
                <div><strong>Farmer ID:</strong> {selectedBill.farmerId}</div>
                <div><strong>Mobile Number:</strong> {selectedBill.mobile}</div>
                <div><strong>Mandi Location:</strong> {selectedBill.mandiName}</div>
                <div><strong>Procurement Date:</strong> {selectedBill.date}</div>
                <div><strong>Time Slot:</strong> {selectedBill.timeSlot}</div>
                <div><strong>Expected Qty:</strong> {selectedBill.expectedQty ? `${selectedBill.expectedQty} Quintals` : 'N/A'}</div>
                <div><strong>Billed By Staff:</strong> {selectedBill.billedBy}</div>
              </div>

              {/* Table of Procurement Quantity & Rate */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ECFDF5', color: '#065F46' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #A7F3D0' }}>Crop Description</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center', border: '1px solid #A7F3D0' }}>Actual Weighed Qty</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right', border: '1px solid #A7F3D0' }}>Rate / Quintal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.625rem 0.5rem', border: '1px solid #E5E7EB', fontWeight: 700 }}>{selectedBill.cropName}</td>
                    <td style={{ padding: '0.625rem 0.5rem', border: '1px solid #E5E7EB', textAlign: 'center', fontWeight: 900, color: '#059669' }}>
                      {selectedBill.actualQty} Quintals
                    </td>
                    <td style={{ padding: '0.625rem 0.5rem', border: '1px solid #E5E7EB', textAlign: 'right', fontWeight: 700 }}>
                      ₹{selectedBill.ratePerQuintal.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* HIGHLIGHTED PAYMENT SUMMARY BOX */}
              <div style={{
                backgroundColor: '#ECFDF5',
                border: '2px solid #10B981',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 800, color: '#065F46', fontSize: '0.9rem' }}>ACTUAL WEIGHED FINAL AMOUNT:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857' }}>
                    ₹{selectedBill.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#065F46', borderTop: '1px dashed #A7F3D0', paddingTop: '0.35rem' }}>
                  <div><strong>Payment Status:</strong> <span style={{ color: '#059669', fontWeight: 800 }}>{selectedBill.paymentStatus}</span></div>
                  <div><strong>Transaction Ref:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{selectedBill.paymentRef}</span></div>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6B7280', marginTop: '0.5rem' }}>
                Verified & Processed by Authorized Staff: <strong>{selectedBill.billedBy}</strong><br />
                Amount credited via direct bank payout system to Farmer ID: {selectedBill.farmerId}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => handleDownloadImage(selectedBill)}>
                <Download size={16} /> Download PNG
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handlePrint(selectedBill)}>
                <Printer size={16} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT ISSUE / DISPUTE FILING MODAL */}
      {isReportModalOpen && reportingBill && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B45309' }}>
                <AlertTriangle color="#D97706" /> Report an Issue / Dispute
              </h4>
              <button onClick={() => setIsReportModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: '#92400E' }}>
              <div><strong>Token:</strong> {reportingBill.tokenNumber} | <strong>Crop:</strong> {reportingBill.cropName}</div>
              <div><strong>Actual Qty:</strong> {reportingBill.actualQty} Quintals | <strong>Final Amount:</strong> ₹{reportingBill.totalAmount.toLocaleString()}</div>
            </div>

            {complaintError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                ⚠️ {complaintError}
              </div>
            )}

            <form onSubmit={handleSubmitComplaint}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Issue Category *
                </label>
                <select
                  className="form-control"
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                >
                  <option value="Incorrect quantity">Incorrect quantity</option>
                  <option value="Incorrect rate">Incorrect rate</option>
                  <option value="Payment issue">Payment issue</option>
                  <option value="Bill issue">Bill issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Description of Issue *
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Describe the problem clearly (e.g. Weighing scale showed 48 quintals but bill states 47.2 quintals)..."
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsReportModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingComplaint}>
                  {submittingComplaint ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
