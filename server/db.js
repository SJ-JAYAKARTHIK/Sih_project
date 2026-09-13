import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialData = {
  farmers: [
    {
      id: "10029384",
      name: "Ramesh Verma",
      mobile: "9876543210",
      password: "password123",
      language: "EN",
      location: "Warangal, Telangana",
      bankDetails: "State Bank of India — Account ****4821 (IFSC: SBIN0004921)"
    },
    {
      id: "20491823",
      name: "Lakshmi Narasimha",
      mobile: "9123456789",
      password: "password123",
      language: "TE",
      location: "Nizamabad, Telangana",
      bankDetails: "HDFC Bank — Account ****9102 (IFSC: HDFC0001029)"
    },
    {
      id: "30918274",
      name: "Rajesh Singh",
      mobile: "9988776655",
      password: "password123",
      language: "HI",
      location: "Guntur, Andhra Pradesh",
      bankDetails: "Union Bank of India — Account ****3321 (IFSC: UBIN0532189)"
    }
  ],

  mandis: [
    {
      id: "MANDI01",
      name: "Warangal Agriculture Market",
      location: "Enugulagadda, Warangal, Telangana",
      acceptedCrops: ["crop-1", "crop-3", "crop-4"], // Paddy, Cotton, Maize
      password: "123456"
    },
    {
      id: "MANDI02",
      name: "Nizamabad APMC Mandi",
      location: "Market Yard, Nizamabad, Telangana",
      acceptedCrops: ["crop-1", "crop-2", "crop-5"], // Paddy, Wheat, Pulses
      password: "123456"
    },
    {
      id: "MANDI03",
      name: "Guntur Grain Yard",
      location: "Guntur Central, Andhra Pradesh",
      acceptedCrops: ["crop-3", "crop-5", "crop-6"], // Cotton, Pulses, Gram
      password: "123456"
    },
    {
      id: "MANDI04",
      name: "Khammam Procurement Yard",
      location: "Wyra Road, Khammam, Telangana",
      acceptedCrops: ["crop-1", "crop-2", "crop-4", "crop-6"], // Paddy, Wheat, Maize, Gram
      password: "123456"
    }
  ],

  crops: [
    { id: "crop-1", name: "Paddy (Rice / వరి / धान)", ratePerQuintal: 2300, icon: "🌾" },
    { id: "crop-2", name: "Wheat (గోధుమలు / गेहूं)", ratePerQuintal: 2275, icon: "🌾" },
    { id: "crop-3", name: "Cotton (పత్తి / कपास)", ratePerQuintal: 7121, icon: "☁️" },
    { id: "crop-4", name: "Maize (మొక్కజొన్న / मक्का)", ratePerQuintal: 2090, icon: "🌽" },
    { id: "crop-5", name: "Pulses / Toor Dal (కందులు / अरहर)", ratePerQuintal: 7000, icon: "🫘" },
    { id: "crop-6", name: "Gram / Chickpea (శనగలు / चना)", ratePerQuintal: 5440, icon: "🫛" }
  ],

  bookings: [],
  procurements: [],
  dailyReports: [],
  notifications: [],
  complaints: []
};

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
}

class Database {
  constructor() {
    this.data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    if (!this.data.notifications) {
      this.data.notifications = [];
    }
    if (!this.data.complaints) {
      this.data.complaints = [];
    }
    this.ensureTodaySeedData();
  }

  save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  getFarmers() {
    return this.data.farmers;
  }

  getFarmerById(id) {
    return this.data.farmers.find(f => f.id === id);
  }

  addFarmer(farmerData) {
    this.data.farmers.push(farmerData);
    this.save();
    return farmerData;
  }

  getMandis() {
    return this.data.mandis;
  }

  getMandiById(id) {
    return this.data.mandis.find(m => m.id === id);
  }

  getCrops() {
    return this.data.crops;
  }

  getCropById(id) {
    return this.data.crops.find(c => c.id === id);
  }

  // Pre-seed a couple of realistic demo bookings for today so the user immediately sees live metrics
  ensureTodaySeedData() {
    const todayStr = new Date().toISOString().split('T')[0];
    const hasToday = this.data.bookings.some(b => b.date === todayStr);

    if (!hasToday) {
      const demoBookings = [
        {
          id: "BK-1001",
          tokenNumber: "TKN-849201",
          qrPayload: JSON.stringify({ token: "TKN-849201", farmerId: "10029384", mandiId: "MANDI01", date: todayStr }),
          farmerId: "10029384",
          farmerName: "Ramesh Verma",
          mobile: "9876543210",
          mandiId: "MANDI01",
          mandiName: "Warangal Agriculture Market",
          cropId: "crop-1",
          cropName: "Paddy (Rice / వరి / धान)",
          date: todayStr,
          timeSlot: "09:00 - 09:30",
          expectedQty: 50, // 50 Quintals (~5000 kg)
          actualQty: null,
          arrivalStatus: "Verified / Arrived",
          procurementStatus: "Pending",
          paymentStatus: "Pending",
          bookingStatus: "ACTIVE",
          procurementStage: "WAITING",
          arrivedAt: new Date(Date.now() - 3600000).toISOString(),
          procurementStartedAt: null,
          procurementCompletedAt: null,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "BK-1002",
          tokenNumber: "TKN-849202",
          qrPayload: JSON.stringify({ token: "TKN-849202", farmerId: "20491823", mandiId: "MANDI01", date: todayStr }),
          farmerId: "20491823",
          farmerName: "Lakshmi Narasimha",
          mobile: "9123456789",
          mandiId: "MANDI01",
          mandiName: "Warangal Agriculture Market",
          cropId: "crop-3",
          cropName: "Cotton (పత్తి / कपास)",
          date: todayStr,
          timeSlot: "09:30 - 10:00",
          expectedQty: 35,
          actualQty: null,
          arrivalStatus: "Pending",
          procurementStatus: "Pending",
          paymentStatus: "Pending",
          bookingStatus: "ACTIVE",
          procurementStage: "NOT_ARRIVED",
          arrivedAt: null,
          procurementStartedAt: null,
          procurementCompletedAt: null,
          createdAt: new Date(Date.now() - 1800000).toISOString()
        }
      ];

      this.data.bookings.push(...demoBookings);
      this.save();
    }
  }

