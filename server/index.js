import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Initialize WebSocket Server for Real-Time Synchronization across Portals
const wss = new WebSocketServer({ server, path: '/ws' });

const broadcast = (event, data) => {
  const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ event: 'CONNECTED', message: 'Real-time synchronization active' }));
});

// --- AUTHENTICATION ROUTES ---

// Farmer Login
app.post('/api/auth/farmer-login', (req, res) => {
  const { farmerId, password } = req.body;
  if (!farmerId || !password) {
    return res.status(400).json({ error: "Farmer ID and Password are required." });
  }

  const farmer = db.getFarmerById(farmerId.trim());
  if (!farmer) {
    return res.status(404).json({ error: "Farmer ID not found. Please register first." });
  }

  if (farmer.password !== password) {
    return res.status(401).json({ error: "Invalid password." });
  }

  res.json({ success: true, farmer });
});

// Farmer Registration
app.post('/api/auth/farmer-register', (req, res) => {
  const { name, mobile, password, location, bankDetails } = req.body;
  if (!name || !mobile || !password) {
    return res.status(400).json({ error: "Name, Mobile Number, and Password are required." });
  }

  // Generate 8-digit Farmer ID
  let farmerId;
  do {
    farmerId = Math.floor(10000000 + Math.random() * 90000000).toString();
  } while (db.getFarmerById(farmerId));

  const newFarmer = {
    id: farmerId,
    name: name.trim(),
    mobile: mobile.trim(),
    password: password.trim(),
    language: "EN",
    location: location || "State Agriculture Division",
    bankDetails: bankDetails || "Bank Account **** (IFSC: SBIN0001234)"
  };

  db.addFarmer(newFarmer);
  res.json({ success: true, farmer: newFarmer });
});

// Mandi Login
app.post('/api/auth/mandi-login', (req, res) => {
  const { mandiId, password } = req.body;
  if (!mandiId || !password) {
    return res.status(400).json({ error: "Mandi ID and Password are required." });
  }

  const mandi = db.getMandiById(mandiId.trim().toUpperCase());
  if (!mandi) {
    return res.status(404).json({ error: "Mandi ID not found." });
  }

  // Prototype default password rule: 123456
  if (password !== mandi.password && password !== "123456") {
    return res.status(401).json({ error: "Invalid password. (Use default prototype password: 123456)" });
  }

  res.json({ success: true, mandi });
});

// Admin Login
app.post('/api/auth/admin-login', (req, res) => {
  const { adminId, password } = req.body;
  if ((adminId === 'ADMIN01' || adminId === 'admin') && (password === 'admin123' || password === '123456')) {
    return res.json({ success: true, admin: { id: "ADMIN01", name: "Procurement System Admin" } });
  }
  res.status(401).json({ error: "Invalid Admin Credentials." });
});

// --- MASTER DATA ROUTES ---

// Get Crops
app.get('/api/master/crops', (req, res) => {
  res.json(db.getCrops());
});

// Get Mandis (Filtered by Crop if cropId query provided)
app.get('/api/master/mandis', (req, res) => {
  const { cropId } = req.query;
  let mandis = db.getMandis();
  if (cropId) {
    mandis = mandis.filter(m => m.acceptedCrops.includes(cropId));
  }
  res.json(mandis);
});

// --- SLOT BOOKING ROUTES ---

// 1-Month Date Availability
app.get('/api/slots/availability', (req, res) => {
  const { mandiId, cropId } = req.query;
  if (!mandiId) {
    return res.status(400).json({ error: "Mandi ID is required for availability calculation." });
  }

  const dates = db.getDateAvailability(mandiId, cropId);
  res.json(dates);
});

// 30-Minute Time Slots List
app.get('/api/slots/time-slots', (req, res) => {
  const { mandiId, date } = req.query;
  if (!mandiId || !date) {
    return res.status(400).json({ error: "Mandi ID and Date are required." });
  }

  const slots = db.getTimeSlots(mandiId, date);
  res.json(slots);
});

