import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet } from 'lucide-react';

export const ExcelExporter = ({ mandiId, mandiName, dateStr, className }) => {
  const [loading, setLoading] = useState(false);

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      // Fetch ENRICHED bookings (joined with bill/procurement so billedBy & correct price are present)
      const res = await fetch(`/api/bookings/mandi/${mandiId}/enriched?date=${dateStr}`);
      const bookings = await res.json();

      if (!bookings || bookings.length === 0) {
        alert('No records available to export for this date.');
        setLoading(false);
        return;
      }

      // Format data into clean structured rows with all mandatory columns
      const exportData = bookings.map(b => ({
        'Token Number':               b.tokenNumber || 'N/A',
        'Farmer ID':                  b.farmerId || 'N/A',
        'Farmer Name':                b.farmerName || 'N/A',
        'Mobile Number':              b.mobile || 'N/A',
        'Crop':                       b.cropName || 'N/A',
        'Expected Quantity (Quintals)': b.expectedQty != null ? b.expectedQty : 'Not Specified',
        'Actual Quantity (Quintals)': b.actualQty != null ? b.actualQty : 'Pending Weighing',
        'Date':                       b.date || dateStr,
        'Time Slot':                  b.timeSlot || 'N/A',
        'Mandi Name':                 b.mandiName || mandiName,
        'Arrival Status':             b.arrivalStatus || 'Pending',
        'Procurement Status':         b.procurementStatus || 'Pending',
        'Payment Status':             b.paymentStatus || 'Pending',
        'Price Paid (₹)':             b.pricePaid != null ? b.pricePaid : 0,
        'Rate per Quintal (₹)':       b.ratePerQuintal != null ? b.ratePerQuintal : 'N/A',
        'Billed By (Officer)':        b.billedBy || (b.procurementStatus === 'Completed' ? 'Mandi Officer' : 'N/A'),
        'Transaction Ref':            b.paymentRef || 'N/A',
        'Dispute / Complaint Status': b.complaintStatus || 'None'
      }));

      // Create Worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Auto fit column widths
      const colWidths = Object.keys(exportData[0]).map(key => ({
        wch: Math.max(key.length + 4, 18)
      }));
      worksheet['!cols'] = colWidths;

      // Create Workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Procurements');

      // Save File
      const safeName = (mandiName || 'Mandi').replace(/\s+/g, '_');
      const fileName = `Procurement_${safeName}_${dateStr || new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error('Excel export error:', err);
      alert('Failed to export Excel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={className || "btn btn-secondary btn-sm"}
      onClick={handleExportExcel}
      disabled={loading}
      title="Export today's records to Excel file (with billing data)"
    >
      <FileSpreadsheet size={15} color="#059669" />
      <span>{loading ? 'Generating...' : 'Export to Excel (.xlsx)'}</span>
    </button>
  );
};
