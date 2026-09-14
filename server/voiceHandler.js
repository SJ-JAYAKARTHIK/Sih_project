import { db } from './db.js';

// In-memory session store for tracking active Exotel IVR calls by CallSid / sessionKey
export const exotelSessions = new Map();

// Exotel Applet Redirect URLs for Direct Backend Routing
export const EXOTEL_SUCCESS_APPLET_URL = process.env.EXOTEL_SUCCESS_APPLET_URL || 'https://my.exotel.com/applet/success';
export const EXOTEL_CANCEL_APPLET_URL = process.env.EXOTEL_CANCEL_APPLET_URL || 'https://my.exotel.com/applet/cancel';

// Session timeout: 20 minutes (1200000 ms)
const SESSION_TIMEOUT_MS = 20 * 60 * 1000;

// Centralized Crop Map (1-6 as configured in IVR)
export const CROP_MAP = {
  '1': { id: 'crop-1', name: 'Paddy' },
  '2': { id: 'crop-2', name: 'Wheat' },
  '3': { id: 'crop-3', name: 'Cotton' },
  '4': { id: 'crop-4', name: 'Maize' },
  '5': { id: 'crop-5', name: 'Pulses' },
  '6': { id: 'crop-6', name: 'Gram' }
};

// Clean up expired sessions periodically
export const cleanupExpiredSessions = () => {
  const now = Date.now();
  for (const [key, session] of exotelSessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
      exotelSessions.delete(key);
    }
  }
};

// Dynamic Mandi query: find Mandis accepting the specified crop
export const getCompatibleMandisForCrop = async (cropId) => {
  const allMandis = await db.getMandis();
  const matched = allMandis.filter(m => Array.isArray(m.acceptedCrops) && m.acceptedCrops.includes(cropId));
  if (matched.length > 0) return matched;

  const FALLBACK_MAP = {
    'crop-1': ['MANDI01', 'MANDI02', 'MANDI04'],
    'crop-2': ['MANDI02', 'MANDI04'],
    'crop-3': ['MANDI01', 'MANDI03'],
    'crop-4': ['MANDI01', 'MANDI04'],
    'crop-5': ['MANDI02', 'MANDI03'],
    'crop-6': ['MANDI03', 'MANDI04']
  };

  const targetIds = FALLBACK_MAP[cropId] || ['MANDI01', 'MANDI02'];
  return allMandis.filter(m => targetIds.includes(m.id));
};

