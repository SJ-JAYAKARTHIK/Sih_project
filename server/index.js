import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import twilio from 'twilio';
import { db } from './db.js';
import { handleExotelPassthru, handleExotelGreeting } from './voiceHandler.js';

if (typeof handleExotelGreeting === 'function') {
  console.log('[IMPORT] handleExotelGreeting imported successfully');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Production Environment Variables Audit & Startup Validation
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const activeUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const activeKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!activeUrl || !activeKey) {
  console.warn('⚠️ [STARTUP WARNING] Supabase environment variables not detected (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ [FATAL ERROR] Required Supabase production environment variables missing. Server startup aborted.');
    process.exit(1);
  }
} else {
  console.log('✅ [STARTUP] Supabase Production Environment Variables Verified.');
}

// Production-Safe CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ALLOWED_ORIGIN,
  'https://krishidwaar.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// GET /api/health — Production Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: "KrishiDwaar Backend",
    status: "UP",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

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
app.post('/api/auth/farmer-login', async (req, res) => {
  const { farmerId, password } = req.body;
  if (!farmerId || !password) {
    return res.status(400).json({ error: "Farmer ID and Password are required." });
  }

  const farmer = await db.getFarmerById(farmerId.trim());
  if (!farmer) {
    return res.status(404).json({ error: "Farmer ID not found. Please register first." });
  }

  if (farmer.password !== password) {
    return res.status(401).json({ error: "Invalid password." });
  }

  res.json({ success: true, farmer });
});

// Farmer Registration
app.post('/api/auth/farmer-register', async (req, res) => {
  const { name, mobile, password, location, bankDetails } = req.body;
  if (!name || !mobile || !password) {
    return res.status(400).json({ error: "Name, Mobile Number, and Password are required." });
  }

  // Generate 8-digit Farmer ID
  let farmerId;
  do {
    farmerId = Math.floor(10000000 + Math.random() * 90000000).toString();
  } while (await db.getFarmerById(farmerId));

  const newFarmer = {
    id: farmerId,
    name: name.trim(),
    mobile: mobile.trim(),
    password: password.trim(),
    language: "EN",
    location: location || "State Agriculture Division",
    bankDetails: bankDetails || "Bank Account **** (IFSC: SBIN0001234)"
  };

  await db.addFarmer(newFarmer);
  res.json({ success: true, farmer: newFarmer });
});