// Create Slot Booking
app.post('/api/bookings/create', (req, res) => {
  try {
    const booking = db.createBooking(req.body);
    // Broadcast real-time booking event to Mandi & Admin portals!
    broadcast('BOOKING_CREATED', booking);
    res.json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Farmer Bookings
app.get('/api/bookings/farmer/:farmerId', (req, res) => {
  const farmer = db.getFarmerById(req.params.farmerId);
  if (!farmer) {
    return res.status(404).json({ error: `Farmer with ID ${req.params.farmerId} not found.` });
  }
  const bookings = db.getFarmerBookings(req.params.farmerId);
  res.json(bookings);
});

// Get Mandi Bookings (sorted by Time Slot)
app.get('/api/bookings/mandi/:mandiId', (req, res) => {
  const mandi = db.getMandiById(req.params.mandiId);
  if (!mandi) {
    return res.status(404).json({ error: `Mandi with ID ${req.params.mandiId} not found.` });
  }
  const { date } = req.query;
  const bookings = db.getMandiBookings(req.params.mandiId, date);
  
  // Sort chronologically by time slot
  bookings.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  res.json(bookings);
});

// --- MANDI OFFICER & VERIFICATION ROUTES ---

// Verify Arrival by QR Code or Token
app.post('/api/arrivals/verify', (req, res) => {
  try {
    const { mandiId, qrData, tokenNumber } = req.body;
    if (!mandiId) {
      return res.status(400).json({ error: "Mandi ID is required." });
    }
    const mandi = db.getMandiById(mandiId);
    if (!mandi) {
      return res.status(404).json({ error: `Mandi with ID ${mandiId} not found.` });
    }

    const result = db.verifyArrival(mandiId, { qrData, tokenNumber });
    // Broadcast real-time verification event
    broadcast('FARMER_VERIFIED', result.booking);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Complete Procurement & Confirm Payment
app.post('/api/procurement/complete', (req, res) => {
  try {
    const { mandiId, bookingId, actualQty, billedBy } = req.body;
    if (!mandiId) {
      return res.status(400).json({ error: "Mandi ID is required." });
    }
    const mandi = db.getMandiById(mandiId);
    if (!mandi) {
      return res.status(404).json({ error: `Mandi with ID ${mandiId} not found.` });
    }

    const result = db.processProcurement(mandiId, { bookingId, actualQty, billedBy });
    // Broadcast real-time payment/bill event
    broadcast('PROCUREMENT_COMPLETED', result);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Procurement & Bill by Booking ID
app.get('/api/procurement/booking/:bookingId', (req, res) => {
  const bill = db.getProcurementByBookingId(req.params.bookingId);
  if (!bill) {
    return res.status(404).json({ error: "No procurement bill found for this booking." });
  }
  res.json(bill);
});

// Get Farmer Bills & Transaction History
app.get('/api/bills/farmer/:farmerId', (req, res) => {
  const farmer = db.getFarmerById(req.params.farmerId);
  if (!farmer) {
    return res.status(404).json({ error: `Farmer with ID ${req.params.farmerId} not found.` });
  }
  const bills = db.getFarmerBills(req.params.farmerId);
  res.json(bills);
});

// Submit Daily Mandi Report
app.post('/api/reports/daily/submit', (req, res) => {
  try {
    const { mandiId, date } = req.body;
    if (!mandiId) {
      return res.status(400).json({ error: "Mandi ID is required." });
    }
    const mandi = db.getMandiById(mandiId);
    if (!mandi) {
      return res.status(404).json({ error: `Mandi with ID ${mandiId} not found.` });
    }

    const report = db.submitDailyReport(mandiId, date);
    broadcast('DAILY_REPORT_SUBMITTED', report);
    res.json({ success: true, report });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- ADMIN ROUTES ---

// Admin Stats & Analytics
app.get('/api/admin/stats', (req, res) => {
  const { date } = req.query;
  const stats = db.getAdminStats(date);
  res.json(stats);
});

// Admin History — all daily reports (optionally filtered by mandi, startDate, endDate)
app.get('/api/admin/history', (req, res) => {
  const { mandiId, startDate, endDate } = req.query;
  const reports = db.getAllDailyReports({ mandiId, startDate, endDate });
  res.json(reports);
});

// Enriched Mandi Bookings — joined with bill/procurement data (for Excel export & Mandi History)
app.get('/api/bookings/mandi/:mandiId/enriched', (req, res) => {
  const mandi = db.getMandiById(req.params.mandiId);
  if (!mandi) {
    return res.status(404).json({ error: `Mandi with ID ${req.params.mandiId} not found.` });
  }
  const { date } = req.query;
  const bookings = db.getEnrichedBookings(req.params.mandiId, date);
  bookings.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  res.json(bookings);
});

// Mandi History for a specific date — full enriched detail
app.get('/api/history/mandi/:mandiId', (req, res) => {
  const mandi = db.getMandiById(req.params.mandiId);
  if (!mandi) {
    return res.status(404).json({ error: `Mandi with ID ${req.params.mandiId} not found.` });
  }
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });
  const history = db.getMandiHistoryForDate(req.params.mandiId, date);
  res.json(history);
});



// Start Server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AGRI-PROCURE BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 WebSocket Real-time Sync Active on ws://localhost:${PORT}/ws`);
  console.log(`====================================================`);
});