// Date Parser: parse DDMM input to ISO date string YYYY-MM-DD
export const parseDateDDMM = (inputStr) => {
  if (!/^\d{4}$/.test(inputStr)) {
    return { valid: false, error: 'INVALID_FORMAT', prompt: 'Please enter a valid 4-digit date in DDMM format, for example 1409 for 14th September.' };
  }

  const day = parseInt(inputStr.slice(0, 2), 10);
  const month = parseInt(inputStr.slice(2, 4), 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { valid: false, error: 'INVALID_DATE_VALUES', prompt: 'Invalid day or month entered. Please enter a valid date in DDMM format.' };
  }

  const currentYear = new Date().getFullYear();
  const dateObj = new Date(currentYear, month - 1, day);

  if (dateObj.getFullYear() !== currentYear || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
    return { valid: false, error: 'NON_EXISTENT_DATE', prompt: 'That calendar date does not exist. Please enter a valid date in DDMM format.' };
  }

  // Format ISO date string YYYY-MM-DD
  const isoDate = `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Check if date is in the past (compared to today in local date string)
  const todayStr = new Date().toISOString().split('T')[0];
  if (isoDate < todayStr) {
    return { valid: false, error: 'PAST_DATE', prompt: 'The date cannot be in the past. Please enter today or a future date in DDMM format.' };
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formattedDate = `${day} ${monthNames[month - 1]}`;

  return { valid: true, isoDate, formattedDate };
};

// Time Parser: parse HHMM* (AM) or HHMM# (PM)
export const parseTimeInput = (inputStr) => {
  const match = /^(\d{2})(\d{2})([*#])$/.exec(inputStr);
  if (!match) {
    return { valid: false, error: 'INVALID_TIME_FORMAT', prompt: 'Invalid time format. Please enter 4 digits followed by star for AM or hash for PM. For example 0300 hash for 3 PM.' };
  }

  const hh = parseInt(match[1], 10);
  const mm = parseInt(match[2], 10);
  const suffix = match[3];

  if (hh < 1 || hh > 12 || mm < 0 || mm > 59) {
    return { valid: false, error: 'INVALID_TIME_VALUES', prompt: 'Invalid hour or minute value. Hour must be 01 to 12 and minutes 00 to 59.' };
  }

  let hh24 = hh;
  if (suffix === '*') {
    // AM
    hh24 = (hh === 12) ? 0 : hh;
  } else {
    // PM (#)
    hh24 = (hh === 12) ? 12 : hh + 12;
  }

  const time24 = `${String(hh24).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

  // Calculate 30-minute slot end time
  let endMm = mm + 30;
  let endHh = hh24;
  if (endMm >= 60) {
    endMm -= 60;
    endHh += 1;
  }
  const timeSlot = `${time24} - ${String(endHh).padStart(2, '0')}:${String(endMm).padStart(2, '0')}`;

  const displayPeriod = suffix === '*' ? 'AM' : 'PM';
  const humanTime = `${hh}:${String(mm).padStart(2, '0')} ${displayPeriod}`;

  return { valid: true, time24, timeSlot, humanTime };
};

// SMS Service Abstraction
export const sendBookingSms = ({ mobile, booking }) => {
  if (!mobile) {
    console.log('⚠️ [SMS SERVICE ABSTRACTION] No recipient mobile number provided. Returning SMS_RECIPIENT_UNAVAILABLE.');
    return {
      status: 'SMS_RECIPIENT_UNAVAILABLE',
      recipient: null,
      message: 'No recipient mobile number provided',
      sentAt: new Date().toISOString()
    };
  }

  console.log(`📱 [SMS SERVICE ABSTRACTION] Preparing SMS dispatch to ${mobile}...`);
  const message = 
    `KrishiDwaar Booking Confirmed.\n` +
    `Booking ID: ${booking.id}\n` +
    `Token: ${booking.tokenNumber}\n` +
    `Mandi: ${booking.mandiName}\n` +
    `Crop: ${booking.cropName}\n` +
    `Date: ${booking.date}\n` +
    `Time Slot: ${booking.timeSlot}\n` +
    `Expected Qty: ${booking.expectedQty !== null && booking.expectedQty !== undefined ? booking.expectedQty + ' kg' : 'N/A'}\n` +
    `Status: BOOKED`;

  console.log(`📩 [SMS DISPATCH CONTENT]:\n${message}`);

  return {
    status: 'SMS_PENDING_CONFIGURATION',
    recipient: mobile,
    message,
    sentAt: new Date().toISOString()
  };
};

// Main State Machine Handler for Exotel IVR Passthru Request
export const handleExotelPassthru = async (req, res, broadcastFn = () => {}) => {
  // Extract CallSid or session identifier
  const callSid = req.query.CallSid || req.body?.CallSid || req.query.CallFrom || req.body?.CallFrom || req.body?.sessionKey || req.query.sessionKey || 'DEFAULT_SESSION';
  const sessionKey = String(callSid).trim();

  // Extract caller phone number from Exotel request (From or CallFrom parameter)
  const rawFrom = req.query.From || req.body?.From || req.query.from || req.body?.from || req.query.CallFrom || req.body?.CallFrom;
  const callerNumber = (rawFrom !== undefined && rawFrom !== null && String(rawFrom).trim() !== '')
    ? String(rawFrom).replace(/["']/g, '').trim()
    : null;

  // Lookup existing session before cleanup
  let session = exotelSessions.get(sessionKey);

  // Check session inactivity expiry (20 mins)
  if (session && (Date.now() - session.lastActivity > SESSION_TIMEOUT_MS)) {
    exotelSessions.delete(sessionKey);
    console.log('⚠️ Voice session expired due to 20 minutes inactivity');
    return res.status(200).json({
      success: false,
      stage: 'ERROR',
      error: 'SESSION_EXPIRED',
      prompt: 'Your session has expired. Please call again.'
    });
  }

  // Clean up other old sessions
  cleanupExpiredSessions();

  // Extract raw digits
  const rawDigits = req.query.digits !== undefined ? req.query.digits : (req.body?.digits !== undefined ? req.body.digits : (req.query.Digits !== undefined ? req.query.Digits : req.body?.Digits));
  
  // Normalize digits (handle quoted strings e.g. '"10029384"' or '"3"')
  const extractedDigits = typeof rawDigits === 'string'
    ? rawDigits.replace(/["']/g, '').trim()
    : (rawDigits !== undefined && rawDigits !== null ? String(rawDigits).replace(/["']/g, '').trim() : '');

  console.log('====================================================');
  console.log('📞 [EXOTEL PASSTHRU] Incoming Voice Session Request');
  console.log('[EXOTEL ROUTING] Input:', extractedDigits);
  console.log('[EXOTEL ROUTING] Stage:', session ? session.stage : 'INIT');
  console.log('Session Key (CallSid):', sessionKey);
  console.log('Caller Number (From):', callerNumber || 'NONE');
  console.log('Raw Digits:', rawDigits);
  console.log('Extracted Digits:', extractedDigits);

  // Initialize new session if not existing
  if (!session) {
    session = {
      callSid: sessionKey,
      callerNumber: callerNumber || null,
      farmerId: null,
      farmerName: null,
      farmerMobile: null,
      selectedCrop: null,
      mandiOptions: [],
      selectedMandi: null,
      selectedDate: null,
      selectedDateFormatted: null,
      selectedTime: null,
      selectedTimeSlot: null,
      selectedTimeFormatted: null,
      expectedQuantity: null,
      bookingSummary: null,
      bookingId: null,
      tokenNumber: null,
      qrIdentifier: null,
      stage: 'INIT',
      lastActivity: Date.now()
    };
  } else if (callerNumber && !session.callerNumber) {
    session.callerNumber = callerNumber;
  }

  session.lastActivity = Date.now();
  console.log('Current Session Stage (Before Processing):', session.stage);

  // --- STATE MACHINE ROUTING ---

  // 1. Initial State / Greeting
  if (session.stage === 'INIT') {
    if (/^\d{8}$/.test(extractedDigits)) {
      // Direct Farmer ID entry on initial call
      const farmer = await db.getFarmerById(extractedDigits);
      if (farmer) {
        session.farmerId = farmer.id;
        session.farmerName = farmer.name;
        session.farmerMobile = farmer.mobile;
        session.stage = 'AWAITING_CROP';
        exotelSessions.set(sessionKey, session);

        console.log('✅ Farmer Verified:', farmer.id, '-> Stage: AWAITING_CROP');
        return res.status(200).json({
          success: true,
          stage: 'AWAITING_CROP',
          farmerName: farmer.name,
          prompt: `Farmer ID verified for ${farmer.name}. Please select your crop: Press 1 for Paddy, 2 for Wheat, 3 for Cotton, 4 for Maize, 5 for Pulses, 6 for Gram.`
        });
      } else {
        session.stage = 'AWAITING_FARMER_ID';
        exotelSessions.set(sessionKey, session);
        return res.status(200).json({
          success: false,
          stage: 'AWAITING_FARMER_ID',
          error: 'FARMER_NOT_FOUND',
          prompt: 'Farmer ID not found. Please enter your 8 digit Farmer ID again.'
        });
      }
    } else {
      session.stage = 'AWAITING_FARMER_ID';
      exotelSessions.set(sessionKey, session);
      return res.status(200).json({
        success: true,
        stage: 'AWAITING_FARMER_ID',
        prompt: 'Welcome to KrishiDwaar Smart Farmer Booking. Please enter your 8-digit Farmer ID.'
      });
    }
  }

  // 2. AWAITING_FARMER_ID
  if (session.stage === 'AWAITING_FARMER_ID') {
    if (/^\d{8}$/.test(extractedDigits)) {
      const farmer = await db.getFarmerById(extractedDigits);
      if (farmer) {
        session.farmerId = farmer.id;
        session.farmerName = farmer.name;
        session.farmerMobile = farmer.mobile;
        session.stage = 'AWAITING_CROP';
        exotelSessions.set(sessionKey, session);

        console.log('✅ Farmer ID Verified:', farmer.id, farmer.name, '-> Stage: AWAITING_CROP');
        return res.status(200).json({
          success: true,
          stage: 'AWAITING_CROP',
          farmerName: farmer.name,
          prompt: `Farmer ID verified for ${farmer.name}. Please select your crop: Press 1 for Paddy, 2 for Wheat, 3 for Cotton, 4 for Maize, 5 for Pulses, 6 for Gram.`
        });
      } else {
        exotelSessions.set(sessionKey, session);
        console.log('❌ Farmer ID not found in database:', extractedDigits);
        return res.status(200).json({
          success: false,
          stage: 'AWAITING_FARMER_ID',
          error: 'FARMER_NOT_FOUND',
          prompt: 'Farmer ID not found. Please enter your 8 digit Farmer ID again.'
        });
      }
    } else {
      exotelSessions.set(sessionKey, session);
      return res.status(200).json({
        success: false,
        stage: 'AWAITING_FARMER_ID',
        error: 'INVALID_FARMER_ID_FORMAT',
        prompt: 'Invalid Farmer ID format. Please enter your 8 digit Farmer ID.'
      });
    }
  }

  // 3. AWAITING_CROP
  if (session.stage === 'AWAITING_CROP') {
    if (!session.farmerId) {
      session.stage = 'AWAITING_FARMER_ID';
      exotelSessions.set(sessionKey, session);
      return res.status(200).json({
        success: false,
        stage: 'AWAITING_FARMER_ID',
        error: 'NO_FARMER_SESSION',
        prompt: 'No verified farmer session. Please enter your 8 digit Farmer ID.'
      });
    }

    if (CROP_MAP[extractedDigits]) {
      const selectedCrop = CROP_MAP[extractedDigits];
      session.selectedCrop = selectedCrop;

      // Dynamically query compatible Mandis
      const mandis = await getCompatibleMandisForCrop(selectedCrop.id);
      session.mandiOptions = mandis.map((m, idx) => ({
        option: idx + 1,
        mandiId: m.id,
        mandiName: m.name
      }));

      const mandiPrompt = `Your selected crop is ${selectedCrop.name}. The following Mandis accept this crop. ` +
        session.mandiOptions.map(m => `Press ${m.option} for ${m.mandiName}.`).join(' ');

      session.stage = 'AWAITING_MANDI';
      exotelSessions.set(sessionKey, session);

      console.log('🌽 Crop Selected:', selectedCrop.name, '-> Generated Mandi Options:', session.mandiOptions);
      return res.status(200).json({
        success: true,
        stage: 'AWAITING_MANDI',
        crop: selectedCrop,
        mandiOptions: session.mandiOptions,
        prompt: mandiPrompt
      });
    } else {
      exotelSessions.set(sessionKey, session);
      return res.status(200).json({
        success: false,
        stage: 'AWAITING_CROP',
        error: 'INVALID_CROP_CHOICE',
        prompt: 'Invalid crop choice. Press 1 for Paddy, 2 for Wheat, 3 for Cotton, 4 for Maize, 5 for Pulses, 6 for Gram.'
      });
    }
  }

  // 4. AWAITING_MANDI
  if (session.stage === 'AWAITING_MANDI') {
    const choice = parseInt(extractedDigits, 10);
    const selectedOption = session.mandiOptions.find(o => o.option === choice);

    if (selectedOption) {
      session.selectedMandi = { id: selectedOption.mandiId, name: selectedOption.mandiName };
      session.stage = 'AWAITING_DATE';
      exotelSessions.set(sessionKey, session);

      console.log('🏢 Mandi Selected:', selectedOption.mandiName, '-> Stage: AWAITING_DATE');
      return res.status(200).json({
        success: true,
        stage: 'AWAITING_DATE',
        selectedMandi: session.selectedMandi,
        prompt: `You selected ${selectedOption.mandiName}. Please enter your visit date in 4 digits DDMM format. For example, 1409 for September 14th.`
      });
    } else {
      const fallbackPrompt = `Invalid Mandi selection. ` +
        session.mandiOptions.map(m => `Press ${m.option} for ${m.mandiName}.`).join(' ');
      exotelSessions.set(sessionKey, session);
      return res.status(200).json({
        success: false,
        stage: 'AWAITING_MANDI',
        error: 'INVALID_MANDI_OPTION',
        mandiOptions: session.mandiOptions,
        prompt: fallbackPrompt
      });
    }
  }

  // 5. AWAITING_DATE
  if (session.stage === 'AWAITING_DATE') {
    const parsedDate = parseDateDDMM(extractedDigits);
    if (parsedDate.valid) {
      session.selectedDate = parsedDate.isoDate;
      session.selectedDateFormatted = parsedDate.formattedDate;
      session.stage = 'AWAITING_TIME';
      exotelSessions.set(sessionKey, session);

      console.log('📅 Date Set:', parsedDate.isoDate, `(${parsedDate.formattedDate}) -> Stage: AWAITING_TIME`);
      return res.status(200).json({
        success: true,
        stage: 'AWAITING_TIME',
        date: parsedDate.isoDate,
        dateFormatted: parsedDate.formattedDate,
        prompt: `Date set for ${parsedDate.formattedDate}. Please enter your preferred arrival time using 4 digits followed by star for AM or hash for PM. For example 0300 hash for 3:00 PM.`
      });
    } else {
      exotelSessions.set(sessionKey, session);
      return res.status(200).json({
        success: false,
        stage: 'AWAITING_DATE',
        error: parsedDate.error,
        prompt: parsedDate.prompt
      });
    }
  }

  // 6. AWAITING_TIME
  if (session.stage === 'AWAITING_TIME') {
    const parsedTime = parseTimeInput(extractedDigits);
    if (parsedTime.valid) {
      // Check slot availability in database
      const slots = await db.getTimeSlots(session.selectedMandi.id, session.selectedDate);
      const slotObj = slots.find(s => s.time === parsedTime.timeSlot);

      if (slotObj && !slotObj.isAvailable) {
        exotelSessions.set(sessionKey, session);
        return res.status(200).json({
          success: false,
          stage: 'AWAITING_TIME',
          error: 'SLOT_FULL',
          prompt: `The time slot ${parsedTime.timeSlot} is fully booked at ${session.selectedMandi.name} on ${session.selectedDateFormatted}. Please enter another arrival time.`
        });
      }

      session.selectedTime = parsedTime.time24;
      session.selectedTimeSlot = parsedTime.timeSlot;
      session.selectedTimeFormatted = parsedTime.humanTime;
      session.stage = 'AWAITING_QUANTITY';
      exotelSessions.set(sessionKey, session);

      console.log('⏰ Time Slot Set:', parsedTime.timeSlot, `(${parsedTime.humanTime}) -> Stage: AWAITING_QUANTITY`);
      return res.status(200).json({
        success: true,
        stage: 'AWAITING_QUANTITY',
        timeSlot: parsedTime.timeSlot,
        prompt: `Time slot set for ${parsedTime.humanTime}. Please enter your expected crop quantity in kilograms (up to 3 digits), or press star to skip.`
      });
    } else {
      exotelSessions.set(sessionKey, session);
      return res.status(200).json({
        success: false,
        stage: 'AWAITING_TIME',
        error: parsedTime.error,
        prompt: parsedTime.prompt
      });
    }
  }

  // 7. AWAITING_QUANTITY
  if (session.stage === 'AWAITING_QUANTITY') {
    let parsedQty = null;
    const qtyMatch = /^(\d{1,5})\*?$/.exec(extractedDigits);
    if (qtyMatch) {
      parsedQty = parseInt(qtyMatch[1], 10);
    } else if (extractedDigits === '*' || extractedDigits === '#' || extractedDigits === '') {
      parsedQty = null;
    } else {
      exotelSessions.set(sessionKey, session);
      return res.status(200).json({
        success: false,
        stage: 'AWAITING_QUANTITY',
        error: 'INVALID_QUANTITY',
        prompt: 'Invalid quantity format. Enter your expected quantity in kilograms, or press star to skip.'
      });
    }

    session.expectedQuantity = parsedQty;
    session.bookingSummary = {
      farmerName: session.farmerName,
      farmerId: session.farmerId,
      farmerMobile: session.farmerMobile,
      crop: session.selectedCrop.name,
      mandi: session.selectedMandi.name,
      date: session.selectedDateFormatted || session.selectedDate,
      time: session.selectedTimeFormatted || session.selectedTimeSlot,
      expectedQuantity: session.expectedQuantity
    };

    session.stage = 'READY_FOR_CONFIRMATION';
    exotelSessions.set(sessionKey, session);

    const summaryPrompt = `Farmer: ${session.farmerName}. Crop: ${session.selectedCrop.name}. Mandi: ${session.selectedMandi.name}. Date: ${session.selectedDateFormatted || session.selectedDate}. Time: ${session.selectedTimeFormatted || session.selectedTimeSlot}. Expected quantity: ${session.expectedQuantity !== null && session.expectedQuantity !== undefined ? session.expectedQuantity + ' kg' : 'Not specified'}. To confirm this booking, press 1. To cancel, press 2.`;

    console.log('📋 Booking Summary Created -> Stage: READY_FOR_CONFIRMATION', session.bookingSummary);
    return res.status(200).json({
      success: true,
      stage: 'READY_FOR_CONFIRMATION',
      summary: session.bookingSummary,
      prompt: summaryPrompt
    });
  }

  // 8. READY_FOR_CONFIRMATION
  if (session.stage === 'READY_FOR_CONFIRMATION') {
    const isTestOrJson = req.path === '/api/voice/exotel/test' || req.query?.format === 'json' || req.body?.format === 'json';

    if (extractedDigits === '2') {
      session.stage = 'CANCELLED';
      exotelSessions.set(sessionKey, session);

      console.log('🚫 Booking Cancelled by Farmer');
      const resBody = {
        success: true,
        result: 'CANCELLED',
        status: 'CANCELLED',
        choice: '2',
        action: 'CANCELLED',
        select: '2',
        digits: '2',
        stage: 'CANCELLED',
        prompt: 'Your booking request has been cancelled. Thank you for calling KrishiDwaar.'
      };

      if (isTestOrJson) {
        console.log('====================================================');
        console.log('[EXOTEL ROUTING] Input:', extractedDigits);
        console.log('[EXOTEL ROUTING] Stage: READY_FOR_CONFIRMATION -> CANCELLED');
        console.log('[EXOTEL ROUTING] Response:', JSON.stringify(resBody));
        console.log('====================================================');
        return res.status(200).json(resBody);
      }

      console.log('====================================================');
      console.log('[EXOTEL ROUTING] Input:', extractedDigits);
      console.log('[EXOTEL ROUTING] Stage: READY_FOR_CONFIRMATION -> CANCELLED');
      console.log('[EXOTEL ROUTING] Response: CANCELLED');
      console.log('====================================================');

      if (typeof res.setHeader === 'function') res.setHeader('Content-Type', 'text/plain');
      else if (typeof res.type === 'function') res.type('text/plain');
      else if (typeof res.set === 'function') res.set('Content-Type', 'text/plain');

      return res.status(200).send('CANCELLED');
    } else if (extractedDigits === '1') {
      session.stage = 'BOOKING';

      // --- FINAL REVALIDATION BEFORE BOOKING ---
      console.log('🔄 Re-validating session data before database entry...');
      
      const farmer = await db.getFarmerById(session.farmerId);
      if (!farmer) {
        session.stage = 'ERROR';
        exotelSessions.set(sessionKey, session);
        const errBody = { success: false, result: 'ERROR', status: 'ERROR', stage: 'ERROR', error: 'FARMER_NOT_FOUND', prompt: 'Farmer record no longer exists.' };
        console.log('[EXOTEL ROUTING] Input:', extractedDigits);
        console.log('[EXOTEL ROUTING] Stage: ERROR');
        console.log('[EXOTEL ROUTING] Response:', JSON.stringify(errBody));
        return res.status(200).json(errBody);
      }

      const mandi = await db.getMandiById(session.selectedMandi.id);
      if (!mandi) {
        session.stage = 'ERROR';
        exotelSessions.set(sessionKey, session);
        const errBody = { success: false, result: 'ERROR', status: 'ERROR', stage: 'ERROR', error: 'MANDI_NOT_FOUND', prompt: 'Selected Mandi no longer exists.' };
        console.log('[EXOTEL ROUTING] Input:', extractedDigits);
        console.log('[EXOTEL ROUTING] Stage: ERROR');
        console.log('[EXOTEL ROUTING] Response:', JSON.stringify(errBody));
        return res.status(200).json(errBody);
      }

      const crop = await db.getCropById(session.selectedCrop.id);
      if (!crop) {
        session.stage = 'ERROR';
        exotelSessions.set(sessionKey, session);
        const errBody = { success: false, result: 'ERROR', status: 'ERROR', stage: 'ERROR', error: 'CROP_NOT_FOUND', prompt: 'Selected crop is invalid.' };
        console.log('[EXOTEL ROUTING] Input:', extractedDigits);
        console.log('[EXOTEL ROUTING] Stage: ERROR');
        console.log('[EXOTEL ROUTING] Response:', JSON.stringify(errBody));
        return res.status(200).json(errBody);
      }

      // Revalidate Mandi accepts selected crop
      if (Array.isArray(mandi.acceptedCrops) && !mandi.acceptedCrops.includes(crop.id)) {
        session.stage = 'ERROR';
        exotelSessions.set(sessionKey, session);
        const errBody = {
          success: false,
          result: 'ERROR',
          status: 'ERROR',
          stage: 'ERROR',
          error: 'CROP_NOT_ACCEPTED_BY_MANDI',
          prompt: `The selected Mandi ${mandi.name} no longer accepts ${crop.name}. Please call back to reselect.`
        };
        console.log('[EXOTEL ROUTING] Input:', extractedDigits);
        console.log('[EXOTEL ROUTING] Stage: ERROR');
        console.log('[EXOTEL ROUTING] Response:', JSON.stringify(errBody));
        return res.status(200).json(errBody);
      }

      // Revalidate slot capacity
      const slots = await db.getTimeSlots(session.selectedMandi.id, session.selectedDate);
      const slotObj = slots.find(s => s.time === session.selectedTimeSlot);
      if (slotObj && !slotObj.isAvailable) {
        session.stage = 'ERROR';
        exotelSessions.set(sessionKey, session);
        const errBody = { success: false, result: 'ERROR', status: 'ERROR', stage: 'ERROR', error: 'SLOT_NO_LONGER_AVAILABLE', prompt: 'The selected time slot is no longer available. Please select another slot.' };
        console.log('[EXOTEL ROUTING] Input:', extractedDigits);
        console.log('[EXOTEL ROUTING] Stage: ERROR');
        console.log('[EXOTEL ROUTING] Response:', JSON.stringify(errBody));
        return res.status(200).json(errBody);
      }

      // Revalidate duplicate active booking on same date
      const farmerBookings = await db.getFarmerBookings(session.farmerId);
      const activeDuplicate = farmerBookings.find(b => 
        b.date === session.selectedDate && 
        (b.bookingStatus || 'ACTIVE') === 'ACTIVE' && 
        b.procurementStatus !== 'Completed'
      );

      if (activeDuplicate) {
        session.stage = 'ERROR';
        exotelSessions.set(sessionKey, session);
        const errBody = { success: false, result: 'ERROR', status: 'ERROR', stage: 'ERROR', error: 'DUPLICATE_BOOKING', prompt: 'You already have an active procurement booking on this date.' };
        console.log('[EXOTEL ROUTING] Input:', extractedDigits);
        console.log('[EXOTEL ROUTING] Stage: ERROR');
        console.log('[EXOTEL ROUTING] Response:', JSON.stringify(errBody));
        return res.status(200).json(errBody);
      }

      // Create Booking in DB
      try {
        const newBooking = await db.createBooking({
          farmerId: session.farmerId,
          mandiId: session.selectedMandi.id,
          cropId: session.selectedCrop.id,
          date: session.selectedDate,
          timeSlot: session.selectedTimeSlot,
          expectedQty: session.expectedQuantity,
          source: 'VOICE_IVR'
        });

        session.bookingId = newBooking.id;
        session.tokenNumber = newBooking.tokenNumber;
        session.qrIdentifier = newBooking.qrPayload;
        session.stage = 'BOOKED';
        exotelSessions.set(sessionKey, session);

        console.log('🎉 VOICE BOOKING CREATED SUCCESSFULLY:', newBooking.id, newBooking.tokenNumber);

        // Real-time WebSocket Broadcasts
        broadcastFn('VOICE_BOOKING_CREATED', newBooking);
        broadcastFn('BOOKING_CREATED', newBooking);

        // SMS Dispatch Abstraction (strictly uses session.callerNumber, NOT farmer.mobile)
        const smsResult = sendBookingSms({ mobile: session.callerNumber, booking: newBooking });

        const confirmPrompt = smsResult.status === 'SMS_PENDING_CONFIGURATION'
          ? `Your booking has been confirmed successfully. Your booking ID is ${newBooking.id}. Your token number is ${newBooking.tokenNumber}. The booking details have been sent to your registered mobile number.`
          : `Your booking has been confirmed successfully. Your booking ID is ${newBooking.id}. Your token number is ${newBooking.tokenNumber}.`;

        const resBody = {
          success: true,
          result: 'CONFIRMED',
          status: 'CONFIRMED',
          choice: '1',
          action: 'CONFIRMED',
          select: '1',
          digits: '1',
          stage: 'BOOKED',
          booking: {
            bookingId: newBooking.id,
            tokenNumber: newBooking.tokenNumber,
            qrIdentifier: newBooking.qrPayload,
            farmerId: newBooking.farmerId,
            farmerName: newBooking.farmerName,
            crop: newBooking.cropName,
            mandi: newBooking.mandiName,
            date: newBooking.date,
            time: newBooking.timeSlot,
            expectedQuantity: newBooking.expectedQty,
            status: newBooking.bookingStatus,
            source: newBooking.source
          },
          smsStatus: smsResult.status,
          prompt: confirmPrompt
        };

        if (isTestOrJson) {
          console.log('====================================================');
          console.log('[EXOTEL ROUTING] Input:', extractedDigits);
          console.log('[EXOTEL ROUTING] Stage: READY_FOR_CONFIRMATION -> BOOKED');
          console.log('[EXOTEL ROUTING] Response:', JSON.stringify(resBody));
          console.log('====================================================');
          return res.status(200).json(resBody);
        }

        console.log('====================================================');
        console.log('[EXOTEL ROUTING] Input:', extractedDigits);
        console.log('[EXOTEL ROUTING] Stage: READY_FOR_CONFIRMATION -> BOOKED');
        console.log('[EXOTEL ROUTING] Response: CONFIRMED');
        console.log('====================================================');

        if (typeof res.setHeader === 'function') res.setHeader('Content-Type', 'text/plain');
        else if (typeof res.type === 'function') res.type('text/plain');
        else if (typeof res.set === 'function') res.set('Content-Type', 'text/plain');

        return res.status(200).send('CONFIRMED');
      } catch (err) {
        console.error('❌ Error creating voice booking:', err.message);
        session.stage = 'ERROR';
        exotelSessions.set(sessionKey, session);
        const errBody = {
          success: false,
          result: 'ERROR',
          status: 'ERROR',
          stage: 'ERROR',
          error: err.message,
          prompt: `Booking creation failed: ${err.message}`
        };
        console.log('[EXOTEL ROUTING] Input:', extractedDigits);
        console.log('[EXOTEL ROUTING] Stage: ERROR');
        console.log('[EXOTEL ROUTING] Response:', JSON.stringify(errBody));
        return res.status(200).json(errBody);
      }
    } else {
      const summaryPrompt = `Farmer: ${session.farmerName}. Crop: ${session.selectedCrop.name}. Mandi: ${session.selectedMandi.name}. Date: ${session.selectedDateFormatted || session.selectedDate}. Time: ${session.selectedTimeFormatted || session.selectedTimeSlot}. Expected quantity: ${session.expectedQuantity !== null && session.expectedQuantity !== undefined ? session.expectedQuantity + ' kg' : 'Not specified'}. To confirm this booking, press 1. To cancel, press 2.`;
      exotelSessions.set(sessionKey, session);
      const resBody = {
        success: false,
        result: 'INVALID',
        status: 'INVALID',
        choice: 'INVALID',
        action: 'INVALID',
        select: 'INVALID',
        digits: extractedDigits,
        stage: 'READY_FOR_CONFIRMATION',
        error: 'INVALID_CONFIRMATION_CHOICE',
        prompt: summaryPrompt
      };

      console.log('====================================================');
      console.log('[EXOTEL ROUTING] Input:', extractedDigits);
      console.log('[EXOTEL ROUTING] Stage: READY_FOR_CONFIRMATION');
      console.log('[EXOTEL ROUTING] Response:', JSON.stringify(resBody));
      console.log('====================================================');

      return res.status(200).json(resBody);
    }
  }

  // Fallback for terminal or unexpected states
  return res.status(200).json({
    success: true,
    stage: session.stage,
    prompt: session.stage === 'BOOKED'
      ? `Your booking ${session.tokenNumber} is already confirmed.`
      : 'Your session has ended.'
  });
};

// Dynamic Greeting Endpoint Handler for Exotel IVR
export const handleExotelGreeting = (req, res) => {
  const method = (req.method || 'GET').toUpperCase();
  const callSid = req.query.CallSid || req.query.callSid || req.query.call_sid || req.query.CallFrom || req.query.sessionKey || req.body?.CallSid || req.body?.callSid || req.body?.sessionKey;

  const sessionKey = callSid ? String(callSid).trim() : '';
  let session = sessionKey ? exotelSessions.get(sessionKey) : null;

  // Missing session or expired session (20 mins timeout)
  if (session && (Date.now() - session.lastActivity > SESSION_TIMEOUT_MS)) {
    exotelSessions.delete(sessionKey);
    session = null;
  }

  const sessionFound = Boolean(session);
  const sessionStage = session ? session.stage : 'NONE';
  const selectedCrop = session ? session.selectedCrop : null;
  const mandiOptions = session ? session.mandiOptions : [];

  let prompt = '';
  let statusCode = 200;

  if (!session) {
    statusCode = 404;
    prompt = 'Your session has expired. Please call again.';
  } else {
    statusCode = 200;
    if (session.stage === 'AWAITING_MANDI') {
      if (session.selectedCrop && Array.isArray(session.mandiOptions) && session.mandiOptions.length > 0) {
        prompt = `Your selected crop is ${session.selectedCrop.name}. The following Mandis accept this crop. ` +
          session.mandiOptions.map(m => `Press ${m.option} for ${m.mandiName}.`).join(' ');
      } else {
        prompt = 'We could not find available Mandis for your selected crop. Please try again.';
      }
    } else if (session.stage === 'INIT' || session.stage === 'AWAITING_FARMER_ID') {
      prompt = 'Welcome to KrishiDwaar Smart Farmer Booking. Please enter your 8-digit Farmer ID.';
    } else if (session.stage === 'AWAITING_CROP') {
      prompt = `Farmer ID verified for ${session.farmerName || 'farmer'}. Please select your crop: Press 1 for Paddy, 2 for Wheat, 3 for Cotton, 4 for Maize, 5 for Pulses, 6 for Gram.`;
    } else if (session.stage === 'AWAITING_DATE') {
      prompt = `You selected ${session.selectedMandi?.name || 'Mandi'}. Please enter your visit date in 4 digits DDMM format. For example, 1409 for September 14th.`;
    } else if (session.stage === 'AWAITING_TIME') {
      prompt = `Date set for ${session.selectedDateFormatted || session.selectedDate}. Please enter your preferred arrival time using 4 digits followed by star for AM or hash for PM.`;
    } else if (session.stage === 'AWAITING_QUANTITY') {
      prompt = `Time slot set for ${session.selectedTimeFormatted || session.selectedTimeSlot}. Please enter your expected crop quantity in kilograms, or press star to skip.`;
    } else if (session.stage === 'READY_FOR_CONFIRMATION') {
      prompt = `Farmer: ${session.farmerName}. Crop: ${session.selectedCrop ? session.selectedCrop.name : 'Crop'}. Mandi: ${session.selectedMandi ? session.selectedMandi.name : 'Mandi'}. Date: ${session.selectedDateFormatted || session.selectedDate}. Time: ${session.selectedTimeFormatted || session.selectedTimeSlot}. Expected quantity: ${session.expectedQuantity !== null && session.expectedQuantity !== undefined ? session.expectedQuantity + ' kg' : 'Not specified'}. To confirm this booking, press 1. To cancel, press 2.`;
    } else if (session.stage === 'BOOKED') {
      const mandiStr = session.selectedMandi?.name || 'Mandi';
      const cropStr = session.selectedCrop?.name || 'Crop';
      const dateStr = session.selectedDateFormatted || session.selectedDate || 'Date';
      const timeStr = session.selectedTimeFormatted || session.selectedTimeSlot || 'Time';
      const qtyStr = (session.expectedQuantity !== null && session.expectedQuantity !== undefined)
        ? `${session.expectedQuantity} kilograms`
        : 'Not specified';

      prompt = `Your booking has been confirmed successfully. Your booking ID is ${session.bookingId}. Your token number is ${session.tokenNumber}. Your mandi is ${mandiStr}. Your crop is ${cropStr}. Your date is ${dateStr}. Your time slot is ${timeStr}. Your expected quantity is ${qtyStr}. Thank you for using KrishiDwaar.`;
    } else if (session.stage === 'CANCELLED') {
      prompt = 'Your booking has been cancelled successfully. No slot has been booked. Thank you for using KrishiDwaar.';
    } else {
      prompt = 'Your session is active. Please continue your request.';
    }
  }

  // Detailed Logging Requirement 1 & 4
  console.log('====================================================');
  console.log('🗣️ [EXOTEL DYNAMIC GREETING] Incoming Greeting Request');
  console.log('HTTP Method:', method);
  console.log('CallSid:', callSid || 'NONE');
  console.log('Session Found:', sessionFound);
  console.log('Current Session Stage:', sessionStage);
  console.log('Selected Crop:', selectedCrop ? selectedCrop.name : 'NONE');
  console.log('Mandi Options:', mandiOptions);
  console.log('Generated Prompt:', prompt);
  console.log('Response Status:', statusCode);
  console.log('====================================================');

  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'text/plain');
  } else if (typeof res.set === 'function') {
    res.set('Content-Type', 'text/plain');
  } else if (typeof res.type === 'function') {
    res.type('text/plain');
  }

  if (method === 'HEAD') {
    return res.status(statusCode).end();
  }

  return res.status(statusCode).send(prompt);
};




