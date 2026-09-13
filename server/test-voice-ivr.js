import { handleExotelPassthru, exotelSessions } from './voiceHandler.js';
import { db } from './db.js';

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
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.data = obj;
      return this;
    }
  };
  return res;
};

console.log('====================================================');
console.log('🚀 RUNNING INBOUND VOICE / IVR BACKEND TEST SUITE');
console.log('====================================================\n');

// Clean up previous test bookings to ensure idempotent test runs
db.data.bookings = db.data.bookings.filter(b => b.farmerId !== '10029384' || b.date !== '2026-09-14');
db.save();

// --- 1. HAPPY PATH END-TO-END IVR BOOKING TEST ---
console.log('📌 Scenario 1: Happy Path Voice Booking Lifecycle (Farmer 10029384 - Ramesh Verma)');

const happyCallSid = 'TEST_HAPPY_CALL_SID_' + Date.now();

// Step 1: Initial call connection
let req = { query: { CallSid: happyCallSid, digits: '' } };
let res = createMockRes();
handleExotelPassthru(req, res);
assert(res.data.success === true && res.data.stage === 'AWAITING_FARMER_ID', 'Step 1: Init -> AWAITING_FARMER_ID');

// Step 2: Enter 8-digit Farmer ID (10029384)
req = { query: { CallSid: happyCallSid, digits: '"10029384"' } }; // Test Exotel quoted string
res = createMockRes();
handleExotelPassthru(req, res);
assert(res.data.success === true && res.data.stage === 'AWAITING_CROP' && res.data.farmerName === 'Ramesh Verma', 'Step 2: Verified Farmer ID 10029384 -> AWAITING_CROP');

// Step 3: Select Crop 5 (Pulses)
req = { query: { CallSid: happyCallSid, digits: '5' } };
res = createMockRes();
handleExotelPassthru(req, res);
assert(
  res.data.success === true &&
  res.data.stage === 'AWAITING_MANDI' &&
  res.data.crop.name === 'Pulses' &&
  Array.isArray(res.data.mandiOptions) &&
  res.data.mandiOptions.length > 0 &&
  res.data.prompt.includes('Pulses'),
  'Step 3: Selected Crop 5 (Pulses) -> Dynamic Mandis Generated & Prompt Built'
);

// Step 4: Select Mandi Option 1 (Warangal Agriculture Market)
req = { query: { CallSid: happyCallSid, digits: '1' } };
res = createMockRes();
handleExotelPassthru(req, res);
assert(
  res.data.success === true &&
  res.data.stage === 'AWAITING_DATE' &&
  res.data.selectedMandi.name.includes('Warangal'),
  'Step 4: Selected Mandi Option 1 (Warangal Agriculture Market) -> AWAITING_DATE'
);

// Step 5: Select Date 1409 (14 September)
req = { query: { CallSid: happyCallSid, digits: '1409' } };
res = createMockRes();
handleExotelPassthru(req, res);
assert(
  res.data.success === true &&
  res.data.stage === 'AWAITING_TIME' &&
  res.data.date === '2026-09-14',
  'Step 5: Entered Date 1409 -> AWAITING_TIME (Converted to 2026-09-14)'
);

// Step 6: Select Time 0300# (3:00 PM -> 15:00 - 15:30)
req = { query: { CallSid: happyCallSid, digits: '0300#' } };
res = createMockRes();
handleExotelPassthru(req, res);
assert(
  res.data.success === true &&
  res.data.stage === 'AWAITING_QUANTITY' &&
  res.data.timeSlot === '15:00 - 15:30',
  'Step 6: Entered Time 0300# -> AWAITING_QUANTITY (Slot: 15:00 - 15:30)'
);

// Step 7: Select Quantity 090 (90 kg)
req = { query: { CallSid: happyCallSid, digits: '090' } };
res = createMockRes();
handleExotelPassthru(req, res);
assert(
  res.data.success === true &&
  res.data.stage === 'READY_FOR_CONFIRMATION' &&
  res.data.summary.expectedQuantity === 90 &&
  res.data.summary.farmerName === 'Ramesh Verma',
  'Step 7: Entered Quantity 090 -> READY_FOR_CONFIRMATION (Summary Generated)'
);

// Step 8: Confirm Booking (1)
const broadcastEvents = [];
const mockBroadcast = (evt, data) => {
  broadcastEvents.push({ evt, data });
};

req = { query: { CallSid: happyCallSid, digits: '1' } };
res = createMockRes();
handleExotelPassthru(req, res, mockBroadcast);
if (!res.data.success) {
  console.log('❌ STEP 8 ERROR RESPONSE:', res.data);
}
assert(
  res.data.success === true &&
  res.data.stage === 'BOOKED' &&
  res.data.booking.source === 'VOICE_IVR' &&
  res.data.booking.tokenNumber.startsWith('TKN-') &&
  res.data.booking.qrIdentifier !== null &&
  res.data.smsStatus === 'SMS_PENDING_CONFIGURATION',
  'Step 8: Confirmed Booking -> BOOKED (source = VOICE_IVR, Token & QR created, SMS status recorded)'
);