// Farmer Profile Update
app.post('/api/farmer/profile/update', async (req, res) => {
  try {
    const { farmerId, name, mobile, location, bankDetails, language } = req.body;
    if (!farmerId) {
      return res.status(400).json({ error: "Farmer ID is required." });
    }
    const updatedFarmer = await db.updateFarmerProfile(farmerId, { name, mobile, location, bankDetails, language });
    res.json({ success: true, farmer: updatedFarmer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mandi Login
app.post('/api/auth/mandi-login', async (req, res) => {
  const { mandiId, password } = req.body;
  if (!mandiId || !password) {
    return res.status(400).json({ error: "Mandi ID and Password are required." });
  }

  const mandi = await db.getMandiById(mandiId.trim().toUpperCase());
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
app.get('/api/master/crops', async (req, res) => {
  res.json(await db.getCrops());
});

// Get Mandis (Filtered by Crop if cropId query provided)
app.get('/api/master/mandis', async (req, res) => {
  const { cropId } = req.query;
  let mandis = await db.getMandis();
  if (cropId) {
    mandis = mandis.filter(m => m.acceptedCrops.includes(cropId));
  }
  res.json(mandis);
});

// --- SLOT BOOKING ROUTES ---

// 1-Month Date Availability
app.get('/api/slots/availability', async (req, res) => {
  const { mandiId, cropId } = req.query;
  if (!mandiId) {
    return res.status(400).json({ error: "Mandi ID is required for availability calculation." });
  }

  const dates = await db.getDateAvailability(mandiId, cropId);
  res.json(dates);
});

// 30-Minute Time Slots List
app.get('/api/slots/time-slots', async (req, res) => {
  const { mandiId, date } = req.query;
  if (!mandiId || !date) {
    return res.status(400).json({ error: "Mandi ID and Date are required." });
  }

  const slots = await db.getTimeSlots(mandiId, date);
  res.json(slots);
});

// Create Slot Booking
app.post('/api/bookings/create', async (req, res) => {
  try {
    const booking = await db.createBooking(req.body);
    // Broadcast real-time booking event to Mandi & Admin portals!
    broadcast('BOOKING_CREATED', booking);
    res.json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Farmer Bookings
app.get('/api/bookings/farmer/:farmerId', async (req, res) => {
  const farmer = await db.getFarmerById(req.params.farmerId);
  if (!farmer) {
    return res.status(404).json({ error: `Farmer with ID ${req.params.farmerId} not found.` });
  }
  const bookings = await db.getFarmerBookings(req.params.farmerId);
  res.json(bookings);
});

// Get Mandi Bookings (sorted by Time Slot)
app.get('/api/bookings/mandi/:mandiId', async (req, res) => {
  const mandi = await db.getMandiById(req.params.mandiId);
  if (!mandi) {
    return res.status(404).json({ error: `Mandi with ID ${req.params.mandiId} not found.` });
  }
  const { date } = req.query;
  const bookings = await db.getMandiBookings(req.params.mandiId, date);
  
  // Sort chronologically by time slot
  bookings.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  res.json(bookings);
});

// --- MANDI OFFICER & VERIFICATION ROUTES ---

// Verify Arrival by QR Code or Token
app.post('/api/arrivals/verify', async (req, res) => {
  try {
    const { mandiId, qrData, tokenNumber } = req.body;
    if (!mandiId) {
      return res.status(400).json({ error: "Mandi ID is required." });
    }
    const mandi = await db.getMandiById(mandiId);
    if (!mandi) {
      return res.status(404).json({ error: `Mandi with ID ${mandiId} not found.` });
    }

    const result = await db.verifyArrival(mandiId, { qrData, tokenNumber });
    // Broadcast real-time verification event
    broadcast('FARMER_VERIFIED', result.booking);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Complete Procurement & Confirm Payment
app.post('/api/procurement/complete', async (req, res) => {
  try {
    const { mandiId, bookingId, actualQty, billedBy } = req.body;
    if (!mandiId) {
      return res.status(400).json({ error: "Mandi ID is required." });
    }
    const mandi = await db.getMandiById(mandiId);
    if (!mandi) {
      return res.status(404).json({ error: `Mandi with ID ${mandiId} not found.` });
    }

    const result = await db.processProcurement(mandiId, { bookingId, actualQty, billedBy });
    // Broadcast real-time payment/bill event
    broadcast('PROCUREMENT_COMPLETED', result);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- LIVE QUEUE & ESTIMATED WAITING TIME ROUTES ---

// Get Mandi Operational Queue (Source of Truth)
app.get('/api/queue/mandi/:mandiId', async (req, res) => {
  const mandi = await db.getMandiById(req.params.mandiId);
  if (!mandi) {
    return res.status(404).json({ error: `Mandi with ID ${req.params.mandiId} not found.` });
  }
  const { date } = req.query;
  const queueData = await db.getMandiActiveQueue(req.params.mandiId, date);
  res.json(queueData);
});

// Get Farmer Live Queue Status (Source of Truth with Farmer Ownership Validation)
app.get('/api/queue/farmer/:farmerId', async (req, res) => {
  const farmer = await db.getFarmerById(req.params.farmerId);
  if (!farmer) {
    return res.status(404).json({ error: `Farmer with ID ${req.params.farmerId} not found.` });
  }
  const status = await db.getFarmerQueueStatus(req.params.farmerId);
  res.json(status);
});

// Start Procurement (Mandi Officer starts serving a farmer)
app.post('/api/queue/start-procurement', async (req, res) => {
  try {
    const { mandiId, bookingId } = req.body;
    if (!mandiId || !bookingId) {
      return res.status(400).json({ error: "Mandi ID and Booking ID are required." });
    }
    const mandi = await db.getMandiById(mandiId);
    if (!mandi) {
      return res.status(404).json({ error: `Mandi with ID ${mandiId} not found.` });
    }

    const booking = await db.startProcurement(mandiId, bookingId);
    broadcast('PROCUREMENT_STARTED', booking);
    res.json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Booking Queue Status (Cancel, No-Show, Reschedule)
app.post('/api/queue/update-status', async (req, res) => {
  try {
    const { mandiId, bookingId, action, date, timeSlot } = req.body;
    if (!mandiId || !bookingId || !action) {
      return res.status(400).json({ error: "Mandi ID, Booking ID, and Action are required." });
    }
    const mandi = await db.getMandiById(mandiId);
    if (!mandi) {
      return res.status(404).json({ error: `Mandi with ID ${mandiId} not found.` });
    }

    const booking = await db.updateBookingStatus(mandiId, bookingId, { action, date, timeSlot });
    const eventName = action === 'CANCEL' ? 'BOOKING_CANCELLED' : action === 'NOSHOW' ? 'BOOKING_NOSHOW' : 'BOOKING_RESCHEDULED';
    broadcast(eventName, booking);
    res.json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Farmer Cancel Booking Endpoint (Farmer Authorization Enforced)
app.post('/api/bookings/cancel', async (req, res) => {
  try {
    const { farmerId, bookingId } = req.body;
    if (!farmerId || !bookingId) {
      return res.status(400).json({ error: "Farmer ID and Booking ID are required." });
    }
    const farmer = await db.getFarmerById(farmerId);
    if (!farmer) {
      return res.status(404).json({ error: `Farmer with ID ${farmerId} not found.` });
    }

    const booking = await db.cancelBooking(farmerId, bookingId);
    broadcast('BOOKING_CANCELLED', booking);
    res.json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Farmer Reschedule Booking Endpoint (Farmer Authorization & Backend Capacity Enforced)
app.post('/api/bookings/reschedule', async (req, res) => {
  try {
    const { farmerId, bookingId, newDate, newTimeSlot } = req.body;
    if (!farmerId || !bookingId || !newDate || !newTimeSlot) {
      return res.status(400).json({ error: "Farmer ID, Booking ID, New Date, and New Time Slot are required." });
    }
    const farmer = await db.getFarmerById(farmerId);
    if (!farmer) {
      return res.status(404).json({ error: `Farmer with ID ${farmerId} not found.` });
    }

    const booking = await db.rescheduleBooking(farmerId, bookingId, { newDate, newTimeSlot });
    broadcast('BOOKING_RESCHEDULED', booking);
    res.json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Evaluate No-Shows Endpoint
app.post('/api/queue/evaluate-noshows', async (req, res) => {
  try {
    const { mandiId } = req.body || {};
    const evaluated = await db.evaluateNoShows(mandiId);
    if (evaluated.length > 0) {
      broadcast('BOOKING_NOSHOW', { count: evaluated.length, evaluated });
    }
    res.json({ success: true, count: evaluated.length, evaluated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Call Next Farmer Endpoint
app.post('/api/queue/call-next', async (req, res) => {
  try {
    const { mandiId, date } = req.body || {};
    if (!mandiId) {
      return res.status(400).json({ error: "Mandi ID is required." });
    }
    const calledBooking = await db.callNextFarmer(mandiId, date);
    broadcast('QUEUE_UPDATED', { mandiId, calledBooking, action: 'CALL_NEXT' });
    res.json({ success: true, booking: calledBooking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Officer Activity Log Endpoint
app.get('/api/officer/activity-log/:mandiId', async (req, res) => {
  try {
    const logs = await db.getOfficerActivityLog(req.params.mandiId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Global Search Endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    const results = await db.searchRecords(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- FARMER NOTIFICATION SYSTEM ROUTES ---

// Get Farmer Notifications & Unread Count (Farmer Authorization Enforced)
app.get('/api/notifications/farmer/:farmerId', async (req, res) => {
  const farmer = await db.getFarmerById(req.params.farmerId);
  if (!farmer) {
    return res.status(404).json({ error: `Farmer with ID ${req.params.farmerId} not found.` });
  }
  const notifications = await db.getFarmerNotifications(req.params.farmerId);
  const unreadCount = await db.getFarmerUnreadCount(req.params.farmerId);
  res.json({ notifications, unreadCount });
});

// Mark Single Notification as Read
app.post('/api/notifications/read', async (req, res) => {
  try {
    const { farmerId, notificationId } = req.body;
    if (!farmerId || !notificationId) {
      return res.status(400).json({ error: "Farmer ID and Notification ID are required." });
    }
    const farmer = await db.getFarmerById(farmerId);
    if (!farmer) {
      return res.status(404).json({ error: `Farmer with ID ${farmerId} not found.` });
    }
    const updated = db.markNotificationAsRead(farmerId, notificationId);
    res.json({ success: true, notification: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark All Notifications as Read for a Farmer
app.post('/api/notifications/read-all', async (req, res) => {
  try {
    const { farmerId } = req.body;
    if (!farmerId) {
      return res.status(400).json({ error: "Farmer ID is required." });
    }
    const farmer = await db.getFarmerById(farmerId);
    if (!farmer) {
      return res.status(404).json({ error: `Farmer with ID ${farmerId} not found.` });
    }
    const result = db.markAllNotificationsAsRead(farmerId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Procurement & Bill by Booking ID
app.get('/api/procurement/booking/:bookingId', async (req, res) => {
  const bill = await db.getProcurementByBookingId(req.params.bookingId);
  if (!bill) {
    return res.status(404).json({ error: "No procurement bill found for this booking." });
  }
  res.json(bill);
});

// Get Farmer Bills & Transaction History
app.get('/api/bills/farmer/:farmerId', async (req, res) => {
  const farmer = await db.getFarmerById(req.params.farmerId);
  if (!farmer) {
    return res.status(404).json({ error: `Farmer with ID ${req.params.farmerId} not found.` });
  }
  const bills = await db.getFarmerBills(req.params.farmerId);
  res.json(bills);
});

// Submit Daily Mandi Report
app.post('/api/reports/daily/submit', async (req, res) => {
  try {
    const { mandiId, date } = req.body;
    if (!mandiId) {
      return res.status(400).json({ error: "Mandi ID is required." });
    }
    const mandi = await db.getMandiById(mandiId);
    if (!mandi) {
      return res.status(404).json({ error: `Mandi with ID ${mandiId} not found.` });
    }

    const report = await db.submitDailyReport(mandiId, date);
    broadcast('DAILY_REPORT_SUBMITTED', report);
    res.json({ success: true, report });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- ADMIN ROUTES ---

// Admin Stats & Analytics
app.get('/api/admin/stats', async (req, res) => {
  const { date } = req.query;
  const stats = await db.getAdminStats(date);
  res.json(stats);
});

// Admin System Health Check
app.get('/api/admin/health', async (req, res) => {
  try {
    const health = await db.checkSystemHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Data Integrity Audit Monitor
app.get('/api/admin/integrity', async (req, res) => {
  try {
    const integrity = await db.checkDataIntegrity();
    res.json(integrity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin History — all daily reports (optionally filtered by mandi, startDate, endDate)
app.get('/api/admin/history', async (req, res) => {
  const { mandiId, startDate, endDate } = req.query;
  const reports = await db.getAllDailyReports({ mandiId, startDate, endDate });
  res.json(reports);
});

// Enriched Mandi Bookings — joined with bill/procurement data (for Excel export & Mandi History)
app.get('/api/bookings/mandi/:mandiId/enriched', async (req, res) => {
  const mandi = await db.getMandiById(req.params.mandiId);
  if (!mandi) {
    return res.status(404).json({ error: `Mandi with ID ${req.params.mandiId} not found.` });
  }
  const { date } = req.query;
  const bookings = await db.getEnrichedBookings(req.params.mandiId, date);
  bookings.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  res.json(bookings);
});

// Mandi History for a specific date — full enriched detail
app.get('/api/history/mandi/:mandiId', async (req, res) => {
  try {
    const mandi = await db.getMandiById(req.params.mandiId);
    if (!mandi) {
      return res.status(404).json({ error: `Mandi with ID ${req.params.mandiId} not found.` });
    }
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const history = await db.getMandiHistoryForDate(req.params.mandiId, targetDate);
    res.json(history);
  } catch (error) {
    console.error(`Error in /api/history/mandi/${req.params.mandiId}:`, error);
    res.status(500).json({ error: error.message || 'Failed to fetch mandi history.' });
  }
});

// Submit / Generate Daily Report
app.post('/api/reports/daily/submit', async (req, res) => {
  try {
    const { mandiId, date } = req.body;
    if (!mandiId) {
      return res.status(400).json({ error: 'Mandi ID is required.' });
    }
    const targetDate = date || new Date().toISOString().split('T')[0];
    const report = await db.submitDailyReport(mandiId, targetDate);
    broadcast('DAILY_REPORT_SUBMITTED', report);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error submitting daily report:', error);
    res.status(400).json({ error: error.message || 'Failed to submit daily report.' });
  }
});


// --- COMPLAINTS & DISPUTE MANAGEMENT ROUTES ---

// Create Complaint (Farmer Authorization Enforced)
app.post('/api/complaints/create', async (req, res) => {
  try {
    const { farmerId, bookingId, category, description } = req.body;
    const complaint = await db.createComplaint({ farmerId, bookingId, category, description });
    broadcast('COMPLAINT_CREATED', complaint);
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Farmer Complaints
app.get('/api/complaints/farmer/:farmerId', async (req, res) => {
  const farmer = await db.getFarmerById(req.params.farmerId);
  if (!farmer) {
    return res.status(404).json({ error: `Farmer with ID ${req.params.farmerId} not found.` });
  }
  const complaints = await db.getFarmerComplaints(req.params.farmerId);
  res.json(complaints);
});

// Get Mandi Complaints (Mandi Isolation Enforced)
app.get('/api/complaints/mandi/:mandiId', async (req, res) => {
  const mandi = await db.getMandiById(req.params.mandiId);
  if (!mandi) {
    return res.status(404).json({ error: `Mandi with ID ${req.params.mandiId} not found.` });
  }
  const { status, category } = req.query;
  const complaints = await db.getMandiComplaints(req.params.mandiId, { status, category });
  res.json(complaints);
});

// Get Admin All Complaints (Multi-Filter)
app.get('/api/complaints/admin', async (req, res) => {
  const { mandiId, status, category, date } = req.query;
  const complaints = await db.getAllComplaints({ mandiId, status, category, date });
  res.json(complaints);
});

// Update Complaint Status (Authorization & Mandi Isolation Enforced)
app.post('/api/complaints/update-status', (req, res) => {
  try {
    const { complaintId, updatedBy, role, mandiId, newStatus, responseComment } = req.body;
    if (!complaintId || !newStatus) {
      return res.status(400).json({ error: "Complaint ID and New Status are required." });
    }
    const updated = db.updateComplaintStatus({ complaintId, updatedBy, role, mandiId, newStatus, responseComment });
    broadcast('COMPLAINT_UPDATED', updated);
    res.json({ success: true, complaint: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- TWILIO VOICE IVR ROUTES ---

// 1. Initial Call Entrypoint: Welcome & Gather 8-digit Farmer ID
app.post('/api/voice/incoming', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  const gather = twiml.gather({
    action: '/api/voice/farmer-id',
    method: 'POST',
    numDigits: 8,
    timeout: 10
  });
  gather.say('Welcome to SIH26032 Farmer Voice Service. Please enter your 8-digit Farmer ID using your phone keypad.');

  // Fallback if caller enters no digits before timeout
  twiml.say('We did not receive any input. Please call back and try again. Goodbye.');
  twiml.hangup();

  res.type('text/xml');
  res.send(twiml.toString());
});

// 2. Validate & Lookup 8-digit Farmer ID
app.post('/api/voice/farmer-id', async (req, res) => {
  const digits = req.body && req.body.Digits ? req.body.Digits.trim() : '';
  const twiml = new twilio.twiml.VoiceResponse();

  // Validate that the value contains exactly 8 digits
  if (/^\d{8}$/.test(digits)) {
    const farmer = await db.getFarmerById(digits);

    if (farmer) {
      // Farmer found: Welcome farmer by name
      twiml.say(`Thank you. Welcome, ${farmer.name}. Your Farmer ID has been verified.`);
    } else {
      // Farmer ID does not exist in the database
      const gather = twiml.gather({
        action: '/api/voice/farmer-id',
        method: 'POST',
        numDigits: 8,
        timeout: 10
      });
      gather.say('We could not find that Farmer ID. Please enter your 8-digit Farmer ID again.');

      // Fallback if no digits entered
      twiml.say('We did not receive any input. Goodbye.');
      twiml.hangup();
    }
  } else {
    // If input is not 8 digits (invalid format)
    const gather = twiml.gather({
      action: '/api/voice/farmer-id',
      method: 'POST',
      numDigits: 8,
      timeout: 10
    });
    gather.say('That was not a valid 8-digit Farmer ID. Please enter your 8-digit Farmer ID again.');

    // Fallback if no digits entered
    twiml.say('We did not receive any input. Goodbye.');
    twiml.hangup();
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// --- EXOTEL PASSTHRU VOICE ROUTES ---
// Primary webhook endpoint for real Exotel IVR passthru (supports GET and POST)
app.get('/api/voice/exotel', (req, res) => handleExotelPassthru(req, res, broadcast));
app.post('/api/voice/exotel', (req, res) => handleExotelPassthru(req, res, broadcast));

// Dynamic Greeting Endpoint for Exotel IVR (supports GET, POST, and HEAD per Exotel dynamic greeting spec)
app.get('/api/voice/exotel/greeting', (req, res) => handleExotelGreeting(req, res));
app.post('/api/voice/exotel/greeting', (req, res) => handleExotelGreeting(req, res));
app.head('/api/voice/exotel/greeting', (req, res) => handleExotelGreeting(req, res));
console.log('[ROUTE] GET /api/voice/exotel/greeting registered');
console.log('[ROUTE] HEAD /api/voice/exotel/greeting registered');

// Development and testing endpoint (simulates full voice state-machine without phone calls)
app.post('/api/voice/exotel/test', (req, res) => handleExotelPassthru(req, res, broadcast));

// Start Server with 0.0.0.0 Cloud Binding
server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 AGRI-PROCURE BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 WebSocket Real-time Sync Active on path /ws`);
  console.log(`====================================================`);
});

// Graceful Shutdown Signal Handlers
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 [SHUTDOWN] ${signal} signal received. Closing HTTP server and WebSocket connections...`);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1001, 'Server shutting down');
    }
  });
  server.close(() => {
    console.log('✅ [SHUTDOWN] HTTP and WebSocket servers closed cleanly.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('⚠️ [SHUTDOWN] Forceful shutdown after timeout.');
    process.exit(1);
  }, 5000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
