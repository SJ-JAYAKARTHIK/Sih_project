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
  dailyReports: []
};

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
}

class Database {
  constructor() {
    this.data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
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

    const existingBookings = this.data.bookings.filter(b => b.mandiId === mandiId && b.date === dateStr);

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

    // Capacity validation
    const existing = this.data.bookings.filter(b => b.mandiId === mandiId && b.date === date && b.timeSlot === timeSlot);
    if (existing.length >= 2) {
      throw new Error("This 30-minute time slot is already fully booked. Please select another slot.");
    }

    // Duplicate farmer booking on same date
    const farmerExisting = this.data.bookings.find(b => b.farmerId === farmerId && b.date === date);
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

    const bookingId = `BK-${Date.now()}`;
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
      source: bookingReq.source || "WEB",
      createdAt: new Date().toISOString()
    };

    this.data.bookings.push(newBooking);
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

    booking.arrivalStatus = "Verified / Arrived";
    this.save();
    return { booking, message: "✅ Farmer Verified / Arrived Successfully!" };
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
    this.save();

    return { booking, bill: billRecord };
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
      return {
        ...b,
        billedBy: bill ? bill.billedBy : null,
        pricePaid: bill ? bill.totalAmount : 0,
        ratePerQuintal: bill ? bill.ratePerQuintal : null,
        paymentRef: bill ? bill.paymentRef : null
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
}

export const db = new Database();