  // Calculate 1-Month Date Availability for a given Mandi
  getDateAvailability(mandiId, cropId) {
    const dates = [];
    const today = new Date();
    const MAX_CAPACITY_PER_DAY = 20; // 20 slots per day max

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Count existing bookings for this mandi and date
      const bookedCount = this.data.bookings.filter(b => b.mandiId === mandiId && b.date === dateStr).length;
      const remaining = MAX_CAPACITY_PER_DAY - bookedCount;

      let status = "Green"; // High availability
      let text = "High Availability";

      if (remaining <= 0) {
        status = "Red";
        text = "Full / Unavailable";
      } else if (remaining <= 5) {
        status = "Yellow";
        text = "Limited Slots";
      }

      dates.push({
        date: dateStr,
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        bookedCount,
        remainingCount: Math.max(0, remaining),
        capacity: MAX_CAPACITY_PER_DAY,
        status,
        text
      });
    }

    return dates;
  }

  // Time Slots generation (30 min duration)
  getTimeSlots(mandiId, dateStr) {
    const slotsList = [
      "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00",
      "11:00 - 11:30", "11:30 - 12:00", "12:00 - 12:30", "12:30 - 13:00",
      "14:00 - 14:30", "14:30 - 15:00", "15:00 - 15:30", "15:30 - 16:00"
    ];

    const MAX_PER_TIME_SLOT = 2; // max 2 farmers per 30-min slot

    const existingBookings = this.data.bookings.filter(b => b.mandiId === mandiId && b.date === dateStr && (b.bookingStatus || 'ACTIVE') === 'ACTIVE');

    return slotsList.map(slotTime => {
      const count = existingBookings.filter(b => b.timeSlot === slotTime).length;
      const isFull = count >= MAX_PER_TIME_SLOT;

      return {
        time: slotTime,
        bookedCount: count,
        maxCapacity: MAX_PER_TIME_SLOT,
        isAvailable: !isFull
      };
    });
  }

  // Create Slot Booking
  createBooking(bookingReq) {
    const { farmerId, mandiId, cropId, date, timeSlot, expectedQty } = bookingReq;

    const farmer = this.getFarmerById(farmerId);
    const mandi = this.getMandiById(mandiId);
    const crop = this.getCropById(cropId);

    if (!farmer || !mandi || !crop) {
      throw new Error("Invalid Farmer, Mandi, or Crop selection.");
    }

    // Capacity validation (only count ACTIVE bookings)
    const existing = this.data.bookings.filter(b => b.mandiId === mandiId && b.date === date && b.timeSlot === timeSlot && (b.bookingStatus || 'ACTIVE') === 'ACTIVE');
    if (existing.length >= 2) {
      throw new Error("This 30-minute time slot is already fully booked. Please select another slot.");
    }

    // Duplicate farmer booking on same date (only count ACTIVE, non-completed bookings)
    const farmerExisting = this.data.bookings.find(b => b.farmerId === farmerId && b.date === date && (b.bookingStatus || 'ACTIVE') === 'ACTIVE' && b.procurementStatus !== 'Completed');
    if (farmerExisting) {
      throw new Error("You already have an active procurement booking on this date.");
    }

    // Generate unique Token Number (e.g. TKN-849201)
    let randomNum;
    let tokenNumber;
    do {
      randomNum = Math.floor(100000 + Math.random() * 900000);
      tokenNumber = `TKN-${randomNum}`;
    } while (this.data.bookings.some(b => b.tokenNumber === tokenNumber));

    const bookingId = `BK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrPayload = JSON.stringify({
      bookingId,
      tokenNumber,
      farmerId: farmer.id,
      farmerName: farmer.name,
      mandiId: mandi.id,
      mandiName: mandi.name,
      cropName: crop.name,
      date,
      timeSlot
    });

    const newBooking = {
      id: bookingId,
      tokenNumber,
      qrPayload,
      farmerId: farmer.id,
      farmerName: farmer.name,
      mobile: farmer.mobile,
      mandiId: mandi.id,
      mandiName: mandi.name,
      cropId: crop.id,
      cropName: crop.name,
      date,
      timeSlot,
      expectedQty: expectedQty ? parseFloat(expectedQty) : null,
      actualQty: null,
      arrivalStatus: "Pending",
      procurementStatus: "Pending",
      paymentStatus: "Pending",
      bookingStatus: "ACTIVE",
      procurementStage: "NOT_ARRIVED",
      arrivedAt: null,
      procurementStartedAt: null,
      procurementCompletedAt: null,
      source: bookingReq.source || "WEB",
      createdAt: new Date().toISOString()
    };

    this.data.bookings.push(newBooking);

    // Create automatic notification
    this.addNotification({
      farmerId: farmer.id,
      bookingId,
      type: "BOOKING_CONFIRMED",
      title: "Booking Confirmed",
      message: `Procurement slot confirmed for ${crop.name} at ${mandi.name} on ${date} (${timeSlot}). Token: ${tokenNumber}`
    });

    this.save();
    return newBooking;
  }

  // Get Bookings for Farmer
  getFarmerBookings(farmerId) {
    return this.data.bookings.filter(b => b.farmerId === farmerId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Get Bookings for Mandi (filtered by date)
  getMandiBookings(mandiId, dateStr) {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    return this.data.bookings.filter(b => b.mandiId === mandiId && b.date === targetDate);
  }

  // Verify Arrival by QR payload or Token Number
  verifyArrival(mandiId, { qrData, tokenNumber }) {
    let booking = null;
    const todayStr = new Date().toISOString().split('T')[0];

    if (qrData) {
      try {
        const parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
        booking = this.data.bookings.find(b => 
          (b.id === parsed.bookingId || b.tokenNumber === parsed.tokenNumber) && 
          b.mandiId === mandiId
        );
      } catch (e) {
        // Raw token fallback if string search
        booking = this.data.bookings.find(b => b.tokenNumber === qrData && b.mandiId === mandiId);
      }
    } else if (tokenNumber) {
      booking = this.data.bookings.find(b => b.tokenNumber.trim().toUpperCase() === tokenNumber.trim().toUpperCase() && b.mandiId === mandiId);
    }

    if (!booking) {
      throw new Error("Invalid QR Code or Token Number. No matching booking found for this Mandi.");
    }

    // Validate the booking is for today's date
    if (booking.date !== todayStr) {
      throw new Error(`Invalid verification: This booking is for ${booking.date}, not today (${todayStr}). Only today's bookings can be verified.`);
    }

    if (booking.arrivalStatus === "Verified / Arrived") {
      throw new Error("Duplicate verification rejected: Farmer has already been verified for arrival today.");
    }

    if ((booking.bookingStatus || 'ACTIVE') !== 'ACTIVE') {
      throw new Error(`Invalid verification: Booking status is ${booking.bookingStatus}.`);
    }

    booking.arrivalStatus = "Verified / Arrived";
    booking.procurementStage = "WAITING";
    booking.arrivedAt = new Date().toISOString();

    // Create automatic notification
    this.addNotification({
      farmerId: booking.farmerId,
      bookingId: booking.id,
      type: "ARRIVED_AT_MANDI",
      title: "Arrived at Mandi",
      message: `Gate arrival verified for Token ${booking.tokenNumber} at ${booking.mandiName}. You are now in the active waiting queue.`
    });

    this.save();
    return { booking, message: "✅ Farmer Verified / Arrived Successfully!" };
  }

  // Start Procurement (Mandi officer moves status to IN_PROGRESS / SERVING)
  startProcurement(mandiId, bookingId) {
    const booking = this.data.bookings.find(b => b.id === bookingId && b.mandiId === mandiId);
    if (!booking) {
      throw new Error("Booking not found for this Mandi.");
    }
    if ((booking.bookingStatus || 'ACTIVE') !== 'ACTIVE') {
      throw new Error(`Cannot start procurement for booking with status ${booking.bookingStatus}.`);
    }
    if (booking.arrivalStatus !== "Verified / Arrived") {
      throw new Error("Cannot start procurement: Farmer arrival has not been verified at the Mandi gate yet.");
    }
    if (booking.procurementStage === "COMPLETED" || booking.procurementStatus === "Completed") {
      throw new Error("Procurement is already completed for this booking.");
    }

    booking.procurementStage = "IN_PROGRESS";
    booking.procurementStartedAt = new Date().toISOString();

    // Create automatic notification
    this.addNotification({
      farmerId: booking.farmerId,
      bookingId: booking.id,
      type: "TURN_APPROACHING",
      title: "Your Turn! Procurement Started",
      message: `Mandi officer has called Token ${booking.tokenNumber}. Please proceed to weighing station for procurement.`
    });

    this.save();
    return booking;
  }

  // Cancel Booking (Enforces Farmer Ownership & Gate Arrival Eligibility)
  cancelBooking(farmerId, bookingId) {
    const booking = this.data.bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error("Booking record not found.");
    }
    if (booking.farmerId !== farmerId) {
      throw new Error("Authorization failed: You can only cancel your own bookings.");
    }
    if ((booking.bookingStatus || 'ACTIVE') !== 'ACTIVE') {
      throw new Error(`Cannot cancel booking with status ${booking.bookingStatus}.`);
    }
    if (booking.arrivalStatus === "Verified / Arrived" || booking.procurementStatus === "Completed" || booking.procurementStage === "IN_PROGRESS") {
      throw new Error("Cannot cancel booking: Arrival has already been gate-verified or procurement/weighing has started.");
    }

    booking.bookingStatus = 'CANCELLED';
    this.addNotification({
      farmerId: booking.farmerId,
      bookingId: booking.id,
      type: "BOOKING_CANCELLED",
      title: "Booking Cancelled",
      message: `Your booking (Token: ${booking.tokenNumber}) at ${booking.mandiName} has been cancelled.`
    });

    this.save();
    return booking;
  }

  // Reschedule Booking (Enforces Farmer Ownership, Gate Eligibility & Authoritative Backend Capacity Check)
  rescheduleBooking(farmerId, bookingId, { newDate, newTimeSlot }) {
    const booking = this.data.bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error("Booking record not found.");
    }
    if (booking.farmerId !== farmerId) {
      throw new Error("Authorization failed: You can only reschedule your own bookings.");
    }
    if ((booking.bookingStatus || 'ACTIVE') !== 'ACTIVE') {
      throw new Error(`Cannot reschedule booking with status ${booking.bookingStatus}.`);
    }
    if (booking.arrivalStatus === "Verified / Arrived" || booking.procurementStatus === "Completed" || booking.procurementStage === "IN_PROGRESS") {
      throw new Error("Cannot reschedule booking: Arrival has already been gate-verified or procurement has started.");
    }
    if (!newDate || !newTimeSlot) {
      throw new Error("New date and time slot are required for rescheduling.");
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (newDate < todayStr) {
      throw new Error("Cannot reschedule to a past date.");
    }

    // Verify Mandi crop compatibility
    const mandi = this.getMandiById(booking.mandiId);
    if (mandi && !mandi.acceptedCrops.includes(booking.cropId)) {
      throw new Error(`This Mandi does not accept the selected crop (${booking.cropName}).`);
    }

    // Authoritative backend capacity check to prevent race-condition overbooking
    const existingActive = this.data.bookings.filter(b => 
      b.mandiId === booking.mandiId && 
      b.date === newDate && 
      b.timeSlot === newTimeSlot && 
      b.id !== bookingId && 
      (b.bookingStatus || 'ACTIVE') === 'ACTIVE' &&
      b.procurementStatus !== 'Completed'
    );

    if (existingActive.length >= 2) {
      throw new Error("The selected time slot is fully booked on the target date. Please choose another slot.");
    }

    // Update booking schedule and reset arrival state
    booking.date = newDate;
    booking.timeSlot = newTimeSlot;
    booking.arrivalStatus = 'Pending';
    booking.procurementStage = 'NOT_ARRIVED';
    booking.arrivedAt = null;
    booking.procurementStartedAt = null;
    booking.procurementCompletedAt = null;

    // Update QR Payload
    booking.qrPayload = JSON.stringify({
      bookingId: booking.id,
      tokenNumber: booking.tokenNumber,
      farmerId: booking.farmerId,
      farmerName: booking.farmerName,
      mandiId: booking.mandiId,
      mandiName: booking.mandiName,
      cropName: booking.cropName,
      date: newDate,
      timeSlot: newTimeSlot
    });

    this.addNotification({
      farmerId: booking.farmerId,
      bookingId: booking.id,
      type: "BOOKING_RESCHEDULED",
      title: "Booking Rescheduled",
      message: `Your booking (Token: ${booking.tokenNumber}) has been rescheduled to ${newDate} (${newTimeSlot}).`
    });

    this.save();
    return booking;
  }

  // Configurable No-Show Grace Period Evaluator
  evaluateNoShows(mandiId = null) {
    const GRACE_PERIOD_MINUTES = parseInt(process.env.NO_SHOW_GRACE_PERIOD_MINUTES || '60', 10);
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const evaluatedNoShows = [];

    const targetBookings = this.data.bookings.filter(b => 
      b.date === todayStr &&
      b.arrivalStatus === "Pending" &&
      (b.bookingStatus || 'ACTIVE') === 'ACTIVE' &&
      (!mandiId || b.mandiId === mandiId)
    );

    targetBookings.forEach(booking => {
      // Extract slot end time (e.g., "09:00 - 09:30" -> end is "09:30")
      if (booking.timeSlot && booking.timeSlot.includes('-')) {
        const endTimeStr = booking.timeSlot.split('-')[1].trim(); // "09:30"
        const [hours, minutes] = endTimeStr.split(':').map(Number);
        
        const slotEndDateTime = new Date();
        slotEndDateTime.setHours(hours, minutes, 0, 0);

        const graceExpiryDateTime = new Date(slotEndDateTime.getTime() + GRACE_PERIOD_MINUTES * 60000);

        if (now > graceExpiryDateTime) {
          booking.bookingStatus = 'NO_SHOW';
          this.addNotification({
            farmerId: booking.farmerId,
            bookingId: booking.id,
            type: "BOOKING_NOSHOW",
            title: "Marked No-Show",
            message: `Your booking (Token: ${booking.tokenNumber}) was marked as No-Show after grace period expired.`
          });
          evaluatedNoShows.push(booking);
        }
      }
    });

    if (evaluatedNoShows.length > 0) {
      this.save();
    }
    return evaluatedNoShows;
  }

  // Update Booking Status (Mandi Officer operational override)
  updateBookingStatus(mandiId, bookingId, { action, date, timeSlot }) {
    const booking = this.data.bookings.find(b => b.id === bookingId && b.mandiId === mandiId);
    if (!booking) {
      throw new Error("Booking not found for this Mandi.");
    }

    if (action === 'CANCEL') {
      return this.cancelBooking(booking.farmerId, bookingId);
    } else if (action === 'NOSHOW') {
      booking.bookingStatus = 'NO_SHOW';
      this.addNotification({
        farmerId: booking.farmerId,
        bookingId: booking.id,
        type: "BOOKING_NOSHOW",
        title: "Marked No-Show",
        message: `Your booking (Token: ${booking.tokenNumber}) at ${booking.mandiName} was marked as No-Show.`
      });
    } else if (action === 'RESCHEDULE') {
      return this.rescheduleBooking(booking.farmerId, bookingId, { newDate: date, newTimeSlot: timeSlot });
    } else {
      throw new Error("Invalid status action.");
    }

    this.save();
    return booking;
  }

  // Complete Procurement & Generate Bill
  processProcurement(mandiId, { bookingId, actualQty, billedBy }) {
    const booking = this.data.bookings.find(b => b.id === bookingId && b.mandiId === mandiId);
    if (!booking) {
      throw new Error("Booking record not found for this Mandi.");
    }

    if (booking.arrivalStatus !== "Verified / Arrived") {
      throw new Error("Cannot process procurement: Farmer arrival has not been verified at the Mandi gate yet. Verification is required before weighing and payment.");
    }

    if (booking.procurementStatus === "Completed") {
      throw new Error("Procurement and payment have already been completed for this booking.");
    }

    const existingBill = this.data.procurements.find(p => p.bookingId === bookingId);
    if (existingBill) {
      throw new Error("Duplicate procurement/billing rejected: A procurement bill already exists for this booking.");
    }

    if (!actualQty || isNaN(actualQty) || parseFloat(actualQty) <= 0) {
      throw new Error("Please enter a valid numeric Actual Quantity from weighing machine.");
    }

    if (!billedBy || billedBy.trim() === '') {
      throw new Error("Please select or enter the staff name for 'Billed By'.");
    }

    const crop = this.getCropById(booking.cropId);
    const qtyVal = parseFloat(actualQty);
    const ratePerQuintal = crop ? crop.ratePerQuintal : 2300;
    const totalAmount = Math.round(qtyVal * ratePerQuintal);

    const paymentRef = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Update booking
    booking.actualQty = qtyVal;
    booking.procurementStatus = "Completed";
    booking.paymentStatus = "Completed";
    booking.procurementStage = "COMPLETED";
    booking.procurementCompletedAt = new Date().toISOString();

    // Create procurement/bill record
    const billRecord = {
      id: `BILL-${Date.now()}`,
      bookingId: booking.id,
      tokenNumber: booking.tokenNumber,
      farmerId: booking.farmerId,
      farmerName: booking.farmerName,
      mobile: booking.mobile,
      mandiId: booking.mandiId,
      mandiName: booking.mandiName,
      cropName: booking.cropName,
      date: booking.date,
      timeSlot: booking.timeSlot,
      expectedQty: booking.expectedQty,
      actualQty: qtyVal,
      ratePerQuintal,
      totalAmount,
      billedBy: billedBy.trim(),
      paymentRef,
      paymentStatus: "Completed",
      createdTimestamp: new Date().toISOString()
    };

    this.data.procurements.push(billRecord);

    // Create automatic notification for procurement, payment & bill completion
    this.addNotification({
      farmerId: booking.farmerId,
      bookingId: booking.id,
      type: "PROCUREMENT_COMPLETED",
      title: "Procurement & Payment Completed",
      message: `Procurement of ${qtyVal} Quintals completed. Total Amount: ₹${totalAmount.toLocaleString('en-IN')}. Payment Ref: ${paymentRef}. Bill is generated.`
    });

    this.save();

    return { booking, bill: billRecord };
  }

  // Calculate historical average processing time (in minutes) for a mandi
  calculateAverageProcessingTime(mandiId, dateStr) {
    const FALLBACK_AVERAGE_MINUTES = 15;
    // Find all completed procurements with start & end timestamps for this mandi
    const completedList = this.data.bookings.filter(b => 
      b.mandiId === mandiId && 
      b.procurementStage === 'COMPLETED' && 
      b.procurementStartedAt && 
      b.procurementCompletedAt
    );

    if (completedList.length === 0) {
      return FALLBACK_AVERAGE_MINUTES;
    }

    const totalDurationMs = completedList.reduce((acc, b) => {
      const start = new Date(b.procurementStartedAt).getTime();
      const end = new Date(b.procurementCompletedAt).getTime();
      const diff = end - start;
      return acc + (diff > 0 ? diff : 15 * 60000);
    }, 0);

    const avgMinutes = Math.max(5, Math.round(totalDurationMs / (completedList.length * 60000)));
    return avgMinutes;
  }

  // Get Mandi Active Queue (Source of Truth)
  getMandiActiveQueue(mandiId, dateStr) {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    
    // Only bookings for correct mandi, correct date, verified/arrived status, active booking status, not completed
    const activeBookings = this.data.bookings.filter(b => 
      b.mandiId === mandiId &&
      b.date === targetDate &&
      b.arrivalStatus === "Verified / Arrived" &&
      (b.bookingStatus || 'ACTIVE') === 'ACTIVE' &&
      b.procurementStage !== 'COMPLETED' &&
      b.procurementStatus !== 'Completed'
    );

    // Prevent duplicate entries & sort active queue chronologically by time slot, then arrival time / created time
    const sortedQueue = [...activeBookings].sort((a, b) => {
      if (a.timeSlot !== b.timeSlot) {
        return a.timeSlot.localeCompare(b.timeSlot);
      }
      const timeA = a.arrivedAt ? new Date(a.arrivedAt).getTime() : new Date(a.createdAt).getTime();
      const timeB = b.arrivedAt ? new Date(b.arrivedAt).getTime() : new Date(b.createdAt).getTime();
      return timeA - timeB;
    });

    const currentlyServing = sortedQueue.find(b => b.procurementStage === 'IN_PROGRESS') || null;
    const waitingQueue = sortedQueue.filter(b => b.procurementStage === 'WAITING');
    const nextFarmer = waitingQueue.length > 0 ? waitingQueue[0] : null;

    const completedTodayCount = this.data.bookings.filter(b => 
      b.mandiId === mandiId && 
      b.date === targetDate && 
      (b.procurementStage === 'COMPLETED' || b.procurementStatus === 'Completed')
    ).length;

    const avgMinutes = this.calculateAverageProcessingTime(mandiId, targetDate);

    return {
      mandiId,
      date: targetDate,
      currentlyServing,
      nextFarmer,
      waitingQueue,
      activeQueue: sortedQueue,
      totalArrivedActive: sortedQueue.length,
      completedTodayCount,
      averageProcessingMinutes: avgMinutes
    };
  }

  // Get Farmer Queue Status (Source of Truth)
  getFarmerQueueStatus(farmerId) {
    const todayStr = new Date().toISOString().split('T')[0];

    // Find farmer's active booking for today
    const farmerBookings = this.data.bookings.filter(b => b.farmerId === farmerId && (b.bookingStatus || 'ACTIVE') === 'ACTIVE');
    const activeBooking = farmerBookings.find(b => b.date === todayStr && b.arrivalStatus === "Verified / Arrived" && b.procurementStage !== 'COMPLETED' && b.procurementStatus !== 'Completed')
      || farmerBookings.find(b => b.date === todayStr && (b.bookingStatus || 'ACTIVE') === 'ACTIVE')
      || farmerBookings[0]
      || null;

    if (!activeBooking) {
      return {
        hasActiveQueue: false,
        message: "No active queue entry found for today."
      };
    }

    if (activeBooking.arrivalStatus !== "Verified / Arrived" || (activeBooking.bookingStatus || 'ACTIVE') !== 'ACTIVE' || activeBooking.procurementStage === 'COMPLETED' || activeBooking.procurementStatus === 'Completed') {
      return {
        hasActiveQueue: false,
        booking: activeBooking,
        arrivalStatus: activeBooking.arrivalStatus,
        procurementStage: activeBooking.procurementStage || (activeBooking.procurementStatus === 'Completed' ? 'COMPLETED' : 'NOT_ARRIVED'),
        bookingStatus: activeBooking.bookingStatus || 'ACTIVE',
        message: activeBooking.arrivalStatus !== "Verified / Arrived" ? "Gate arrival verification pending." : "Booking completed or non-active."
      };
    }

    // Get Mandi active queue for this booking's mandi and date
    const mandiQueue = this.getMandiActiveQueue(activeBooking.mandiId, activeBooking.date);

    const isServing = activeBooking.procurementStage === 'IN_PROGRESS';
    let queuePosition = null;
    let farmersAhead = 0;

    if (isServing) {
      queuePosition = "#1 (Serving)";
      farmersAhead = 0;
    } else {
      // Find position in active queue
      const activeIdx = mandiQueue.activeQueue.findIndex(b => b.id === activeBooking.id);
      if (activeIdx !== -1) {
        queuePosition = `#${activeIdx + 1}`;
        farmersAhead = activeIdx;
      } else {
        const waitIdx = mandiQueue.waitingQueue.findIndex(b => b.id === activeBooking.id);
        const aheadInWait = waitIdx !== -1 ? waitIdx : 0;
        farmersAhead = (mandiQueue.currentlyServing ? 1 : 0) + aheadInWait;
        queuePosition = `#${farmersAhead + 1}`;
      }
    }

    const estimatedWaitMinutes = farmersAhead * mandiQueue.averageProcessingMinutes;

    return {
      hasActiveQueue: true,
      booking: activeBooking,
      tokenNumber: activeBooking.tokenNumber,
      queuePosition,
      farmersAhead,
      currentlyServingToken: mandiQueue.currentlyServing ? mandiQueue.currentlyServing.tokenNumber : "None",
      nextToken: mandiQueue.nextFarmer ? mandiQueue.nextFarmer.tokenNumber : "None",
      procurementStage: activeBooking.procurementStage || "WAITING",
      estimatedWaitMinutes,
      averageProcessingMinutes: mandiQueue.averageProcessingMinutes,
      mandiId: activeBooking.mandiId,
      mandiName: activeBooking.mandiName,
      date: activeBooking.date,
      timeSlot: activeBooking.timeSlot,
      cropName: activeBooking.cropName,
      isEstimate: true
    };
  }

  // Get procurement by booking ID
  getProcurementByBookingId(bookingId) {
    return this.data.procurements.find(p => p.bookingId === bookingId) || null;
  }

  // Get Bills for a Farmer
  getFarmerBills(farmerId) {
    return this.data.procurements.filter(p => p.farmerId === farmerId).sort((a, b) => new Date(b.createdTimestamp) - new Date(a.createdTimestamp));
  }

  // Save/Submit End of Day Mandi Report
  submitDailyReport(mandiId, dateStr) {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const mandi = this.getMandiById(mandiId);
    const bookings = this.getMandiBookings(mandiId, targetDate);

    const totalBooked = bookings.length;
    const totalVerified = bookings.filter(b => b.arrivalStatus === "Verified / Arrived").length;
    const totalPending = bookings.filter(b => b.arrivalStatus === "Pending").length;
    const completedList = bookings.filter(b => b.procurementStatus === "Completed");
    const totalCompleted = completedList.length;

    let totalQty = 0;
    let totalPayment = 0;

    completedList.forEach(b => {
      const bill = this.data.procurements.find(p => p.bookingId === b.id);
      if (bill) {
        totalQty += bill.actualQty;
        totalPayment += bill.totalAmount;
      }
    });

    const report = {
      id: `RPT-${mandiId}-${targetDate}`,
      mandiId,
      mandiName: mandi ? mandi.name : mandiId,
      date: targetDate,
      totalBooked,
      totalVerified,
      totalPending,
      totalCompleted,
      totalQty,
      totalPayment,
      submittedAt: new Date().toISOString()
    };

    // Replace if exists for date
    const idx = this.data.dailyReports.findIndex(r => r.mandiId === mandiId && r.date === targetDate);
    if (idx >= 0) {
      this.data.dailyReports[idx] = report;
    } else {
      this.data.dailyReports.push(report);
    }

    this.save();
    return report;
  }

  // Admin Dashboard Statistics & Analytics
  getAdminStats(selectedDate) {
    const targetDate = selectedDate || new Date().toISOString().split('T')[0];
    const todayBookings = this.data.bookings.filter(b => b.date === targetDate);

    const totalMandis = this.data.mandis.length;
    const totalFarmers = this.data.farmers.length;
    const todayBooked = todayBookings.length;
    const todayVerified = todayBookings.filter(b => b.arrivalStatus === "Verified / Arrived").length;
    const todayPending = todayBookings.filter(b => b.arrivalStatus === "Pending").length;
    const todayCompleted = todayBookings.filter(b => b.procurementStatus === "Completed").length;

    let totalQtyProcuredToday = 0;
    let totalPaymentAmountToday = 0;

    const todayProcurements = this.data.procurements.filter(p => p.date === targetDate);
    todayProcurements.forEach(p => {
      totalQtyProcuredToday += p.actualQty;
      totalPaymentAmountToday += p.totalAmount;
    });

    // Mandi wise stats
    const mandiStats = this.data.mandis.map(mandi => {
      const mBookings = todayBookings.filter(b => b.mandiId === mandi.id);
      const mProc = todayProcurements.filter(p => p.mandiId === mandi.id);
      const mQty = mProc.reduce((acc, curr) => acc + curr.actualQty, 0);
      const mPay = mProc.reduce((acc, curr) => acc + curr.totalAmount, 0);

      return {
        mandiId: mandi.id,
        mandiName: mandi.name,
        location: mandi.location,
        booked: mBookings.length,
        verified: mBookings.filter(b => b.arrivalStatus === "Verified / Arrived").length,
        pending: mBookings.filter(b => b.arrivalStatus === "Pending").length,
        completed: mBookings.filter(b => b.procurementStatus === "Completed").length,
        totalQty: mQty,
        totalPayment: mPay
      };
    });

    // Crop wise stats
    const cropStats = this.data.crops.map(crop => {
      const cProc = this.data.procurements.filter(p => p.cropName.includes(crop.name.split(' ')[0]));
      const cQty = cProc.reduce((acc, curr) => acc + curr.actualQty, 0);
      const cPay = cProc.reduce((acc, curr) => acc + curr.totalAmount, 0);

      return {
        cropId: crop.id,
        cropName: crop.name,
        icon: crop.icon,
        count: cProc.length,
        totalQty: cQty,
        totalPayment: cPay
      };
    });

    return {
      date: targetDate,
      totalMandis,
      totalFarmers,
      todayBooked,
      todayVerified,
      todayPending,
      todayCompleted,
      totalQtyProcuredToday,
      totalPaymentAmountToday,
      mandiStats,
      cropStats,
      dailyReports: this.data.dailyReports.filter(r => r.date === targetDate)
    };
  }

  // Get enriched bookings joined with procurement/bill data — for Excel export, Mandi History, etc.
  getEnrichedBookings(mandiId, dateStr) {
    const bookings = this.getMandiBookings(mandiId, dateStr);
    return bookings.map(b => {
      const bill = this.data.procurements.find(p => p.bookingId === b.id);
      const complaint = (this.data.complaints || []).find(c => c.bookingId === b.id);
      return {
        ...b,
        billedBy: bill ? bill.billedBy : null,
        pricePaid: bill ? bill.totalAmount : 0,
        ratePerQuintal: bill ? bill.ratePerQuintal : null,
        paymentRef: bill ? bill.paymentRef : null,
        complaintId: complaint ? complaint.id : null,
        complaintStatus: complaint ? complaint.status : 'None',
        complaintCategory: complaint ? complaint.category : 'N/A'
      };
    });
  }

  // Get ALL daily reports (optionally filtered) — for Admin History
  getAllDailyReports({ mandiId, startDate, endDate } = {}) {
    let reports = [...this.data.dailyReports];
    if (mandiId) reports = reports.filter(r => r.mandiId === mandiId);
    if (startDate) reports = reports.filter(r => r.date >= startDate);
    if (endDate) reports = reports.filter(r => r.date <= endDate);
    return reports.sort((a, b) => b.date.localeCompare(a.date));
  }

  // Get Mandi history for a specific date (enriched) — for MandiHistory component
  getMandiHistoryForDate(mandiId, dateStr) {
    const bookings = this.getEnrichedBookings(mandiId, dateStr);
    const totalBooked = bookings.length;
    const totalVerified = bookings.filter(b => b.arrivalStatus === 'Verified / Arrived').length;
    const totalPending = bookings.filter(b => b.arrivalStatus === 'Pending').length;
    const totalCompleted = bookings.filter(b => b.procurementStatus === 'Completed').length;
    const totalQty = bookings.reduce((s, b) => s + (b.actualQty || 0), 0);
    const totalPayment = bookings.reduce((s, b) => s + (b.pricePaid || 0), 0);

    return { date: dateStr, bookings, totalBooked, totalVerified, totalPending, totalCompleted, totalQty, totalPayment };
  }

  // --- NOTIFICATION ENGINE METHODS ---

  addNotification({ farmerId, bookingId, type, title, message }) {
    if (!this.data.notifications) {
      this.data.notifications = [];
    }

    // Deduplication check: avoid exact duplicate notification for same farmerId, bookingId, and type
    const isDuplicate = this.data.notifications.some(n =>
      n.farmerId === farmerId &&
      n.bookingId === bookingId &&
      n.type === type &&
      (Date.now() - new Date(n.createdAt).getTime()) < 10000
    );

    if (isDuplicate) {
      return this.data.notifications.find(n => n.farmerId === farmerId && n.bookingId === bookingId && n.type === type);
    }

    const notification = {
      id: `NOTIF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerId,
      bookingId: bookingId || null,
      type,
      title: title || type.replace(/_/g, ' '),
      message,
      createdAt: new Date().toISOString(),
      read: false
    };

    this.data.notifications.push(notification);
    this.save();
    return notification;
  }

  getFarmerNotifications(farmerId) {
    if (!this.data.notifications) this.data.notifications = [];
    return this.data.notifications
      .filter(n => n.farmerId === farmerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  markNotificationAsRead(farmerId, notificationId) {
    if (!this.data.notifications) this.data.notifications = [];
    const notif = this.data.notifications.find(n => n.id === notificationId && n.farmerId === farmerId);
    if (!notif) {
      throw new Error("Notification not found or authorization failed.");
    }
    notif.read = true;
    this.save();
    return notif;
  }

  markAllNotificationsAsRead(farmerId) {
    if (!this.data.notifications) this.data.notifications = [];
    let count = 0;
    this.data.notifications.forEach(n => {
      if (n.farmerId === farmerId && !n.read) {
        n.read = true;
        count++;
      }
    });
    if (count > 0) {
      this.save();
    }
    return { success: true, count };
  }

  getFarmerUnreadCount(farmerId) {
    if (!this.data.notifications) this.data.notifications = [];
    return this.data.notifications.filter(n => n.farmerId === farmerId && !n.read).length;
  }

  // --- COMPLAINT & DISPUTE SYSTEM METHODS ---

  createComplaint({ farmerId, bookingId, category, description }) {
    if (!farmerId || !bookingId || !category || !description) {
      throw new Error("Farmer ID, Booking ID, Category, and Description are required.");
    }

    const farmer = this.getFarmerById(farmerId);
    if (!farmer) {
      throw new Error("Farmer not found.");
    }

    const booking = this.data.bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error("Booking record not found.");
    }

    // Farmer Ownership Enforcement
    if (booking.farmerId !== farmerId) {
      throw new Error("Authorization failed: You can only file complaints for your own procurement bookings.");
    }

    // Ensure procurement is completed
    if (booking.procurementStatus !== "Completed") {
      throw new Error("Complaints can only be filed for completed procurement transactions.");
    }

    const bill = this.getProcurementByBookingId(bookingId);

    // Prevent duplicate active complaint for the same booking
    if (!this.data.complaints) this.data.complaints = [];
    const existingActive = this.data.complaints.find(c => c.bookingId === bookingId && c.status !== 'Resolved' && c.status !== 'Rejected');
    if (existingActive) {
      throw new Error(`An active complaint (${existingActive.id}) is already under process for this procurement.`);
    }

    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `CMP-${todayStr}-${randomDigits}`;

    const newComplaint = {
      id: complaintId,
      bookingId,
      billId: bill ? bill.id : null,
      farmerId: farmer.id,
      farmerName: farmer.name,
      mobile: farmer.mobile,
      mandiId: booking.mandiId,
      mandiName: booking.mandiName,
      cropName: booking.cropName,
      tokenNumber: booking.tokenNumber,
      expectedQty: booking.expectedQty,
      actualQty: booking.actualQty,
      totalAmount: bill ? bill.totalAmount : 0,
      ratePerQuintal: bill ? bill.ratePerQuintal : null,
      paymentRef: bill ? bill.paymentRef : 'N/A',
      category: category.trim(),
      description: description.trim(),
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseComment: '',
      lastUpdatedBy: 'Farmer (Submitted)',
      statusHistory: [
        {
          status: 'Submitted',
          updatedBy: farmer.name,
          responseComment: 'Complaint submitted by farmer.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.data.complaints.push(newComplaint);

    this.addNotification({
      farmerId: farmer.id,
      bookingId,
      type: "COMPLAINT_CREATED",
      title: "Complaint Filed Successfully",
      message: `Complaint ${complaintId} regarding ${category} has been submitted for ${booking.mandiName}.`
    });

    this.save();
    return newComplaint;
  }

  getFarmerComplaints(farmerId) {
    if (!this.data.complaints) this.data.complaints = [];
    return this.data.complaints
      .filter(c => c.farmerId === farmerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getMandiComplaints(mandiId, { status, category } = {}) {
    if (!this.data.complaints) this.data.complaints = [];
    let list = this.data.complaints.filter(c => c.mandiId === mandiId);

    if (status && status !== 'ALL') {
      list = list.filter(c => c.status === status);
    }
    if (category && category !== 'ALL') {
      list = list.filter(c => c.category === category);
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getAllComplaints({ mandiId, status, category, date } = {}) {
    if (!this.data.complaints) this.data.complaints = [];
    let list = [...this.data.complaints];

    if (mandiId && mandiId !== 'ALL') {
      list = list.filter(c => c.mandiId === mandiId);
    }
    if (status && status !== 'ALL') {
      list = list.filter(c => c.status === status);
    }
    if (category && category !== 'ALL') {
      list = list.filter(c => c.category === category);
    }
    if (date) {
      list = list.filter(c => c.createdAt.startsWith(date));
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  updateComplaintStatus({ complaintId, updatedBy, role, mandiId, newStatus, responseComment }) {
    if (!this.data.complaints) this.data.complaints = [];

    const complaint = this.data.complaints.find(c => c.id === complaintId);
    if (!complaint) {
      throw new Error("Complaint record not found.");
    }

    // Mandi Isolation Check for Mandi Officers
    if (role === 'MANDI_OFFICER' && complaint.mandiId !== mandiId) {
      throw new Error("Authorization failed: Mandi officers can only resolve complaints belonging to their assigned Mandi.");
    }

    const validStatuses = ['Submitted', 'Under Review', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status '${newStatus}'. Allowed statuses: ${validStatuses.join(', ')}.`);
    }

    complaint.status = newStatus;
    complaint.updatedAt = new Date().toISOString();
    complaint.responseComment = responseComment ? responseComment.trim() : complaint.responseComment;
    complaint.lastUpdatedBy = updatedBy || (role === 'ADMIN' ? 'System Admin' : 'Mandi Officer');

    complaint.statusHistory.push({
      status: newStatus,
      updatedBy: complaint.lastUpdatedBy,
      responseComment: responseComment ? responseComment.trim() : '',
      timestamp: new Date().toISOString()
    });

    this.addNotification({
      farmerId: complaint.farmerId,
      bookingId: complaint.bookingId,
      type: "COMPLAINT_UPDATED",
      title: `Complaint Status: ${newStatus}`,
      message: `Your complaint (${complaint.id}) status has been updated to '${newStatus}'. Note: ${responseComment || 'No additional note'}`
    });

    this.save();
    return complaint;
  }
}

export const db = new Database();
