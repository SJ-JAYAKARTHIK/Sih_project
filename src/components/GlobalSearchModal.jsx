import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, CheckCircle2, FileText, AlertTriangle, Globe, PhoneCall, ArrowRight } from 'lucide-react';

export const GlobalSearchModal = ({ isOpen, onClose, onSelectBooking }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ bookings: [], procurements: [], complaints: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ bookings: [], procurements: [], complaints: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error('Search fetch error:', e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalHits = results.bookings.length + results.procurements.length + results.complaints.length;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '640px', padding: '1.25rem', borderRadius: '16px' }}>
        
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#F3F4F6', border: '1.5px solid #059669', padding: '0.6rem 1rem', borderRadius: '12px', marginBottom: '1rem' }}>
          <Search size={20} color="#059669" />
          <input
            type="text"
            autoFocus
            placeholder="Search Token, Farmer ID, Booking ID, Crop, Mandi, or Txn Ref..."
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#059669', fontWeight: 600 }}>
              Searching KrishiDwaar records...
            </div>
          ) : !query.trim() ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6B7280', fontSize: '0.85rem' }}>
              🔍 Enter any Token (e.g. TKN-718624), Farmer ID (e.g. 10029384), or Booking ID to search real-time records.
            </div>
          ) : totalHits === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#9CA3AF' }}>
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Bookings Section */}
              {results.bookings.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                    Bookings ({results.bookings.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {results.bookings.map(b => (
                      <div
                        key={b.id}
                        onClick={() => { if (onSelectBooking) onSelectBooking(b); onClose(); }}
                        style={{ padding: '0.65rem 0.85rem', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>
                            {b.tokenNumber} · {b.farmerName}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                            {b.cropName} | {b.mandiName} | {b.date}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', backgroundColor: b.source === 'VOICE IVR' ? '#FEF3C7' : '#EFF6FF', color: b.source === 'VOICE IVR' ? '#B45309' : '#1D4ED8' }}>
                          {b.source}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Procurements Section */}
              {results.procurements.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                    Bills & Procurements ({results.procurements.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {results.procurements.map(p => (
                      <div
                        key={p.id}
                        onClick={() => { if (onSelectBooking) onSelectBooking(p); onClose(); }}
                        style={{ padding: '0.65rem 0.85rem', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1D4ED8' }}>
                            Bill #{p.id} · {p.farmerName}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#3B82F6', marginTop: '2px' }}>
                            {p.actualQty} Qtl | ₹{(p.totalAmount || 0).toLocaleString('en-IN')} | Ref: {p.paymentRef || 'N/A'}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>
                          ₹{p.totalAmount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Complaints Section */}
              {results.complaints.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                    Complaints ({results.complaints.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {results.complaints.map(c => (
                      <div
                        key={c.id}
                        style={{ padding: '0.65rem 0.85rem', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#92400E' }}>
                          Complaint #{c.id} · {c.farmerName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: '2px' }}>
                          Category: {c.category} | Status: <strong>{c.status}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
