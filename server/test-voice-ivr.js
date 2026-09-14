import { handleExotelPassthru, handleExotelGreeting, exotelSessions, EXOTEL_SUCCESS_APPLET_URL, EXOTEL_CANCEL_APPLET_URL } from './voiceHandler.js';
import { db, supabase } from './db.js';

let totalTests = 0;
let passedTests = 0;

const assert = (condition, testName) => {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
  }
};

// Mock Response Object for Express Handler Testing
const createMockRes = () => {
  const res = {
    statusCode: 200,
    data: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    type(t) {
      this.headers['Content-Type'] = t;
      return this;
    },
    set(k, v) {
      this.headers[k] = v;
      return this;
    },
    setHeader(k, v) {
      this.headers[k] = v;
      return this;
    },
    json(obj) {

      this.data = obj;
      return this;
    },
    send(str) {
      this.data = str;
      return this;
    },
    redirect(arg1, arg2) {
      if (typeof arg1 === 'number') {
        this.statusCode = arg1;
        this.headers['Location'] = arg2;
      } else {
        this.statusCode = 302;
        this.headers['Location'] = arg1;
      }
      return this;
    },
    end() {
      return this;
    }
  };
  return res;
};

console.log('====================================================');
console.log('🚀 RUNNING INBOUND VOICE / IVR BACKEND TEST SUITE');
console.log('====================================================\n');

// Clean up previous test bookings to ensure idempotent test runs
db.data.bookings = db.data.bookings.filter(b => b.farmerId !== '10029384' || (b.date !== '2026-09-14' && b.date !== '2026-09-15'));
db.save();
if (supabase) {
  await supabase.from('bookings').delete().eq('source', 'VOICE_IVR');
}

// --- 1. HAPPY PATH END-TO-END IVR BOOKING TEST ---
console.log('📌 Scenario 1: Happy Path Voice Booking Lifecycle (Farmer 10029384 - Ramesh Verma)');

const happyCallSid = 'TEST_HAPPY_CALL_SID_' + Date.now();

// Step 1: Initial call connection
let req = { query: { CallSid: happyCallSid, From: '9123456789', digits: '' } };
let res = createMockRes();
await handleExotelPassthru(req, res);
assert(res.data.success === true && res.data.stage === 'AWAITING_FARMER_ID', 'Step 1: Init -> AWAITING_FARMER_ID');

const happySession = exotelSessions.get(happyCallSid);
assert(happySession && happySession.callerNumber === '9123456789', 'Step 1b: Exotel From callerNumber captured & stored in session');

// Step 2: Enter 8-digit Farmer ID (10029384)
req = { query: { CallSid: happyCallSid, digits: '"10029384"' } }; // Test Exotel quoted string
res = createMockRes();
await handleExotelPassthru(req, res);
assert(res.data.success === true && res.data.stage === 'AWAITING_CROP' && res.data.farmerName === 'Ramesh Verma', 'Step 2: Verified Farmer ID 10029384 -> AWAITING_CROP');