assert(
  broadcastEvents.some(e => e.evt === 'VOICE_BOOKING_CREATED' && e.data.source === 'VOICE_IVR'),
  'Step 9: WebSocket broadcast VOICE_BOOKING_CREATED emitted'
);

// Verify persistence in Database
const createdBookingId = res.data.booking.bookingId;
const farmerBookings = db.getFarmerBookings('10029384');
const isFoundInFarmerPortal = farmerBookings.some(b => b.id === createdBookingId);
assert(isFoundInFarmerPortal, 'Step 10: Voice booking visible in Farmer Portal database query');

const mandiBookings = db.getMandiBookings('MANDI01', '2026-09-14');
const isFoundInMandiPortal = mandiBookings.some(b => b.id === createdBookingId);
assert(isFoundInMandiPortal, 'Step 11: Voice booking visible in Mandi Officer database query');

console.log('\n📌 Scenario 2: Invalid Input & Edge Cases');

// Test 2.1: Invalid 8-digit Farmer ID
const negCall1 = 'TEST_NEG_1_' + Date.now();
req = { query: { CallSid: negCall1, digits: '99999999' } };
res = createMockRes();
handleExotelPassthru(req, res);
assert(res.data.success === false && res.data.stage === 'AWAITING_FARMER_ID', 'Test 2.1: Invalid Farmer ID 99999999 rejected');

// Test 2.2: Invalid Crop Number
const negCall2 = 'TEST_NEG_2_' + Date.now();
// First authenticate farmer
req = { query: { CallSid: negCall2, digits: '10029384' } };
res = createMockRes();
handleExotelPassthru(req, res);
// Now enter invalid crop 9
req = { query: { CallSid: negCall2, digits: '9' } };
res = createMockRes();
handleExotelPassthru(req, res);
assert(res.data.success === false && res.data.stage === 'AWAITING_CROP', 'Test 2.2: Invalid crop option 9 rejected');

// Test 2.3: Invalid Mandi Option Number
// Set valid crop 5
req = { query: { CallSid: negCall2, digits: '5' } };
res = createMockRes();
handleExotelPassthru(req, res);
// Now enter invalid mandi option 99
req = { query: { CallSid: negCall2, digits: '99' } };
res = createMockRes();
handleExotelPassthru(req, res);
assert(res.data.success === false && res.data.stage === 'AWAITING_MANDI', 'Test 2.3: Invalid Mandi option 99 rejected');

// Test 2.4: Invalid Date format / Past Date
// Set valid mandi option 1
req = { query: { CallSid: negCall2, digits: '1' } };
res = createMockRes();
handleExotelPassthru(req, res);
// Enter past date 0101 (Jan 1)
req = { query: { CallSid: negCall2, digits: '0101' } };
res = createMockRes();
handleExotelPassthru(req, res);
assert(res.data.success === false && res.data.stage === 'AWAITING_DATE' && res.data.error === 'PAST_DATE', 'Test 2.4: Past date 0101 rejected with PAST_DATE error');

// Test 2.5: Invalid Time format
// Set valid date 1409
req = { query: { CallSid: negCall2, digits: '1409' } };
res = createMockRes();
handleExotelPassthru(req, res);
// Enter invalid time 2500*
req = { query: { CallSid: negCall2, digits: '2500*' } };
res = createMockRes();
handleExotelPassthru(req, res);
assert(res.data.success === false && res.data.stage === 'AWAITING_TIME', 'Test 2.5: Invalid time 2500* rejected');

// Test 2.6: User Cancellation
// Set valid time 0300#
req = { query: { CallSid: negCall2, digits: '0300#' } };
res = createMockRes();
handleExotelPassthru(req, res);
// Skip quantity
req = { query: { CallSid: negCall2, digits: '*' } };
res = createMockRes();
handleExotelPassthru(req, res);
// Enter 2 to cancel
req = { query: { CallSid: negCall2, digits: '2' } };
res = createMockRes();
handleExotelPassthru(req, res);
assert(res.data.success === true && res.data.stage === 'CANCELLED', 'Test 2.6: Press 2 on summary cancels booking');

// Test 2.7: Expired Session
const negCall3 = 'TEST_EXPIRED_' + Date.now();
// Create active session
req = { query: { CallSid: negCall3, digits: '10029384' } };
res = createMockRes();
handleExotelPassthru(req, res);

// Mutate lastActivity to 25 minutes ago
const sessionObj = exotelSessions.get(negCall3);
sessionObj.lastActivity = Date.now() - (25 * 60 * 1000); // 25 min ago

req = { query: { CallSid: negCall3, digits: '5' } };
res = createMockRes();
handleExotelPassthru(req, res);
assert(res.data.success === false && res.data.stage === 'ERROR' && res.data.error === 'SESSION_EXPIRED', 'Test 2.7: Inactive session (>20 min) returns SESSION_EXPIRED');

console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('====================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
