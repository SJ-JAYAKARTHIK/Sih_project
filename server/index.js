import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import twilio from 'twilio';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
app.post('/api/voice/farmer-id', (req, res) => {
  const digits = req.body && req.body.Digits ? req.body.Digits.trim() : '';
  const twiml = new twilio.twiml.VoiceResponse();

  // Validate that the value contains exactly 8 digits
  if (/^\d{8}$/.test(digits)) {
    const farmer = db.getFarmerById(digits);

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

// --- EXOTEL PASSTHRU VOICE ROUTE ---
// In-memory session store for tracking active Exotel IVR calls by CallSid / CallFrom
const exotelSessions = new Map();

// Crop Mapping (1-6 as configured in Exotel IVR)
const CROP_MAP = {
  '1': { id: 'crop-1', name: 'Paddy' },
  '2': { id: 'crop-2', name: 'Wheat' },
  '3': { id: 'crop-3', name: 'Cotton' },
  '4': { id: 'crop-4', name: 'Maize' },
  '5': { id: 'crop-5', name: 'Pulses' },
  '6': { id: 'crop-6', name: 'Gram' }
};

// Webhook endpoint for Exotel Passthru integration testing (supports both GET and POST)
const handleExotelRequest = (req, res) => {
  const rawDigits = req.query ? req.query.digits : undefined;
  const callSid = req.query.CallSid || req.body?.CallSid || req.query.CallFrom || req.body?.CallFrom || 'DEFAULT_SESSION';
  const sessionKey = callSid.trim();

  // Exotel sends digits as a quoted string (e.g. '"10029384"' or '"3"'). Normalize to unquoted string.
  const extractedDigits = typeof rawDigits === 'string'
    ? rawDigits.replace(/["']/g, '').trim()
    : (rawDigits !== undefined && rawDigits !== null ? String(rawDigits).replace(/["']/g, '').trim() : '');

  console.log('====================================================');
  console.log('📞 [EXOTEL PASSTHRU] Incoming Request Received');
  console.log('Session Key (CallSid/From):', sessionKey);
  console.log('Raw Exotel digits:', rawDigits);
  console.log('Extracted Digits:', extractedDigits);

  let session = exotelSessions.get(sessionKey) || { farmerId: null, farmerName: null, selectedCrop: null, stage: 'INIT' };

  // Distinguish input type by pattern & session state
  if (/^\d{8}$/.test(extractedDigits)) {
    // 1. Farmer ID Entry Stage (8 digits)
    const farmer = db.getFarmerById(extractedDigits);
    const isValidFarmerId = Boolean(farmer);

    if (isValidFarmerId) {
      session = {
        farmerId: farmer.id,
        farmerName: farmer.name,
        selectedCrop: null,
        stage: 'AWAITING_CROP'
      };
      exotelSessions.set(sessionKey, session);
      console.log('✅ Farmer ID Verified:', farmer.id);
      console.log('Farmer Name:', farmer.name);
      console.log('Session Stage Updated -> AWAITING_CROP');
    } else {
      console.log('❌ Farmer ID Not Found in Database:', extractedDigits);
    }
  } else if (/^[1-6]$/.test(extractedDigits)) {
    // 2. Crop Selection Stage (Digits 1 to 6)
    if (session.farmerId) {
      const cropInfo = CROP_MAP[extractedDigits];
      session.selectedCrop = cropInfo;
      session.stage = 'CROP_SELECTED';
      exotelSessions.set(sessionKey, session);

      console.log('🌽 Crop Selection Received:', extractedDigits, `(${cropInfo.name})`);
      console.log('✅ Active IVR Session State:', {
        farmerId: session.farmerId,
        farmerName: session.farmerName,
        selectedCrop: session.selectedCrop
      });
    } else {
      console.log('⚠️ Crop selection received (' + extractedDigits + '), but no verified Farmer ID session exists for this call.');
    }
  } else {
    console.log('ℹ️ Received input outside expected formats (neither 8-digit Farmer ID nor 1-6 crop choice):', extractedDigits);
  }

  console.log('====================================================');

  res.status(200).json({
    success: true,
    message: 'Exotel Passthru request received successfully'
  });
};

app.get('/api/voice/exotel', handleExotelRequest);
app.post('/api/voice/exotel', handleExotelRequest);

// Start Server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AGRI-PROCURE BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 WebSocket Real-time Sync Active on ws://localhost:${PORT}/ws`);
  console.log(`====================================================`);
});