// Step 3: Select Crop 5 (Pulses)
req = { query: { CallSid: happyCallSid, digits: '5' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(
  res.data.success === true &&
  res.data.stage === 'AWAITING_MANDI' &&
  res.data.crop.name === 'Pulses' &&
  Array.isArray(res.data.mandiOptions) &&
  res.data.mandiOptions.length > 0 &&
  res.data.prompt.includes('Pulses'),
  'Step 3: Selected Crop 5 (Pulses) -> Dynamic Mandis Generated & Prompt Built'
);

// Step 4: Select Mandi Option 1 (Nizamabad APMC Mandi)
req = { query: { CallSid: happyCallSid, digits: '1' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(
  res.data.success === true &&
  res.data.stage === 'AWAITING_DATE' &&
  res.data.selectedMandi.name.includes('Nizamabad'),
  'Step 4: Selected Mandi Option 1 (Nizamabad APMC Mandi) -> AWAITING_DATE'
);

// Step 5: Select Date 1409 (14 September)
req = { query: { CallSid: happyCallSid, digits: '1409' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(
  res.data.success === true &&
  res.data.stage === 'AWAITING_TIME' &&
  res.data.date === '2026-09-14',
  'Step 5: Entered Date 1409 -> AWAITING_TIME (Converted to 2026-09-14)'
);

// Step 6: Select Time 0300# (3:00 PM -> 15:00 - 15:30)
req = { query: { CallSid: happyCallSid, digits: '0300#' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(
  res.data.success === true &&
  res.data.stage === 'AWAITING_QUANTITY' &&
  res.data.timeSlot === '15:00 - 15:30',
  'Step 6: Entered Time 0300# -> AWAITING_QUANTITY (Slot: 15:00 - 15:30)'
);

// Step 7: Select Quantity 090 (90 kg)
req = { query: { CallSid: happyCallSid, digits: '090' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(
  res.data.success === true &&
  res.data.stage === 'READY_FOR_CONFIRMATION' &&
  res.data.summary.expectedQuantity === 90 &&
  res.data.summary.farmerName === 'Ramesh Verma',
  'Step 7: Entered Quantity 090 -> READY_FOR_CONFIRMATION (Summary Generated)'
);

// Step 8: Confirm Booking (1) - Test JSON endpoint output
const broadcastEvents = [];
const mockBroadcast = (evt, data) => {
  broadcastEvents.push({ evt, data });
};

req = { path: '/api/voice/exotel/test', query: { CallSid: happyCallSid, digits: '1' } };
res = createMockRes();
await handleExotelPassthru(req, res, mockBroadcast);
assert(
  res.statusCode === 200 &&
  res.data.success === true &&
  res.data.stage === 'BOOKED' &&
  res.data.booking.source === 'VOICE_IVR' &&
  res.data.booking.tokenNumber.startsWith('TKN-') &&
  res.data.booking.qrIdentifier !== null &&
  res.data.smsStatus === 'SMS_PENDING_CONFIGURATION',
  'Step 8: Confirmed Booking via JSON test route -> BOOKED (source = VOICE_IVR, Token & QR created, SMS status recorded)'
);

// Step 8b: Test Actual Exotel Passthru Route Response (/api/voice/exotel) for Confirmation
const happyCallSid2 = 'TEST_HAPPY_PASSTHRU_' + Date.now();
await handleExotelPassthru({ query: { CallSid: happyCallSid2, From: '9123456789', digits: '10029384' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: happyCallSid2, digits: '5' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: happyCallSid2, digits: '1' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: happyCallSid2, digits: '1509' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: happyCallSid2, digits: '0400#' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: happyCallSid2, digits: '100*' } }, createMockRes());

req = { path: '/api/voice/exotel', query: { CallSid: happyCallSid2, digits: '1' } };
res = createMockRes();
await handleExotelPassthru(req, res);
console.log('\n--- EXACT EXOTEL CONFIRMATION PASSTHRU RESPONSE ---');
console.log('HTTP Status :', res.statusCode);
console.log('Content-Type:', res.headers['Content-Type']);
console.log('Body        :', res.data);
console.log('-----------------------------------------------------\n');

assert(
  res.statusCode === 200 &&
  res.headers['Content-Type'] === 'text/plain' &&
  res.data === 'CONFIRMED',
  'Step 8b: Actual Exotel Passthru Route /api/voice/exotel returns HTTP 200, Content-Type: text/plain, body: CONFIRMED'
);

assert(
  broadcastEvents.some(e => e.evt === 'VOICE_BOOKING_CREATED' && e.data.source === 'VOICE_IVR'),
  'Step 9: WebSocket broadcast VOICE_BOOKING_CREATED emitted'
);

// Verify persistence in Database
const createdBookingId = res.data?.booking?.bookingId || 'BK-';
const farmerBookings = await db.getFarmerBookings('10029384');
const isFoundInFarmerPortal = farmerBookings.some(b => b.source === 'VOICE_IVR');
assert(isFoundInFarmerPortal, 'Step 10: Voice booking visible in Farmer Portal database query');

const mandiBookings = await db.getMandiBookings('MANDI02', '2026-09-14');
const isFoundInMandiPortal = mandiBookings.some(b => b.source === 'VOICE_IVR');
assert(isFoundInMandiPortal, 'Step 11: Voice booking visible in Mandi Officer database query');

console.log('\n📌 Scenario 2: Invalid Input & Edge Cases');

// Test 2.1: Invalid 8-digit Farmer ID
const negCall1 = 'TEST_NEG_1_' + Date.now();
req = { query: { CallSid: negCall1, digits: '99999999' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(res.data.success === false && res.data.stage === 'AWAITING_FARMER_ID', 'Test 2.1: Invalid Farmer ID 99999999 rejected');

// Test 2.2: Invalid Crop Number
const negCall2 = 'TEST_NEG_2_' + Date.now();
// First authenticate farmer
req = { query: { CallSid: negCall2, digits: '10029384' } };
res = createMockRes();
await handleExotelPassthru(req, res);
// Now enter invalid crop 9
req = { query: { CallSid: negCall2, digits: '9' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(res.data.success === false && res.data.stage === 'AWAITING_CROP', 'Test 2.2: Invalid crop option 9 rejected');

// Test 2.3: Invalid Mandi Option Number
// Set valid crop 5
req = { query: { CallSid: negCall2, digits: '5' } };
res = createMockRes();
await handleExotelPassthru(req, res);
// Now enter invalid mandi option 99
req = { query: { CallSid: negCall2, digits: '99' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(res.data.success === false && res.data.stage === 'AWAITING_MANDI', 'Test 2.3: Invalid Mandi option 99 rejected');

// Test 2.4: Invalid Date format / Past Date
// Set valid mandi option 1
req = { query: { CallSid: negCall2, digits: '1' } };
res = createMockRes();
await handleExotelPassthru(req, res);
// Enter past date 0101 (Jan 1)
req = { query: { CallSid: negCall2, digits: '0101' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(res.data.success === false && res.data.stage === 'AWAITING_DATE' && res.data.error === 'PAST_DATE', 'Test 2.4: Past date 0101 rejected with PAST_DATE error');

// Test 2.5: Invalid Time format
// Set valid date 1409
req = { query: { CallSid: negCall2, digits: '1409' } };
res = createMockRes();
await handleExotelPassthru(req, res);
// Enter invalid time 2500*
req = { query: { CallSid: negCall2, digits: '2500*' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(res.data.success === false && res.data.stage === 'AWAITING_TIME', 'Test 2.5: Invalid time 2500* rejected');

// Test 2.6: User Cancellation
// Set valid time 0300#
req = { query: { CallSid: negCall2, digits: '0300#' } };
res = createMockRes();
await handleExotelPassthru(req, res);
// Skip quantity
req = { query: { CallSid: negCall2, digits: '*' } };
res = createMockRes();
await handleExotelPassthru(req, res);
// Enter 2 to cancel
req = { path: '/api/voice/exotel', query: { CallSid: negCall2, digits: '2' } };
res = createMockRes();
await handleExotelPassthru(req, res);
console.log('\n--- EXACT EXOTEL CANCELLATION PASSTHRU RESPONSE ---');
console.log('HTTP Status :', res.statusCode);
console.log('Content-Type:', res.headers['Content-Type']);
console.log('Body        :', res.data);
console.log('----------------------------------------------------\n');

assert(
  res.statusCode === 200 &&
  res.headers['Content-Type'] === 'text/plain' &&
  res.data === 'CANCELLED',
  'Test 2.6: Actual Exotel Passthru Route /api/voice/exotel returns HTTP 200, Content-Type: text/plain, body: CANCELLED on cancellation'
);

// Test 2.7: Expired Session
const negCall3 = 'TEST_EXPIRED_' + Date.now();
// Create active session
req = { query: { CallSid: negCall3, digits: '10029384' } };
res = createMockRes();
await handleExotelPassthru(req, res);

// Mutate lastActivity to 25 minutes ago
const sessionObj = exotelSessions.get(negCall3);
sessionObj.lastActivity = Date.now() - (25 * 60 * 1000); // 25 min ago

req = { query: { CallSid: negCall3, digits: '5' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(res.data.success === false && res.data.stage === 'ERROR' && res.data.error === 'SESSION_EXPIRED', 'Test 2.7: Inactive session (>20 min) returns SESSION_EXPIRED');

console.log('\n📌 Scenario 3: Exotel Dynamic Greeting Endpoint (GET /api/voice/exotel/greeting)');

// Test 3.1: Valid session in AWAITING_MANDI stage returns plain text speech prompt
const greetingCallSid = 'TEST_GREETING_CALL_SID_' + Date.now();
await handleExotelPassthru({ query: { CallSid: greetingCallSid, digits: '10029384' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: greetingCallSid, digits: '5' } }, createMockRes());

req = { query: { CallSid: greetingCallSid } };
res = createMockRes();
await handleExotelGreeting(req, res);

assert(res.statusCode === 200, 'Test 3.1a: GET /api/voice/exotel/greeting returns HTTP 200');
assert(res.headers['Content-Type'] === 'text/plain', 'Test 3.1b: GET /api/voice/exotel/greeting sets Content-Type text/plain');
assert(
  typeof res.data === 'string' &&
  res.data.includes('Your selected crop is Pulses') &&
  res.data.includes('Press 1 for Nizamabad APMC Mandi'),
  'Test 3.1c: Dynamic greeting speech text matches selected crop and mandi options'
);

// Test 3.2: Non-existent CallSid returns HTTP 404 text response
req = { query: { CallSid: 'NON_EXISTENT_CALL_SID' } };
res = createMockRes();
await handleExotelGreeting(req, res);
assert(res.statusCode === 404, 'Test 3.2a: Unknown CallSid returns HTTP 404');
assert(res.data === 'Your session has expired. Please call again.', 'Test 3.2b: Unknown CallSid returns spoken error message');

// Test 3.3: Missing mandiOptions safe fallback
const fallbackCallSid = 'TEST_FALLBACK_CALL_SID_' + Date.now();
await handleExotelPassthru({ query: { CallSid: fallbackCallSid, digits: '10029384' } }, createMockRes());
const sess = exotelSessions.get(fallbackCallSid);
sess.stage = 'AWAITING_MANDI';
sess.mandiOptions = [];

// Test 3.4: HEAD Request for valid session returns HTTP 200 with Content-Type text/plain and empty body
req = { method: 'HEAD', query: { CallSid: greetingCallSid } };
res = createMockRes();
await handleExotelGreeting(req, res);
assert(res.statusCode === 200, 'Test 3.4a: HEAD /api/voice/exotel/greeting returns HTTP 200 for valid CallSid');
assert(res.headers['Content-Type'] === 'text/plain', 'Test 3.4b: HEAD /api/voice/exotel/greeting returns Content-Type text/plain');

// Test 3.5: HEAD Request for invalid CallSid returns HTTP 404
req = { method: 'HEAD', query: { CallSid: 'NON_EXISTENT_CALL_SID' } };
res = createMockRes();
await handleExotelGreeting(req, res);
assert(res.statusCode === 404, 'Test 3.5a: HEAD /api/voice/exotel/greeting returns HTTP 404 for invalid CallSid');
assert(res.headers['Content-Type'] === 'text/plain', 'Test 3.5b: HEAD /api/voice/exotel/greeting sets Content-Type text/plain on 404');

// Test 3.6: Lowercase callSid query parameter support
req = { method: 'GET', query: { callSid: greetingCallSid } };
res = createMockRes();
await handleExotelGreeting(req, res);
assert(res.statusCode === 200 && typeof res.data === 'string' && res.data.includes('Pulses'), 'Test 3.6: GET /api/voice/exotel/greeting supports lowercase req.query.callSid');

// Test 3.7: BOOKED Stage Dynamic Greeting (GET & HEAD)
req = { query: { CallSid: happyCallSid2 } };
res = createMockRes();
await handleExotelGreeting(req, res);
assert(
  res.statusCode === 200 &&
  res.headers['Content-Type'] === 'text/plain' &&
  res.data.includes('Your booking has been confirmed successfully') &&
  res.data.includes('Your booking ID is') &&
  res.data.includes('Your token number is') &&
  res.data.includes('Your mandi is') &&
  res.data.includes('Your crop is') &&
  res.data.includes('Your date is') &&
  res.data.includes('Your time slot is') &&
  res.data.includes('Thank you for using KrishiDwaar'),
  'Test 3.7a: GET /api/voice/exotel/greeting returns plain text confirmation spoken greeting for BOOKED stage'
);

req = { method: 'HEAD', query: { CallSid: happyCallSid2 } };
res = createMockRes();
await handleExotelGreeting(req, res);
assert(res.statusCode === 200 && res.headers['Content-Type'] === 'text/plain', 'Test 3.7b: HEAD /api/voice/exotel/greeting returns HTTP 200 text/plain for BOOKED stage');

// Test 3.8: CANCELLED Stage Dynamic Greeting (GET & HEAD)
req = { query: { CallSid: negCall2 } };
res = createMockRes();
await handleExotelGreeting(req, res);
assert(
  res.statusCode === 200 &&
  res.headers['Content-Type'] === 'text/plain' &&
  res.data === 'Your booking has been cancelled successfully. No slot has been booked. Thank you for using KrishiDwaar.',
  'Test 3.8a: GET /api/voice/exotel/greeting returns plain text cancellation greeting for CANCELLED stage'
);

req = { method: 'HEAD', query: { CallSid: negCall2 } };
res = createMockRes();
await handleExotelGreeting(req, res);
assert(res.statusCode === 200 && res.headers['Content-Type'] === 'text/plain', 'Test 3.8b: HEAD /api/voice/exotel/greeting returns HTTP 200 text/plain for CANCELLED stage');

console.log('\n📌 Scenario 4: Detailed Integration Tests (Quantity Formats, Farmer 10029002 & Revalidation)');

// Clean up test bookings for farmer 10029002
db.data.bookings = db.data.bookings.filter(b => b.farmerId !== '10029002' || b.date !== '2026-09-20');
db.save();
if (supabase) {
  await supabase.from('bookings').delete().eq('farmer_id', '10029002').eq('date', '2026-09-20');
}

const call41 = 'TEST_CALL_10029002_' + Date.now();

// Step 4.1: Farmer 10029002 init and ID verification
await handleExotelPassthru({ query: { CallSid: call41, digits: '10029002' } }, createMockRes());
// Step 4.2: Select Pulses (Crop 5)
await handleExotelPassthru({ query: { CallSid: call41, digits: '5' } }, createMockRes());
// Step 4.3: Select Mandi Option 2 (or available option)
req = { query: { CallSid: call41, digits: '2' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(res.data.success === true && res.data.stage === 'AWAITING_DATE', 'Test 4.1: Farmer 10029002 selects Crop 5 & Mandi Option 2');

// Step 4.4: Select Date 2009 (20 September 2026)
req = { query: { CallSid: call41, digits: '2009' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(res.data.success === true && res.data.stage === 'AWAITING_TIME' && res.data.date === '2026-09-20', 'Test 4.2: Selected Date 2009 -> 2026-09-20');

// Step 4.5: Select Time 0430* (04:30 AM -> 04:30 - 05:00)
req = { query: { CallSid: call41, digits: '0430*' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(res.data.success === true && res.data.stage === 'AWAITING_QUANTITY' && res.data.timeSlot === '04:30 - 05:00', 'Test 4.3: Entered Time 0430* -> Slot 04:30 - 05:00');

// Step 4.6: Test Quantity 100*
req = { query: { CallSid: call41, digits: '100*' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(
  res.data.success === true &&
  res.data.stage === 'READY_FOR_CONFIRMATION' &&
  res.data.summary.expectedQuantity === 100,
  'Test 4.4: Quantity 100* parsed correctly as 100 kg'
);

// Step 4.7: Invalid confirmation choice stays in READY_FOR_CONFIRMATION
req = { query: { CallSid: call41, digits: '9' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(
  res.data.success === false &&
  res.data.stage === 'READY_FOR_CONFIRMATION' &&
  res.data.error === 'INVALID_CONFIRMATION_CHOICE',
  'Test 4.5: Invalid confirmation choice 9 rejected, session remains in READY_FOR_CONFIRMATION'
);

// Step 4.8: Confirm booking (1)
const broadcastEvents4 = [];
req = { path: '/api/voice/exotel/test', query: { CallSid: call41, digits: '1' } };
res = createMockRes();
await handleExotelPassthru(req, res, (evt, data) => broadcastEvents4.push({ evt, data }));
assert(
  res.data.success === true &&
  res.data.stage === 'BOOKED' &&
  res.data.booking.farmerId === '10029002' &&
  res.data.booking.source === 'VOICE_IVR',
  'Test 4.6: Confirmed booking created for Farmer 10029002 with source VOICE_IVR'
);

// Step 4.9: Verify WebSocket broadcast
assert(
  broadcastEvents4.some(e => e.evt === 'BOOKING_CREATED' && e.data.farmerId === '10029002'),
  'Test 4.7: WebSocket BOOKING_CREATED broadcast emitted for Farmer 10029002'
);

// Step 4.10: Test duplicate active booking prevention
const call42 = 'TEST_CALL_DUP_' + Date.now();
await handleExotelPassthru({ query: { CallSid: call42, digits: '10029002' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: call42, digits: '5' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: call42, digits: '2' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: call42, digits: '2009' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: call42, digits: '0430*' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: call42, digits: '*' } }, createMockRes()); // skip quantity
req = { query: { CallSid: call42, digits: '1' } };
res = createMockRes();
await handleExotelPassthru(req, res);
assert(
  res.data.success === false &&
  res.data.stage === 'ERROR' &&
  res.data.error === 'DUPLICATE_BOOKING',
  'Test 4.8: Duplicate booking attempt for same farmer and date rejected during final revalidation'
);

console.log('\n📌 Scenario 5: SMS Recipient Verification (Caller Number vs Farmer Profile Mobile)');

// Test 5.1: Farmer profile mobile (9876543210) differs from Exotel From caller number (9123456789)
const callSms1 = 'TEST_CALL_SMS_' + Date.now();
const farmerProfile = await db.getFarmerById('10029384'); // mobile: '9876543210'

// Clean up test bookings for farmer 10029384 on 2026-09-25
db.data.bookings = db.data.bookings.filter(b => b.farmerId !== '10029384' || b.date !== '2026-09-25');
db.save();
if (supabase) {
  await supabase.from('bookings').delete().eq('farmer_id', '10029384').eq('date', '2026-09-25');
}

// Step 5.1a: Incoming request with From = '9123456789' (caller number)
await handleExotelPassthru({ query: { CallSid: callSms1, From: '9123456789', digits: '10029384' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: callSms1, digits: '5' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: callSms1, digits: '1' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: callSms1, digits: '2509' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: callSms1, digits: '0300#' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: callSms1, digits: '100*' } }, createMockRes());

const sessionSms = exotelSessions.get(callSms1);
assert(
  sessionSms.callerNumber === '9123456789' &&
  sessionSms.farmerMobile === farmerProfile.mobile &&
  sessionSms.callerNumber !== sessionSms.farmerMobile,
  'Test 5.1: callerNumber (9123456789) stored in session separately from farmerMobile (9876543210)'
);

// Step 5.1b: Confirm booking and verify SMS recipient is callerNumber
req = { query: { CallSid: callSms1, digits: '1', format: 'json' } };
res = createMockRes();
await handleExotelPassthru(req, res);

assert(
  res.data.success === true &&
  res.data.stage === 'BOOKED' &&
  res.data.smsStatus === 'SMS_PENDING_CONFIGURATION',
  'Test 5.2: Booking confirmed successfully with SMS dispatch triggered to callerNumber'
);

// Test 5.2: Missing From callerNumber returns SMS_RECIPIENT_UNAVAILABLE
const callSms2 = 'TEST_CALL_NO_FROM_' + Date.now();
db.data.bookings = db.data.bookings.filter(b => b.farmerId !== '10029002' || b.date !== '2026-09-26');
db.save();
if (supabase) {
  await supabase.from('bookings').delete().eq('farmer_id', '10029002').eq('date', '2026-09-26');
}

// Pass call without From parameter
await handleExotelPassthru({ query: { CallSid: callSms2, digits: '10029002' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: callSms2, digits: '5' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: callSms2, digits: '1' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: callSms2, digits: '2609' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: callSms2, digits: '0300#' } }, createMockRes());
await handleExotelPassthru({ query: { CallSid: callSms2, digits: '*' } }, createMockRes());

const sessionNoFrom = exotelSessions.get(callSms2);
assert(sessionNoFrom.callerNumber === null, 'Test 5.3: callerNumber is null when Exotel From parameter is missing');

req = { query: { CallSid: callSms2, digits: '1', format: 'json' } };
res = createMockRes();
await handleExotelPassthru(req, res);

assert(
  res.data.success === true &&
  res.data.stage === 'BOOKED' &&
  res.data.smsStatus === 'SMS_RECIPIENT_UNAVAILABLE' &&
  !res.data.prompt.includes('sent to your'),
  'Test 5.4: Missing callerNumber returns SMS_RECIPIENT_UNAVAILABLE and prompt does not claim SMS was sent'
);

console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('====================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
