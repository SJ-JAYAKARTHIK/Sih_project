import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import html2canvas from 'html2canvas';
import { FileText, Download, Printer, CheckCircle2, Eye, X, Receipt } from 'lucide-react';

export const BillsAndHistory = () => {
  const { farmerUser, t, refreshTrigger } = useApp();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const billPrintRef = useRef(null);

  useEffect(() => {
    if (farmerUser) {
      fetchBills();
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

  const handleDownloadImage = async (bill) => {
    setSelectedBill(bill);
    setTimeout(async () => {
      if (billPrintRef.current) {
        try {
          const canvas = await html2canvas(billPrintRef.current, { scale: 2 });
          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = image;
          link.download = `Bill_${bill.tokenNumber}_${bill.date}.png`;
          link.click();
        } catch (err) {
          console.error("Failed to generate bill image", err);
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

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{t('billsTitle')}</h2>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>{t('billsSubHeading')}</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading bills...</div>
      ) : bills.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <FileText size={48} color="#9CA3AF" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ margin: 0, color: '#4B5563' }}>{t('noBills')}</h4>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Bills will appear here automatically once your mandi officer completes your procurement.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {bills.map((bill) => (
            <div key={bill.id} className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-green">
                    <CheckCircle2 size={12} /> Payment Completed
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Ref: {bill.paymentRef}</span>
                </div>

                <h4 style={{ margin: '0.25rem 0', fontSize: '1.1rem', color: '#111827' }}>
                  {bill.cropName} — {bill.actualQty} Quintals
                </h4>

                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#4B5563', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  <div><strong>Mandi:</strong> {bill.mandiName}</div>
                  <div><strong>Date:</strong> {bill.date}</div>
                  <div><strong>Token:</strong> <span style={{ color: '#D97706', fontWeight: 700 }}>{bill.tokenNumber}</span></div>
                  <div><strong>Rate:</strong> ₹{bill.ratePerQuintal}/Quintal</div>
                  <div><strong>Billed By:</strong> {bill.billedBy}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right', minWidth: '160px' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D97706', marginBottom: '0.5rem' }}>
                  ₹{bill.totalAmount.toLocaleString()}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setSelectedBill(bill)}>
                    <Eye size={14} /> {t('viewBillBtn')}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadImage(bill)}>
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bill View / Print Modal */}
      {selectedBill && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt color="#D97706" /> Procurement Receipt Bill
              </h4>
              <button onClick={() => setSelectedBill(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Print Container */}
            <div
              ref={billPrintRef}
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #D97706',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#111827',
                fontFamily: 'sans-serif'
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '2px dashed #E5E7EB', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#D97706', fontSize: '1.25rem', fontWeight: 800 }}>GOVERNMENT FARMER PROCUREMENT SYSTEM</h3>
                <div style={{ fontSize: '0.85rem', color: '#4B5563', marginTop: '0.25rem' }}>{selectedBill.mandiName}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Official Transaction Bill & Payment Certificate</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div><strong>Bill ID:</strong> {selectedBill.id}</div>
                <div><strong>Token No:</strong> {selectedBill.tokenNumber}</div>
                <div><strong>Date:</strong> {selectedBill.date}</div>
                <div><strong>Txn Ref:</strong> {selectedBill.paymentRef}</div>
                <div><strong>Farmer Name:</strong> {selectedBill.farmerName}</div>
                <div><strong>Farmer ID:</strong> {selectedBill.farmerId}</div>
                <div><strong>Mobile:</strong> {selectedBill.mobile}</div>
                <div><strong>Billed By:</strong> {selectedBill.billedBy}</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #FCD34D' }}>Crop Description</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center', border: '1px solid #FCD34D' }}>Weighed Qty</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right', border: '1px solid #FCD34D' }}>Rate / Quintal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.625rem 0.5rem', border: '1px solid #E5E7EB' }}>{selectedBill.cropName}</td>
                    <td style={{ padding: '0.625rem 0.5rem', border: '1px solid #E5E7EB', textAlign: 'center', fontWeight: 700 }}>{selectedBill.actualQty} Quintals</td>
                    <td style={{ padding: '0.625rem 0.5rem', border: '1px solid #E5E7EB', textAlign: 'right' }}>₹{selectedBill.ratePerQuintal.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 700, color: '#065F46' }}>Total Payment Confirmed:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065F46' }}>₹{selectedBill.totalAmount.toLocaleString()}</span>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6B7280' }}>
                Payment electronically transactioned to farmer's registered bank account.<br />
                Verified & Billed by Officer: <strong>{selectedBill.billedBy}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => handleDownloadImage(selectedBill)}>
                <Download size={16} /> {t('downloadBillImgBtn')}
              </button>
              <button className="btn btn-primary" onClick={() => handlePrint(selectedBill)}>
                <Printer size={16} /> {t('printBillBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
