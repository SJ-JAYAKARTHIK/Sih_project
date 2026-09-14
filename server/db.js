import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Load environment variables from .env.local (and fallback to default .env)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fojdhgbrsvmokiljacup.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_D3f_-VWcFiEhezHXVAxicg_076PkuLd';

export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialData = {
  farmers: [
    {
      id: "10029002",
      name: "Lakshmi Narasimha",
      mobile: "9123456789",
      password: "password123",
      language: "TE",
      location: "Nizamabad, Telangana",
      bankDetails: "HDFC Bank — Account ****9102 (IFSC: HDFC0001029)"
    },
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
      acceptedCrops: ["crop-1", "crop-3", "crop-4"],
      password: "123456"
    },
    {
      id: "MANDI02",
      name: "Nizamabad APMC Mandi",
      location: "Market Yard, Nizamabad, Telangana",
      acceptedCrops: ["crop-1", "crop-2", "crop-5"],
      password: "123456"
    },
    {
      id: "MANDI03",
      name: "Guntur Grain Yard",
      location: "Guntur Central, Andhra Pradesh",
      acceptedCrops: ["crop-3", "crop-5", "crop-6"],
      password: "123456"
    },
    {
      id: "MANDI04",
      name: "Khammam Procurement Yard",
      location: "Wyra Road, Khammam, Telangana",
      acceptedCrops: ["crop-1", "crop-2", "crop-4", "crop-6"],
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

// --- MAPPER HELPERS (SUPABASE ROW -> EXACT JS OBJECT SHAPE) ---
function mapFarmer(f) {
  if (!f) return null;
  return {
    id: String(f.id),
    name: f.name,
    mobile: f.mobile,
    password: f.password,
    language: f.language || 'EN',
    location: f.location || 'State Agriculture Division',
    bankDetails: f.bank_details || 'Bank Account **** (IFSC: SBIN0001234)'
  };
}

function mapMandi(m) {
  if (!m) return null;
  const acceptedCrops = Array.isArray(m.mandi_accepted_crops)
    ? m.mandi_accepted_crops.map(ac => ac.crop_id)
    : (Array.isArray(m.acceptedCrops) ? m.acceptedCrops : []);
  return {
    id: String(m.id),
    name: m.name,
    location: m.location,
    acceptedCrops,
    password: m.password || '123456'
  };
}

function mapCrop(c) {
  if (!c) return null;
  return {
    id: String(c.id),
    name: c.name,
    ratePerQuintal: parseFloat(c.rate_per_quintal || c.ratePerQuintal || 0),
    icon: c.icon || '🌾'
  };
}

function mapBooking(b) {
  if (!b) return null;
  return {
    id: String(b.id),
    tokenNumber: b.token_number || b.tokenNumber,
    qrPayload: typeof b.qr_payload === 'string' ? b.qr_payload : (typeof b.qrPayload === 'string' ? b.qrPayload : JSON.stringify(b.qr_payload || b.qrPayload || {})),
    farmerId: String(b.farmer_id || b.farmerId),
    farmerName: b.farmer_name || b.farmerName,
    mobile: b.mobile,
    mandiId: String(b.mandi_id || b.mandiId),
    mandiName: b.mandi_name || b.mandiName,
    cropId: String(b.crop_id || b.cropId),
    cropName: b.crop_name || b.cropName,
    date: b.date,
    timeSlot: b.time_slot || b.timeSlot,
    expectedQty: b.expected_qty !== null && b.expected_qty !== undefined ? parseFloat(b.expected_qty) : (b.expectedQty !== null && b.expectedQty !== undefined ? parseFloat(b.expectedQty) : null),
    actualQty: b.actual_qty !== null && b.actual_qty !== undefined ? parseFloat(b.actual_qty) : (b.actualQty !== null && b.actualQty !== undefined ? parseFloat(b.actualQty) : null),
    arrivalStatus: b.arrival_status || b.arrivalStatus || 'Pending',
    procurementStatus: b.procurement_status || b.procurementStatus || 'Pending',
    paymentStatus: b.payment_status || b.paymentStatus || 'Pending',
    bookingStatus: b.booking_status || b.bookingStatus || 'ACTIVE',
    procurementStage: b.procurement_stage || b.procurementStage || 'NOT_ARRIVED',
    source: b.source || 'WEB',
    arrivedAt: b.arrived_at || b.arrivedAt || null,
    procurementStartedAt: b.procurement_started_at || b.procurementStartedAt || null,
    procurementCompletedAt: b.procurement_completed_at || b.procurementCompletedAt || null,
    createdAt: b.created_at || b.createdAt || new Date().toISOString()
  };
}

function mapProcurement(p) {
  if (!p) return null;
  return {
    id: String(p.id),
    bookingId: String(p.booking_id || p.bookingId),
    tokenNumber: p.token_number || p.tokenNumber,
    farmerId: String(p.farmer_id || p.farmerId),
    farmerName: p.farmer_name || p.farmerName,
    mobile: p.mobile,
    mandiId: String(p.mandi_id || p.mandiId),
    mandiName: p.mandi_name || p.mandiName,
    cropName: p.crop_name || p.cropName,
    date: p.date,
    timeSlot: p.time_slot || p.timeSlot,
    expectedQty: p.expected_qty !== null && p.expected_qty !== undefined ? parseFloat(p.expected_qty) : (p.expectedQty !== null && p.expectedQty !== undefined ? parseFloat(p.expectedQty) : null),
    actualQty: parseFloat(p.actual_qty || p.actualQty || 0),
    ratePerQuintal: parseFloat(p.rate_per_quintal || p.ratePerQuintal || 0),
    totalAmount: parseFloat(p.total_amount || p.totalAmount || 0),
    billedBy: p.billed_by || p.billedBy,
    paymentRef: p.payment_ref || p.paymentRef,
    paymentStatus: p.payment_status || p.paymentStatus || 'Completed',
    createdTimestamp: p.created_timestamp || p.createdTimestamp || new Date().toISOString()
  };
}

function mapNotification(n) {
  if (!n) return null;
  return {
    id: String(n.id),
    farmerId: String(n.farmer_id || n.farmerId),
    bookingId: n.booking_id || n.bookingId || null,
    type: n.type,
    title: n.title,
    message: n.message,
    read: Boolean(n.read),
    createdAt: n.created_at || n.createdAt || new Date().toISOString()
  };
}

function mapComplaint(c) {
  if (!c) return null;
  return {
    id: String(c.id),
    bookingId: String(c.booking_id || c.bookingId),
    billId: c.bill_id || c.billId || null,
    farmerId: String(c.farmer_id || c.farmerId),
    farmerName: c.farmer_name || c.farmerName,
    mobile: c.mobile,
    mandiId: String(c.mandi_id || c.mandiId),
    mandiName: c.mandi_name || c.mandiName,
    cropName: c.crop_name || c.cropName,
    tokenNumber: c.token_number || c.tokenNumber,
    expectedQty: c.expected_qty !== null && c.expected_qty !== undefined ? parseFloat(c.expected_qty) : (c.expectedQty !== null && c.expectedQty !== undefined ? parseFloat(c.expectedQty) : null),
    actualQty: c.actual_qty !== null && c.actual_qty !== undefined ? parseFloat(c.actual_qty) : (c.actualQty !== null && c.actualQty !== undefined ? parseFloat(c.actualQty) : null),
    totalAmount: parseFloat(c.total_amount || c.totalAmount || 0),
    ratePerQuintal: c.rate_per_quintal !== null && c.rate_per_quintal !== undefined ? parseFloat(c.rate_per_quintal) : (c.ratePerQuintal !== null && c.ratePerQuintal !== undefined ? parseFloat(c.ratePerQuintal) : null),
    paymentRef: c.payment_ref || c.paymentRef || 'N/A',
    category: c.category,
    description: c.description,
    status: c.status,
    responseComment: c.response_comment || c.responseComment || '',
    lastUpdatedBy: c.last_updated_by || c.lastUpdatedBy || 'Farmer (Submitted)',
    statusHistory: c.status_history || c.statusHistory || [],
    createdAt: c.created_at || c.createdAt || new Date().toISOString(),
    updatedAt: c.updated_at || c.updatedAt || new Date().toISOString()
  };
}

function mapDailyReport(r) {
  if (!r) return null;
  return {
    id: String(r.id),
    mandiId: String(r.mandi_id || r.mandiId),
    mandiName: r.mandi_name || r.mandiName,
    date: r.date,
    totalBooked: r.total_booked !== undefined ? r.total_booked : r.totalBooked,
    totalVerified: r.total_verified !== undefined ? r.total_verified : r.totalVerified,
    totalPending: r.total_pending !== undefined ? r.total_pending : r.totalPending,
    totalCompleted: r.total_completed !== undefined ? r.total_completed : r.totalCompleted,
    totalQty: parseFloat(r.total_qty || r.totalQty || 0),
    totalPayment: parseFloat(r.total_payment || r.totalPayment || 0),
    submittedAt: r.submitted_at || r.submittedAt || new Date().toISOString()
  };
}

class Database {
  constructor() {
    this._supabaseOverride = undefined;
    this.data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    if (!this.data.notifications) this.data.notifications = [];
    if (!this.data.complaints) this.data.complaints = [];
    this.ensureTodaySeedData();
  }

  get supabase() {
    return this._supabaseOverride !== undefined ? this._supabaseOverride : supabase;
  }

  set supabase(val) {
    this._supabaseOverride = val;
  }

  save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  async asyncSupabaseSync(table, operation, data, matchField = 'id') {
    if (!supabase) return;
    try {
      if (operation === 'insert' || operation === 'upsert') {
        await supabase.from(table).upsert(data);
      } else if (operation === 'update') {
        await supabase.from(table).update(data).eq(matchField, data[matchField]);
      } else if (operation === 'delete') {
        await supabase.from(table).delete().eq(matchField, data[matchField]);
      }
    } catch (err) {
      console.warn(`⚠️ [SUPABASE SYNC WARNING] ${table} ${operation} fallback:`, err.message);
    }
  }

  // --- READ-ONLY PHASE 1 SUPABASE PRIMARY FUNCTIONS WITH LOCAL JSON FALLBACK ---

  async getFarmers() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('farmers').select('*');
        if (!error && Array.isArray(data)) {
          return data.map(mapFarmer);
        }
        console.warn('⚠️ [SUPABASE READ WARNING] getFarmers fallback to local JSON:', error?.message);
      } catch (err) {
        console.warn('⚠️ [SUPABASE READ EXCEPTION] getFarmers fallback to local JSON:', err.message);
      }
    }
    return this.data.farmers;
  }

  async getFarmerById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('farmers').select('*').eq('id', String(id)).single();
        if (!error && data) {
          return mapFarmer(data);
        }
        if (error && error.code !== 'PGRST116') {
          console.warn(`⚠️ [SUPABASE READ WARNING] getFarmerById(${id}) fallback to local JSON:`, error?.message);
        } else if (!data && !error) {
          return null;
        }
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getFarmerById(${id}) fallback to local JSON:`, err.message);
      }
    }
    return this.data.farmers.find(f => f.id === String(id)) || null;
  }

  async getMandis() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('mandis').select('*, mandi_accepted_crops(crop_id)');
        if (!error && Array.isArray(data)) {
          return data.map(mapMandi);
        }
        console.warn('⚠️ [SUPABASE READ WARNING] getMandis fallback to local JSON:', error?.message);
      } catch (err) {
        console.warn('⚠️ [SUPABASE READ EXCEPTION] getMandis fallback to local JSON:', err.message);
      }
    }
    return this.data.mandis;
  }

  async getMandiById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('mandis').select('*, mandi_accepted_crops(crop_id)').eq('id', String(id)).single();
        if (!error && data) {
          return mapMandi(data);
        }
        if (error && error.code !== 'PGRST116') {
          console.warn(`⚠️ [SUPABASE READ WARNING] getMandiById(${id}) fallback to local JSON:`, error?.message);
        } else if (!data && !error) {
          return null;
        }
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getMandiById(${id}) fallback to local JSON:`, err.message);
      }
    }
    return this.data.mandis.find(m => m.id === String(id)) || null;
  }

  async getCrops() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('crops').select('*');
        if (!error && Array.isArray(data)) {
          return data.map(mapCrop);
        }
        console.warn('⚠️ [SUPABASE READ WARNING] getCrops fallback to local JSON:', error?.message);
      } catch (err) {
        console.warn('⚠️ [SUPABASE READ EXCEPTION] getCrops fallback to local JSON:', err.message);
      }
    }
    return this.data.crops;
  }

  async getCropById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('crops').select('*').eq('id', String(id)).single();
        if (!error && data) {
          return mapCrop(data);
        }
        if (error && error.code !== 'PGRST116') {
          console.warn(`⚠️ [SUPABASE READ WARNING] getCropById(${id}) fallback to local JSON:`, error?.message);
        } else if (!data && !error) {
          return null;
        }
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getCropById(${id}) fallback to local JSON:`, err.message);
      }
    }
    return this.data.crops.find(c => c.id === String(id)) || null;
  }

  async getFarmerBookings(farmerId) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bookings').select('*').eq('farmer_id', String(farmerId)).order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map(mapBooking);
        }
        console.warn(`⚠️ [SUPABASE READ WARNING] getFarmerBookings(${farmerId}) fallback to local JSON:`, error?.message);
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getFarmerBookings(${farmerId}) fallback to local JSON:`, err.message);
      }
    }
    return this.data.bookings.filter(b => b.farmerId === String(farmerId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getMandiBookings(mandiId, dateStr) {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bookings').select('*').eq('mandi_id', String(mandiId)).eq('date', targetDate);
        if (!error && Array.isArray(data)) {
          return data.map(mapBooking);
        }
        console.warn(`⚠️ [SUPABASE READ WARNING] getMandiBookings(${mandiId}, ${targetDate}) fallback to local JSON:`, error?.message);
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getMandiBookings(${mandiId}, ${targetDate}) fallback to local JSON:`, err.message);
      }
    }
    return this.data.bookings.filter(b => b.mandiId === String(mandiId) && b.date === targetDate);
  }

  async getProcurementByBookingId(bookingId) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('procurements').select('*').eq('booking_id', String(bookingId)).single();
        if (!error && data) {
          return mapProcurement(data);
        }
        if (error && error.code !== 'PGRST116') {
          console.warn(`⚠️ [SUPABASE READ WARNING] getProcurementByBookingId(${bookingId}) fallback to local JSON:`, error?.message);
        } else if (!data && !error) {
          return null;
        }
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getProcurementByBookingId(${bookingId}) fallback to local JSON:`, err.message);
      }
    }
    return this.data.procurements.find(p => p.bookingId === String(bookingId)) || null;
  }

  async getFarmerBills(farmerId) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('procurements').select('*').eq('farmer_id', String(farmerId)).order('created_timestamp', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map(mapProcurement);
        }
        console.warn(`⚠️ [SUPABASE READ WARNING] getFarmerBills(${farmerId}) fallback to local JSON:`, error?.message);
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getFarmerBills(${farmerId}) fallback to local JSON:`, err.message);
      }
    }
    return this.data.procurements.filter(p => p.farmerId === String(farmerId)).sort((a, b) => new Date(b.createdTimestamp) - new Date(a.createdTimestamp));
  }

  async getFarmerNotifications(farmerId) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('notifications').select('*').eq('farmer_id', String(farmerId)).order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map(mapNotification);
        }
        console.warn(`⚠️ [SUPABASE READ WARNING] getFarmerNotifications(${farmerId}) fallback to local JSON:`, error?.message);
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getFarmerNotifications(${farmerId}) fallback to local JSON:`, err.message);
      }
    }
    if (!this.data.notifications) this.data.notifications = [];
    return this.data.notifications
      .filter(n => n.farmerId === String(farmerId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getFarmerUnreadCount(farmerId) {
    if (supabase) {
      try {
        const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('farmer_id', String(farmerId)).eq('read', false);
        if (!error && typeof count === 'number') {
          return count;
        }
        console.warn(`⚠️ [SUPABASE READ WARNING] getFarmerUnreadCount(${farmerId}) fallback to local JSON:`, error?.message);
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getFarmerUnreadCount(${farmerId}) fallback to local JSON:`, err.message);
      }
    }
    if (!this.data.notifications) this.data.notifications = [];
    return this.data.notifications.filter(n => n.farmerId === String(farmerId) && !n.read).length;
  }

  async getFarmerComplaints(farmerId) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('complaints').select('*').eq('farmer_id', String(farmerId)).order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map(mapComplaint);
        }
        console.warn(`⚠️ [SUPABASE READ WARNING] getFarmerComplaints(${farmerId}) fallback to local JSON:`, error?.message);
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getFarmerComplaints(${farmerId}) fallback to local JSON:`, err.message);
      }
    }
    if (!this.data.complaints) this.data.complaints = [];
    return this.data.complaints
      .filter(c => c.farmerId === String(farmerId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getMandiComplaints(mandiId, { status, category } = {}) {
    if (supabase) {
      try {
        let query = supabase.from('complaints').select('*').eq('mandi_id', String(mandiId));
        if (status && status !== 'ALL') query = query.eq('status', status);
        if (category && category !== 'ALL') query = query.eq('category', category);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map(mapComplaint);
        }
        console.warn(`⚠️ [SUPABASE READ WARNING] getMandiComplaints(${mandiId}) fallback to local JSON:`, error?.message);
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getMandiComplaints(${mandiId}) fallback to local JSON:`, err.message);
      }
    }
    if (!this.data.complaints) this.data.complaints = [];
    let list = this.data.complaints.filter(c => c.mandiId === String(mandiId));
    if (status && status !== 'ALL') list = list.filter(c => c.status === status);
    if (category && category !== 'ALL') list = list.filter(c => c.category === category);
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getAllComplaints({ mandiId, status, category, date } = {}) {
    if (supabase) {
      try {
        let query = supabase.from('complaints').select('*');
        if (mandiId && mandiId !== 'ALL') query = query.eq('mandi_id', String(mandiId));
        if (status && status !== 'ALL') query = query.eq('status', status);
        if (category && category !== 'ALL') query = query.eq('category', category);
        if (date) query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map(mapComplaint);
        }
        console.warn('⚠️ [SUPABASE READ WARNING] getAllComplaints fallback to local JSON:', error?.message);
      } catch (err) {
        console.warn('⚠️ [SUPABASE READ EXCEPTION] getAllComplaints fallback to local JSON:', err.message);
      }
    }
    if (!this.data.complaints) this.data.complaints = [];
    let list = [...this.data.complaints];
    if (mandiId && mandiId !== 'ALL') list = list.filter(c => c.mandiId === String(mandiId));
    if (status && status !== 'ALL') list = list.filter(c => c.status === status);
    if (category && category !== 'ALL') list = list.filter(c => c.category === category);
    if (date) list = list.filter(c => c.createdAt.startsWith(date));
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getAllDailyReports({ mandiId, startDate, endDate } = {}) {
    if (supabase) {
      try {
        let query = supabase.from('daily_reports').select('*');
        if (mandiId) query = query.eq('mandi_id', String(mandiId));
        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);
        const { data, error } = await query.order('date', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map(mapDailyReport);
        }
        console.warn('⚠️ [SUPABASE READ WARNING] getAllDailyReports fallback to local JSON:', error?.message);
      } catch (err) {
        console.warn('⚠️ [SUPABASE READ EXCEPTION] getAllDailyReports fallback to local JSON:', err.message);
      }
    }
    let reports = [...this.data.dailyReports];
    if (mandiId) reports = reports.filter(r => r.mandiId === String(mandiId));
    if (startDate) reports = reports.filter(r => r.date >= startDate);
    if (endDate) reports = reports.filter(r => r.date <= endDate);
    return reports.sort((a, b) => b.date.localeCompare(a.date));
  }

  // --- PHASE 2: SUPABASE AUTHORITATIVE CONCURRENCY-SAFE MUTATIONS ---

  async addFarmer(farmerData) {
    if (!supabase) {
      throw new Error("Supabase database connection unavailable. Cannot create farmer.");
    }

    const supabaseObj = {
      id: String(farmerData.id),
      name: farmerData.name,
      mobile: farmerData.mobile,
      password: farmerData.password,
      language: farmerData.language || 'EN',
      location: farmerData.location || 'State Agriculture Division',
      bank_details: farmerData.bankDetails || 'Bank Account **** (IFSC: SBIN0001234)'
    };

    const { data: inserted, error } = await supabase.from('farmers').insert([supabaseObj]).select();
    if (error || !inserted || inserted.length === 0) {
      throw new Error(`Farmer creation failed in database: ${error?.message || 'Unknown error'}`);
    }

    const created = mapFarmer(inserted[0]);
    this.data.farmers.push(created);
    this.save();
    return created;
  }

  async updateFarmerProfile(farmerId, updateData) {
    if (!supabase) {
      throw new Error("Supabase database connection unavailable. Cannot update farmer profile.");
    }
    const farmer = await this.getFarmerById(farmerId);
    if (!farmer) {
      throw new Error("Farmer record not found.");
    }

    const supabaseUpdate = {};
    if (updateData.name) supabaseUpdate.name = updateData.name.trim();
    if (updateData.mobile) supabaseUpdate.mobile = updateData.mobile.trim();
    if (updateData.location) supabaseUpdate.location = updateData.location.trim();
    if (updateData.bankDetails) supabaseUpdate.bank_details = updateData.bankDetails.trim();
    if (updateData.language) supabaseUpdate.language = updateData.language;

    const { data: updated, error } = await supabase
      .from('farmers')
      .update(supabaseUpdate)
      .eq('id', String(farmerId))
      .select();

    if (error || !updated || updated.length === 0) {
      throw new Error(`Farmer profile update failed in database: ${error?.message || 'Unknown error'}`);
    }

    const result = mapFarmer(updated[0]);

    // Update local memory cache
    const localFarmer = this.data.farmers.find(f => f.id === String(farmerId));
    if (localFarmer) {
      if (updateData.name) localFarmer.name = updateData.name.trim();
      if (updateData.mobile) localFarmer.mobile = updateData.mobile.trim();
      if (updateData.location) localFarmer.location = updateData.location.trim();
      if (updateData.bankDetails) localFarmer.bankDetails = updateData.bankDetails.trim();
      if (updateData.language) localFarmer.language = updateData.language;
      this.save();
    }

    return result;
  }

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
          expectedQty: 50,
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

  async getDateAvailability(mandiId, cropId) {
    if (this.supabase) {
      try {
        const dates = [];
        const today = new Date();
        const MAX_CAPACITY_PER_DAY = 20;
        const startDate = today.toISOString().split('T')[0];
        const endDay = new Date(today);
        endDay.setDate(today.getDate() + 30);
        const endDate = endDay.toISOString().split('T')[0];

        const { data: bRows, error } = await this.supabase
          .from('bookings')
          .select('date')
          .eq('mandi_id', String(mandiId))
          .gte('date', startDate)
          .lte('date', endDate)
          .eq('booking_status', 'ACTIVE');

        if (!error && Array.isArray(bRows)) {
          const countByDate = {};
          bRows.forEach(b => {
            if (b.date) {
              countByDate[b.date] = (countByDate[b.date] || 0) + 1;
            }
          });

          for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];

            const bookedCount = countByDate[dateStr] || 0;
            const remaining = MAX_CAPACITY_PER_DAY - bookedCount;

            let status = "Green";
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
        console.warn("⚠️ Supabase getDateAvailability query failed. Using local fallback.");
      } catch (err) {
        console.warn("⚠️ Supabase getDateAvailability error. Using local fallback:", err.message);
      }
    }

    // Local JSON Fallback
    const dates = [];
    const today = new Date();
    const MAX_CAPACITY_PER_DAY = 20;

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const bookedCount = this.data.bookings.filter(b => b.mandiId === mandiId && b.date === dateStr).length;
      const remaining = MAX_CAPACITY_PER_DAY - bookedCount;

      let status = "Green";
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

  async getTimeSlots(mandiId, dateStr) {
    const slotsList = [
      "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00",
      "11:00 - 11:30", "11:30 - 12:00", "12:00 - 12:30", "12:30 - 13:00",
      "14:00 - 14:30", "14:30 - 15:00", "15:00 - 15:30", "15:30 - 16:00"
    ];
    const MAX_PER_TIME_SLOT = 2;

    if (this.supabase) {
      try {
        const { data: bRows, error } = await this.supabase
          .from('bookings')
          .select('time_slot')
          .eq('mandi_id', String(mandiId))
          .eq('date', dateStr)
          .eq('booking_status', 'ACTIVE');

        if (!error && Array.isArray(bRows)) {
          const countBySlot = {};
          bRows.forEach(b => {
            if (b.time_slot) {
              countBySlot[b.time_slot] = (countBySlot[b.time_slot] || 0) + 1;
            }
          });

          return slotsList.map(slotTime => {
            const count = countBySlot[slotTime] || 0;
            const isFull = count >= MAX_PER_TIME_SLOT;

            return {
              time: slotTime,
              bookedCount: count,
              maxCapacity: MAX_PER_TIME_SLOT,
              isAvailable: !isFull
            };
          });
        }
        console.warn("⚠️ Supabase getTimeSlots query failed. Using local fallback.");
      } catch (err) {
        console.warn("⚠️ Supabase getTimeSlots error. Using local fallback:", err.message);
      }
    }

    // Local JSON Fallback
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

  async createBooking(bookingReq) {
    if (!this.supabase) {
      throw new Error("Supabase database connection unavailable. Critical booking creation failed.");
    }
    const { farmerId, mandiId, cropId, date, timeSlot, expectedQty } = bookingReq;

    const farmer = await this.getFarmerById(farmerId);
    const mandi = await this.getMandiById(mandiId);
    const crop = await this.getCropById(cropId);

    if (!farmer || !mandi || !crop) {
      throw new Error("Invalid Farmer, Mandi, or Crop selection.");
    }

    // Check slot capacity using CURRENT Supabase data
    const { data: slotBookings, error: slotErr } = await this.supabase
      .from('bookings')
      .select('id')
      .eq('mandi_id', String(mandiId))
      .eq('date', date)
      .eq('time_slot', timeSlot)
      .eq('booking_status', 'ACTIVE');

    if (slotErr) {
      throw new Error(`Database error checking slot availability: ${slotErr.message}`);
    }

    if (Array.isArray(slotBookings) && slotBookings.length >= 2) {
      throw new Error("This 30-minute time slot is already fully booked. Please select another slot.");
    }

    // Check duplicate active booking for farmer on same date using CURRENT Supabase data
    const { data: farmerActiveBookings, error: farmerErr } = await this.supabase
      .from('bookings')
      .select('id')
      .eq('farmer_id', String(farmerId))
      .eq('date', date)
      .eq('booking_status', 'ACTIVE')
      .neq('procurement_status', 'Completed');

    if (farmerErr) {
      throw new Error(`Database error checking active bookings: ${farmerErr.message}`);
    }

    if (Array.isArray(farmerActiveBookings) && farmerActiveBookings.length > 0) {
      throw new Error("You already have an active procurement booking on this date.");
    }

    let randomNum;
    let tokenNumber;
    let tokenExists = true;
    do {
      randomNum = Math.floor(100000 + Math.random() * 900000);
      tokenNumber = `TKN-${randomNum}`;
      const { data: tokCheck } = await this.supabase.from('bookings').select('id').eq('token_number', tokenNumber);
      if (!tokCheck || tokCheck.length === 0) tokenExists = false;
    } while (tokenExists);

    const bookingId = `BK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrPayloadObj = {
      bookingId,
      tokenNumber,
      farmerId: farmer.id,
      farmerName: farmer.name,
      mandiId: mandi.id,
      mandiName: mandi.name,
      cropName: crop.name,
      date,
      timeSlot
    };
    const qrPayload = JSON.stringify(qrPayloadObj);

    const supabaseBookingObj = {
      id: bookingId,
      token_number: tokenNumber,
      qr_payload: qrPayloadObj,
      farmer_id: farmer.id,
      farmer_name: farmer.name,
      mobile: farmer.mobile,
      mandi_id: mandi.id,
      mandi_name: mandi.name,
      crop_id: crop.id,
      crop_name: crop.name,
      date,
      time_slot: timeSlot,
      expected_qty: expectedQty ? parseFloat(expectedQty) : null,
      actual_qty: null,
      arrival_status: "Pending",
      procurement_status: "Pending",
      payment_status: "Pending",
      booking_status: "ACTIVE",
      procurement_stage: "NOT_ARRIVED",
      source: bookingReq.source || "WEB",
      created_at: new Date().toISOString()
    };

    // Insert directly into Supabase
    const { data: inserted, error: insertErr } = await supabase.from('bookings').insert([supabaseBookingObj]).select();
    if (insertErr || !inserted || inserted.length === 0) {
      throw new Error(`Booking creation failed in Supabase: ${insertErr?.message || 'Unknown database error'}`);
    }

    const newBooking = mapBooking(inserted[0]);

    // Update local cache ONLY after successful Supabase insertion
    this.data.bookings.push(newBooking);

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

  async verifyArrival(mandiId, { qrData, tokenNumber }) {
    if (!this.supabase) {
      throw new Error("Supabase database connection unavailable. Critical arrival verification failed.");
    }
    const todayStr = new Date().toISOString().split('T')[0];
    let targetBookingId = null;
    let targetToken = null;

    if (qrData) {
      try {
        const parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
        targetBookingId = parsed.bookingId || null;
        targetToken = parsed.tokenNumber || null;
      } catch (e) {
        targetToken = String(qrData).trim().toUpperCase();
      }
    } else if (tokenNumber) {
      targetToken = String(tokenNumber).trim().toUpperCase();
    }

    // Query Supabase for matching booking
    let query = this.supabase.from('bookings').select('*').eq('mandi_id', String(mandiId));
    if (targetBookingId) {
      query = query.eq('id', targetBookingId);
    } else if (targetToken) {
      query = query.eq('token_number', targetToken);
    } else {
      throw new Error("Invalid QR Code or Token Number.");
    }

    const { data: bData, error: bErr } = await query;
    if (bErr || !bData || bData.length === 0) {
      throw new Error("Invalid QR Code or Token Number. No matching booking found for this Mandi.");
    }

    const booking = bData[0];

    if (booking.date !== todayStr) {
      throw new Error(`Invalid verification: This booking is for ${booking.date}, not today (${todayStr}). Only today's bookings can be verified.`);
    }

    if (booking.arrival_status === "Verified / Arrived") {
      throw new Error("Duplicate verification rejected: Farmer has already been verified for arrival today.");
    }

    if ((booking.booking_status || 'ACTIVE') !== 'ACTIVE') {
      throw new Error(`Invalid verification: Booking status is ${booking.booking_status}.`);
    }

    const nowIso = new Date().toISOString();

    // Atomic conditional UPDATE in Supabase
    const { data: updated, error: updateErr } = await this.supabase
      .from('bookings')
      .update({
        arrival_status: "Verified / Arrived",
        procurement_stage: "WAITING",
        arrived_at: nowIso
      })
      .eq('id', booking.id)
      .eq('arrival_status', 'Pending')
      .eq('booking_status', 'ACTIVE')
      .select();

    if (updateErr || !updated || updated.length === 0) {
      throw new Error("Duplicate verification rejected: Arrival has already been verified or booking status changed.");
    }

    const updatedBookingObj = mapBooking(updated[0]);

    // Update local cache
    const localBk = this.data.bookings.find(b => b.id === booking.id);
    if (localBk) {
      localBk.arrivalStatus = "Verified / Arrived";
      localBk.procurementStage = "WAITING";
      localBk.arrivedAt = nowIso;
      this.save();
    }

    this.addNotification({
      farmerId: updatedBookingObj.farmerId,
      bookingId: updatedBookingObj.id,
      type: "ARRIVED_AT_MANDI",
      title: "Arrived at Mandi",
      message: `Gate arrival verified for Token ${updatedBookingObj.tokenNumber} at ${updatedBookingObj.mandiName}. You are now in the active waiting queue.`
    });

    return { booking: updatedBookingObj, message: "✅ Farmer Verified / Arrived Successfully!" };
  }

  async startProcurement(mandiId, bookingId) {
    if (!this.supabase) {
      throw new Error("Supabase database connection unavailable. Critical start procurement failed.");
    }
    const { data: bData, error: bErr } = await this.supabase.from('bookings').select('*').eq('id', String(bookingId)).eq('mandi_id', String(mandiId)).single();
    if (bErr || !bData) {
      throw new Error("Booking not found for this Mandi.");
    }

    if ((bData.booking_status || 'ACTIVE') !== 'ACTIVE') {
      throw new Error(`Cannot start procurement for booking with status ${bData.booking_status}.`);
    }
    if (bData.arrival_status !== "Verified / Arrived") {
      throw new Error("Cannot start procurement: Farmer arrival has not been verified at the Mandi gate yet.");
    }
    if (bData.procurement_stage === "COMPLETED" || bData.procurement_status === "Completed") {
      throw new Error("Procurement is already completed for this booking.");
    }

    const nowIso = new Date().toISOString();

    const { data: updated, error: updateErr } = await this.supabase
      .from('bookings')
      .update({
        procurement_stage: "IN_PROGRESS",
        procurement_started_at: nowIso
      })
      .eq('id', String(bookingId))
      .eq('mandi_id', String(mandiId))
      .eq('arrival_status', 'Verified / Arrived')
      .eq('booking_status', 'ACTIVE')
      .neq('procurement_stage', 'IN_PROGRESS')
      .neq('procurement_stage', 'COMPLETED')
      .select();

    if (updateErr || !updated || updated.length === 0) {
      throw new Error("Cannot start procurement: Procurement is already in progress or completed by another officer.");
    }

    const updatedBooking = mapBooking(updated[0]);

    const localBk = this.data.bookings.find(b => b.id === String(bookingId));
    if (localBk) {
      localBk.procurementStage = "IN_PROGRESS";
      localBk.procurementStartedAt = nowIso;
      this.save();
    }

    this.addNotification({
      farmerId: updatedBooking.farmerId,
      bookingId: updatedBooking.id,
      type: "TURN_APPROACHING",
      title: "Your Turn! Procurement Started",
      message: `Mandi officer has called Token ${updatedBooking.tokenNumber}. Please proceed to weighing station for procurement.`
    });

    return updatedBooking;
  }

  async processProcurement(mandiId, { bookingId, actualQty, billedBy }) {
    if (!this.supabase) {
      throw new Error("Supabase database connection unavailable. Critical procurement processing failed.");
    }
    const { data: bData, error: bErr } = await this.supabase.from('bookings').select('*').eq('id', String(bookingId)).eq('mandi_id', String(mandiId)).single();
    if (bErr || !bData) {
      throw new Error("Booking record not found for this Mandi.");
    }

    if (bData.arrival_status !== "Verified / Arrived") {
      throw new Error("Cannot process procurement: Farmer arrival has not been verified at the Mandi gate yet. Verification is required before weighing and payment.");
    }

    if (bData.procurement_status === "Completed") {
      throw new Error("Procurement and payment have already been completed for this booking.");
    }

    // Check database uniqueness for procurement bill
    const { data: existingProc } = await this.supabase.from('procurements').select('id').eq('booking_id', String(bookingId));
    if (Array.isArray(existingProc) && existingProc.length > 0) {
      throw new Error("Duplicate procurement/billing rejected: A procurement bill already exists for this booking.");
    }

    if (!actualQty || isNaN(actualQty) || parseFloat(actualQty) <= 0) {
      throw new Error("Please enter a valid numeric Actual Quantity from weighing machine.");
    }

    if (!billedBy || billedBy.trim() === '') {
      throw new Error("Please select or enter the staff name for 'Billed By'.");
    }

    const crop = await this.getCropById(bData.crop_id);
    const qtyVal = parseFloat(actualQty);
    const ratePerQuintal = crop ? crop.ratePerQuintal : 2300;
    const totalAmount = Math.round(qtyVal * ratePerQuintal);
    const paymentRef = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const billId = `BILL-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const supabaseBillObj = {
      id: billId,
      booking_id: bData.id,
      token_number: bData.token_number,
      farmer_id: bData.farmer_id,
      farmer_name: bData.farmer_name,
      mobile: bData.mobile,
      mandi_id: bData.mandi_id,
      mandi_name: bData.mandi_name,
      crop_name: bData.crop_name,
      date: bData.date,
      time_slot: bData.time_slot,
      expected_qty: bData.expected_qty,
      actual_qty: qtyVal,
      rate_per_quintal: ratePerQuintal,
      total_amount: totalAmount,
      billed_by: billedBy.trim(),
      payment_ref: paymentRef,
      payment_status: "Completed",
      created_timestamp: nowIso
    };

    // Insert bill into Supabase (enforcing UNIQUE constraint on booking_id)
    const { data: insertedBill, error: procErr } = await this.supabase.from('procurements').insert([supabaseBillObj]).select();
    if (procErr || !insertedBill || insertedBill.length === 0) {
      throw new Error(`Duplicate procurement/billing rejected: ${procErr?.message || 'Bill generation failed'}`);
    }

    // Update booking status in Supabase
    const { data: updatedBooking } = await this.supabase
      .from('bookings')
      .update({
        actual_qty: qtyVal,
        procurement_status: "Completed",
        payment_status: "Completed",
        procurement_stage: "COMPLETED",
        procurement_completed_at: nowIso
      })
      .eq('id', bData.id)
      .select();

    const finalBill = mapProcurement(insertedBill[0]);
    const finalBooking = updatedBooking && updatedBooking.length > 0 ? mapBooking(updatedBooking[0]) : mapBooking(bData);

    // Update local cache
    const localBk = this.data.bookings.find(b => b.id === bData.id);
    if (localBk) {
      localBk.actualQty = qtyVal;
      localBk.procurementStatus = "Completed";
      localBk.paymentStatus = "Completed";
      localBk.procurementStage = "COMPLETED";
      localBk.procurementCompletedAt = nowIso;
    }
    this.data.procurements.push(finalBill);
    this.save();

    this.addNotification({
      farmerId: finalBooking.farmerId,
      bookingId: finalBooking.id,
      type: "PROCUREMENT_COMPLETED",
      title: "Procurement & Payment Completed",
      message: `Procurement of ${qtyVal} Quintals completed. Total Amount: ₹${totalAmount.toLocaleString('en-IN')}. Payment Ref: ${paymentRef}. Bill is generated.`
    });

    return { booking: finalBooking, bill: finalBill };
  }

  async cancelBooking(farmerId, bookingId) {
    if (!this.supabase) {
      throw new Error("Supabase database connection unavailable. Critical booking cancellation failed.");
    }
    const { data: bData, error: bErr } = await this.supabase.from('bookings').select('*').eq('id', String(bookingId)).single();
    if (bErr || !bData) {
      throw new Error("Booking record not found.");
    }
    if (bData.farmer_id !== String(farmerId)) {
      throw new Error("Authorization failed: You can only cancel your own bookings.");
    }

    // Conditional atomic update
    const { data: updated, error: updateErr } = await this.supabase
      .from('bookings')
      .update({
        booking_status: 'CANCELLED'
      })
      .eq('id', String(bookingId))
      .eq('farmer_id', String(farmerId))
      .eq('booking_status', 'ACTIVE')
      .neq('arrival_status', 'Verified / Arrived')
      .neq('procurement_stage', 'IN_PROGRESS')
      .neq('procurement_stage', 'COMPLETED')
      .select();

    if (updateErr || !updated || updated.length === 0) {
      throw new Error("Cannot cancel booking: Arrival has already been gate-verified or procurement/weighing has started.");
    }

    const cancelledBooking = mapBooking(updated[0]);

    const localBk = this.data.bookings.find(b => b.id === String(bookingId));
    if (localBk) {
      localBk.bookingStatus = 'CANCELLED';
      this.save();
    }

    this.addNotification({
      farmerId: cancelledBooking.farmerId,
      bookingId: cancelledBooking.id,
      type: "BOOKING_CANCELLED",
      title: "Booking Cancelled",
      message: `Your booking (Token: ${cancelledBooking.tokenNumber}) at ${cancelledBooking.mandiName} has been cancelled.`
    });

    return cancelledBooking;
  }

  async rescheduleBooking(farmerId, bookingId, newDate, newTimeSlot) {
    if (!this.supabase) {
      throw new Error("Supabase database connection unavailable. Critical booking rescheduling failed.");
    }
    const { data: bData, error: bErr } = await this.supabase.from('bookings').select('*').eq('id', String(bookingId)).single();
    if (bErr || !bData) {
      throw new Error("Booking record not found.");
    }
    if (bData.farmer_id !== String(farmerId)) {
      throw new Error("Authorization failed: You can only reschedule your own bookings.");
    }
    if (!newDate || !newTimeSlot) {
      throw new Error("New date and time slot are required for rescheduling.");
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (newDate < todayStr) {
      throw new Error("Cannot reschedule to a past date.");
    }

    const mandi = await this.getMandiById(bData.mandi_id);
    if (mandi && Array.isArray(mandi.acceptedCrops) && !mandi.acceptedCrops.includes(bData.crop_id)) {
      throw new Error(`This Mandi does not accept the selected crop (${bData.crop_name}).`);
    }

    // Check slot capacity on target date in Supabase
    const { data: slotActive } = await this.supabase
      .from('bookings')
      .select('id')
      .eq('mandi_id', bData.mandi_id)
      .eq('date', newDate)
      .eq('time_slot', newTimeSlot)
      .eq('booking_status', 'ACTIVE')
      .neq('id', String(bookingId))
      .neq('procurement_status', 'Completed');

    if (Array.isArray(slotActive) && slotActive.length >= 2) {
      throw new Error("The selected time slot is fully booked on the target date. Please choose another slot.");
    }

    const qrPayloadObj = {
      bookingId: bData.id,
      tokenNumber: bData.token_number,
      farmerId: bData.farmer_id,
      farmerName: bData.farmer_name,
      mandiId: bData.mandi_id,
      mandiName: bData.mandi_name,
      cropName: bData.crop_name,
      date: newDate,
      timeSlot: newTimeSlot
    };

    const { data: updated, error: updateErr } = await this.supabase
      .from('bookings')
      .update({
        date: newDate,
        time_slot: newTimeSlot,
        arrival_status: 'Pending',
        procurement_stage: 'NOT_ARRIVED',
        arrived_at: null,
        procurement_started_at: null,
        procurement_completed_at: null,
        qr_payload: qrPayloadObj
      })
      .eq('id', String(bookingId))
      .eq('farmer_id', String(farmerId))
      .eq('booking_status', 'ACTIVE')
      .neq('arrival_status', 'Verified / Arrived')
      .neq('procurement_stage', 'IN_PROGRESS')
      .neq('procurement_stage', 'COMPLETED')
      .select();

    if (updateErr || !updated || updated.length === 0) {
      throw new Error("Cannot reschedule booking: Arrival has already been gate-verified or procurement has started.");
    }

    const rescheduledBooking = mapBooking(updated[0]);

    const localBk = this.data.bookings.find(b => b.id === String(bookingId));
    if (localBk) {
      localBk.date = newDate;
      localBk.timeSlot = newTimeSlot;
      localBk.arrivalStatus = 'Pending';
      localBk.procurementStage = 'NOT_ARRIVED';
      localBk.arrivedAt = null;
      localBk.procurementStartedAt = null;
      localBk.procurementCompletedAt = null;
      localBk.qrPayload = JSON.stringify(qrPayloadObj);
      this.save();
    }

    this.addNotification({
      farmerId: rescheduledBooking.farmerId,
      bookingId: rescheduledBooking.id,
      type: "BOOKING_RESCHEDULED",
      title: "Booking Rescheduled",
      message: `Your booking (Token: ${rescheduledBooking.tokenNumber}) has been rescheduled to ${newDate} (${newTimeSlot}).`
    });

    return rescheduledBooking;
  }

  async evaluateNoShows(mandiId = null) {
    if (!this.supabase) return [];
    const GRACE_PERIOD_MINUTES = parseInt(process.env.NO_SHOW_GRACE_PERIOD_MINUTES || '60', 10);
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const evaluatedNoShows = [];

    let query = this.supabase.from('bookings').select('*').eq('date', todayStr).eq('arrival_status', 'Pending').eq('booking_status', 'ACTIVE');
    if (mandiId) query = query.eq('mandi_id', String(mandiId));

    const { data: targetBookings } = await query;

    if (Array.isArray(targetBookings)) {
      for (const bRow of targetBookings) {
        if (bRow.time_slot && bRow.time_slot.includes('-')) {
          const endTimeStr = bRow.time_slot.split('-')[1].trim();
          const [hours, minutes] = endTimeStr.split(':').map(Number);
          const slotEndDateTime = new Date();
          slotEndDateTime.setHours(hours, minutes, 0, 0);
          const graceExpiryDateTime = new Date(slotEndDateTime.getTime() + GRACE_PERIOD_MINUTES * 60000);

          if (now > graceExpiryDateTime) {
            const { data: updated } = await this.supabase.from('bookings').update({ booking_status: 'NO_SHOW' }).eq('id', bRow.id).select();
            if (updated && updated.length > 0) {
              const mapped = mapBooking(updated[0]);
              evaluatedNoShows.push(mapped);
              this.addNotification({
                farmerId: mapped.farmerId,
                bookingId: mapped.id,
                type: "BOOKING_NOSHOW",
                title: "Marked No-Show",
                message: `Your booking (Token: ${mapped.tokenNumber}) was marked as No-Show after grace period expired.`
              });
            }
          }
        }
      }
    }

    return evaluatedNoShows;
  }

  async updateBookingStatus(mandiId, bookingId, { action, date, timeSlot }) {
    if (!supabase) {
      throw new Error("Supabase database connection unavailable. Cannot update booking status.");
    }
    if (action === 'CANCEL') {
      const { data: bData } = await supabase.from('bookings').select('farmer_id').eq('id', String(bookingId)).single();
      const fId = bData ? bData.farmer_id : null;
      return await this.cancelBooking(fId, bookingId);
    } else if (action === 'NOSHOW') {
      const { data: updated } = await supabase.from('bookings').update({ booking_status: 'NO_SHOW' }).eq('id', String(bookingId)).select();
      if (updated && updated.length > 0) {
        const bk = mapBooking(updated[0]);
        this.addNotification({
          farmerId: bk.farmerId,
          bookingId: bk.id,
          type: "BOOKING_NOSHOW",
          title: "Marked No-Show",
          message: `Your booking (Token: ${bk.tokenNumber}) at ${bk.mandiName} was marked as No-Show.`
        });
        return bk;
      }
      throw new Error("Failed to mark booking as No-Show.");
    } else if (action === 'RESCHEDULE') {
      const { data: bData } = await supabase.from('bookings').select('farmer_id').eq('id', String(bookingId)).single();
      const fId = bData ? bData.farmer_id : null;
      return await this.rescheduleBooking(fId, bookingId, { newDate: date, newTimeSlot: timeSlot });
    }
  }

  async calculateAverageProcessingTime(mandiId, dateStr) {
    const FALLBACK_AVERAGE_MINUTES = 15;

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('bookings')
          .select('procurement_started_at, procurement_completed_at')
          .eq('mandi_id', String(mandiId))
          .eq('procurement_stage', 'COMPLETED')
          .not('procurement_started_at', 'is', null)
          .not('procurement_completed_at', 'is', null);

        if (!error && Array.isArray(data)) {
          if (data.length === 0) {
            return FALLBACK_AVERAGE_MINUTES;
          }
          const totalDurationMs = data.reduce((acc, b) => {
            const start = new Date(b.procurement_started_at).getTime();
            const end = new Date(b.procurement_completed_at).getTime();
            const diff = end - start;
            return acc + (diff > 0 ? diff : 15 * 60000);
          }, 0);
          return Math.max(5, Math.round(totalDurationMs / (data.length * 60000)));
        }
        console.warn(`⚠️ [SUPABASE READ WARNING] calculateAverageProcessingTime(${mandiId}) fallback to local JSON:`, error?.message);
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] calculateAverageProcessingTime(${mandiId}) fallback to local JSON:`, err.message);
      }
    }

    // Local JSON Fallback
    const completedList = this.data.bookings.filter(b => 
      b.mandiId === String(mandiId) && 
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

  async getMandiActiveQueue(mandiId, dateStr) {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];

    if (this.supabase) {
      try {
        const { data: allTargetBookings, error: bErr } = await this.supabase
          .from('bookings')
          .select('*')
          .eq('mandi_id', String(mandiId))
          .eq('date', targetDate);

        if (!bErr && Array.isArray(allTargetBookings)) {
          const mappedBookings = allTargetBookings.map(mapBooking);

          const activeBookings = mappedBookings.filter(b => 
            b.arrivalStatus === "Verified / Arrived" &&
            (b.bookingStatus || 'ACTIVE') === 'ACTIVE' &&
            b.procurementStage !== 'COMPLETED' &&
            b.procurementStatus !== 'Completed'
          );

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

          const completedTodayCount = mappedBookings.filter(b => 
            b.procurementStage === 'COMPLETED' || b.procurementStatus === 'Completed'
          ).length;

          const avgMinutes = await this.calculateAverageProcessingTime(mandiId, targetDate);

          return {
            mandiId: String(mandiId),
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
        console.warn(`⚠️ [SUPABASE READ WARNING] getMandiActiveQueue(${mandiId}, ${targetDate}) fallback to local JSON:`, bErr?.message);
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getMandiActiveQueue(${mandiId}, ${targetDate}) fallback to local JSON:`, err.message);
      }
    }

    // Local JSON Fallback
    const activeBookings = this.data.bookings.filter(b => 
      b.mandiId === String(mandiId) &&
      b.date === targetDate &&
      b.arrivalStatus === "Verified / Arrived" &&
      (b.bookingStatus || 'ACTIVE') === 'ACTIVE' &&
      b.procurementStage !== 'COMPLETED' &&
      b.procurementStatus !== 'Completed'
    );

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
      b.mandiId === String(mandiId) && 
      b.date === targetDate && 
      (b.procurementStage === 'COMPLETED' || b.procurementStatus === 'Completed')
    ).length;

    const avgMinutes = await this.calculateAverageProcessingTime(mandiId, targetDate);

    return {
      mandiId: String(mandiId),
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

  async getFarmerQueueStatus(farmerId) {
    const todayStr = new Date().toISOString().split('T')[0];

    if (this.supabase) {
      try {
        const { data: bRows, error: bErr } = await this.supabase
          .from('bookings')
          .select('*')
          .eq('farmer_id', String(farmerId))
          .eq('booking_status', 'ACTIVE')
          .order('created_at', { ascending: false });

        if (!bErr && Array.isArray(bRows)) {
          const farmerBookings = bRows.map(mapBooking);
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

          const mandiQueue = await this.getMandiActiveQueue(activeBooking.mandiId, activeBooking.date);

          const isServing = activeBooking.procurementStage === 'IN_PROGRESS';
          let queuePosition = null;
          let farmersAhead = 0;

          if (isServing) {
            queuePosition = "#1 (Serving)";
            farmersAhead = 0;
          } else {
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
        console.warn(`⚠️ [SUPABASE READ WARNING] getFarmerQueueStatus(${farmerId}) fallback to local JSON:`, bErr?.message);
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getFarmerQueueStatus(${farmerId}) fallback to local JSON:`, err.message);
      }
    }

    // Local JSON Fallback
    const farmerBookings = this.data.bookings.filter(b => b.farmerId === String(farmerId) && (b.bookingStatus || 'ACTIVE') === 'ACTIVE');
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

    const mandiQueue = await this.getMandiActiveQueue(activeBooking.mandiId, activeBooking.date);

    const isServing = activeBooking.procurementStage === 'IN_PROGRESS';
    let queuePosition = null;
    let farmersAhead = 0;

    if (isServing) {
      queuePosition = "#1 (Serving)";
      farmersAhead = 0;
    } else {
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

  async getAdminStats(selectedDate) {
    const targetDate = selectedDate || new Date().toISOString().split('T')[0];

    if (this.supabase) {
      try {
        const [mandis, farmers, crops] = await Promise.all([
          this.getMandis(),
          this.getFarmers(),
          this.getCrops()
        ]);

        const { data: bRows, error: bErr } = await this.supabase
          .from('bookings')
          .select('*')
          .eq('date', targetDate);

        const { data: pRowsToday, error: pErrToday } = await this.supabase
          .from('procurements')
          .select('*')
          .eq('date', targetDate);

        const { data: pRowsAll, error: pErrAll } = await this.supabase
          .from('procurements')
          .select('*');

        const { data: rRows, error: rErr } = await this.supabase
          .from('daily_reports')
          .select('*')
          .eq('date', targetDate);

        if (!bErr && !pErrToday && !pErrAll && !rErr && Array.isArray(bRows) && Array.isArray(pRowsToday)) {
          const todayBookings = bRows.map(mapBooking);
          const todayProcurements = pRowsToday.map(mapProcurement);
          const allProcurements = Array.isArray(pRowsAll) ? pRowsAll.map(mapProcurement) : [];
          const dailyReports = Array.isArray(rRows) ? rRows.map(mapDailyReport) : [];

          const totalMandis = mandis.length;
          const totalFarmers = farmers.length;
          const todayBooked = todayBookings.length;
          const todayVerified = todayBookings.filter(b => b.arrivalStatus === "Verified / Arrived").length;
          const todayPending = todayBookings.filter(b => b.arrivalStatus === "Pending").length;
          const todayCompleted = todayBookings.filter(b => b.procurementStatus === "Completed").length;

          let totalQtyProcuredToday = 0;
          let totalPaymentAmountToday = 0;

          todayProcurements.forEach(p => {
            totalQtyProcuredToday += (p.actualQty || 0);
            totalPaymentAmountToday += (p.totalAmount || 0);
          });

          const mandiStats = mandis.map(mandi => {
            const mBookings = todayBookings.filter(b => b.mandiId === mandi.id);
            const mProc = todayProcurements.filter(p => p.mandiId === mandi.id);
            const mQty = mProc.reduce((acc, curr) => acc + (curr.actualQty || 0), 0);
            const mPay = mProc.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

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

          const cropStats = crops.map(crop => {
            const cProc = allProcurements.filter(p => p.cropName && p.cropName.includes(crop.name.split(' ')[0]));
            const cQty = cProc.reduce((acc, curr) => acc + (curr.actualQty || 0), 0);
            const cPay = cProc.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

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
            dailyReports
          };
        }
        console.warn(`⚠️ [SUPABASE READ WARNING] getAdminStats(${targetDate}) fallback to local JSON:`, bErr?.message || pErrToday?.message);
      } catch (err) {
        console.warn(`⚠️ [SUPABASE READ EXCEPTION] getAdminStats(${targetDate}) fallback to local JSON:`, err.message);
      }
    }

    // Local JSON Fallback
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
      dailyReports: this.data.dailyReports ? this.data.dailyReports.filter(r => r.date === targetDate) : []
    };
  }

  addNotification({ farmerId, bookingId, type, title, message }) {
    if (!this.data.notifications) {
      this.data.notifications = [];
    }

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

    this.asyncSupabaseSync('notifications', 'insert', {
      id: notification.id,
      farmer_id: notification.farmerId,
      booking_id: notification.bookingId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      created_at: notification.createdAt
    });

    return notification;
  }

  markNotificationAsRead(farmerId, notificationId) {
    if (!this.data.notifications) this.data.notifications = [];
    const notif = this.data.notifications.find(n => n.id === notificationId && n.farmerId === farmerId);
    if (!notif) {
      throw new Error("Notification not found or authorization failed.");
    }
    notif.read = true;
    this.save();

    this.asyncSupabaseSync('notifications', 'update', {
      id: notif.id,
      read: true
    });

    return notif;
  }

  markAllNotificationsAsRead(farmerId) {
    if (!this.data.notifications) this.data.notifications = [];
    let count = 0;
    this.data.notifications.forEach(n => {
      if (n.farmerId === farmerId && !n.read) {
        n.read = true;
        count++;
        this.asyncSupabaseSync('notifications', 'update', { id: n.id, read: true });
      }
    });
    if (count > 0) {
      this.save();
    }
    return { success: true, count };
  }

  updateComplaintStatus({ complaintId, updatedBy, role, mandiId, newStatus, responseComment }) {
    if (!this.data.complaints) this.data.complaints = [];

    const complaint = this.data.complaints.find(c => c.id === complaintId);
    if (!complaint) {
      throw new Error("Complaint record not found.");
    }

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

    this.asyncSupabaseSync('complaints', 'update', {
      id: complaint.id,
      status: complaint.status,
      response_comment: complaint.responseComment,
      last_updated_by: complaint.lastUpdatedBy,
      status_history: complaint.statusHistory,
      updated_at: complaint.updatedAt
    });

    return complaint;
  }
}

export const db = new Database();
