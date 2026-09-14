import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

import { db, supabase } from '../db.js';
import { handleExotelPassthru, exotelSessions } from '../voiceHandler.js';

async function runEndToEndIntegrationTests() {
  console.log('====================================================');
  console.log('🧪 SECTION N: COMPLETE END-TO-END INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  const assertTest = (description, condition) => {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS [Test ${totalTests}]: ${description}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL [Test ${totalTests}]: ${description}`);
    }
  };

  // --- B. FARMER PORTAL END-TO-END ---
  console.log('📌 B. Farmer Portal End-to-End Verification');
  
  const farmer = await db.getFarmerById('10029384');
  assertTest('Farmer Login & Lookup (10029384)', farmer && farmer.name === 'Ramesh Verma');

  const crops = await db.getCrops();
  assertTest('Crops Master List Read from Supabase', Array.isArray(crops) && crops.length === 6);

  const mandis = await db.getMandis();
  assertTest('Mandis Master List Read from Supabase', Array.isArray(mandis) && mandis.length === 4);

  const dates = await db.getDateAvailability('MANDI01', 'crop-1');
  assertTest('Date Availability 30-Day Read', Array.isArray(dates) && dates.length === 30);

  const todayStr = new Date().toISOString().split('T')[0];
  const slots = await db.getTimeSlots('MANDI01', todayStr);
  assertTest('Time Slots 12-Slot List Read', Array.isArray(slots) && slots.length === 12);

  // --- C. MANDI OFFICER & CROSS-PORTAL END-TO-END WORKFLOW (SECTION E) ---
  console.log('\n📌 C & E. Cross-Portal Full Lifecycle (Booking -> Gate -> Serve -> Bill -> Admin Stats)');

  const e2eDate = todayStr;
  const e2eSlot = '10:00 - 10:30';

  // Step 1: Create Farmer Booking
  let e2eBooking;
  try {
    // Clear any existing active booking for farmer today if present
    const existing = await db.getFarmerBookings('10029384');
    const activeToday = existing.find(b => b.date === e2eDate && (b.bookingStatus || 'ACTIVE') === 'ACTIVE' && b.procurementStatus !== 'Completed');
    if (activeToday) {
      await supabase.from('bookings').update({ booking_status: 'CANCELLED' }).eq('id', activeToday.id);
    }

    e2eBooking = await db.createBooking({
      farmerId: '10029384',
      mandiId: 'MANDI01',
      cropId: 'crop-1',
      date: e2eDate,
      timeSlot: e2eSlot,
      expectedQty: 50,
      source: 'WEB'
    });
  } catch (err) {
    console.error('Booking Creation Error:', err.message);
  }

  assertTest('Step 1: Farmer Portal Booking Created in Supabase', e2eBooking && e2eBooking.id && e2eBooking.tokenNumber);

  // Step 2: Verify booking visible in Farmer & Mandi queries
  const farmerBookings = await db.getFarmerBookings('10029384');
  const mandiBookings = await db.getMandiBookings('MANDI01', e2eDate);
  const foundInFarmer = farmerBookings.some(b => b.id === e2eBooking.id);
  const foundInMandi = mandiBookings.some(b => b.id === e2eBooking.id);

  assertTest('Step 2: Booking visible in Farmer & Mandi Officer queries', foundInFarmer && foundInMandi);

  // Step 3: Gate Arrival Verification (Mandi Officer Portal)
  let verifyResult;
  try {
    verifyResult = await db.verifyArrival('MANDI01', { tokenNumber: e2eBooking.tokenNumber });
  } catch (err) {
    console.error('Verify Arrival Error:', err.message);
  }

  assertTest('Step 3: Gate Arrival Verified via Token', verifyResult && verifyResult.booking.arrivalStatus === 'Verified / Arrived');

  // Step 4: Verify duplicate arrival verification is blocked
  let duplicateVerifyBlocked = false;
  try {
    await db.verifyArrival('MANDI01', { tokenNumber: e2eBooking.tokenNumber });
  } catch (err) {
    duplicateVerifyBlocked = err.message.includes('Duplicate verification rejected') || err.message.includes('already been verified');
  }

  assertTest('Step 4: Duplicate Gate Arrival Verification Blocked', duplicateVerifyBlocked);

  // Step 5: Farmer Live Queue Tracker Check
  const farmerQueue = await db.getFarmerQueueStatus('10029384');
  assertTest('Step 5: Farmer Queue Status reflects Arrived & Waiting', farmerQueue && farmerQueue.hasActiveQueue && farmerQueue.procurementStage === 'WAITING');

  // Step 6: Mandi Officer Starts Serving
  let startedBooking;
  try {
    startedBooking = await db.startProcurement('MANDI01', e2eBooking.id);
  } catch (err) {
    console.error('Start Procurement Error:', err.message);
  }

  assertTest('Step 6: Mandi Officer Starts Procurement (IN_PROGRESS)', startedBooking && startedBooking.procurementStage === 'IN_PROGRESS');

  // Step 7: Complete Procurement & Bill Generation
  let processResult;
  try {
    processResult = await db.processProcurement('MANDI01', {
      bookingId: e2eBooking.id,
      actualQty: 48.5,
      billedBy: 'Officer Rajesh Kumar'
    });
  } catch (err) {
    console.error('Process Procurement Error:', err.message);
  }

  assertTest('Step 7: Procurement Completed & Bill Generated', processResult && processResult.bill && processResult.bill.actualQty === 48.5 && processResult.bill.billedBy === 'Officer Rajesh Kumar');

  // Step 8: Verify duplicate billing is blocked
  let duplicateBillingBlocked = false;
  try {
    await db.processProcurement('MANDI01', {
      bookingId: e2eBooking.id,
      actualQty: 50,
      billedBy: 'Officer Rajesh Kumar'
    });
  } catch (err) {
    duplicateBillingBlocked = err.message.includes('already been completed') || err.message.includes('Duplicate procurement');
  }

  assertTest('Step 8: Duplicate Procurement Billing Blocked', duplicateBillingBlocked);

  // Step 9: Bill appears in Farmer Portal
  const farmerBills = await db.getFarmerBills('10029384');
  const billInFarmer = farmerBills.some(b => b.bookingId === e2eBooking.id);
  assertTest('Step 9: Bill visible in Farmer Portal bills history', billInFarmer);

  // Step 10: Admin Portal Stats update
  const adminStats = await db.getAdminStats(e2eDate);
  assertTest('Step 10: Admin Stats updated with Completed count and Procured Qty', adminStats && adminStats.todayCompleted >= 1 && adminStats.totalQtyProcuredToday > 0);

  // --- F. EXOTEL IVR → WEBSITE INTEGRATION ---
  console.log('\n📌 F. Exotel IVR Full Calling Flow Simulation');

  const voiceSessionKey = `E2E_VOICE_CALL_${Date.now()}`;
  const makeVoiceReq = async (digits, stageOverride) => {
    const req = {
      query: { CallSid: voiceSessionKey, From: '9123456789', digits, format: 'json' },
      body: {},
      path: '/api/voice/exotel/test'
    };
    let resJson = null;
    const res = {
      status: (code) => ({
        json: (data) => { resJson = data; return data; },
        send: (text) => { resJson = text; return text; }
      }),
      setHeader: () => {},
      type: () => {}
    };
    await handleExotelPassthru(req, res);
    return resJson;
  };

  // Flow: INIT -> 10029002 -> 1 (Paddy) -> 1 (Mandi) -> 2709 (Date: Sept 27) -> 0300# (Time) -> 60* (Qty) -> 1 (Confirm)
  await makeVoiceReq('10029002');
  await makeVoiceReq('1');
  await makeVoiceReq('1');
  await makeVoiceReq('2709');
  await makeVoiceReq('0300#');
  await makeVoiceReq('60*');
  const voiceConfirmRes = await makeVoiceReq('1');

  assertTest('Voice IVR Session Completed & Booking Created', voiceConfirmRes && voiceConfirmRes.success && voiceConfirmRes.stage === 'BOOKED');

  const voiceBkId = voiceConfirmRes && voiceConfirmRes.booking ? voiceConfirmRes.booking.bookingId : null;
  let voiceFoundInSupabase = false;
  if (voiceBkId) {
    const { data: vRow } = await supabase.from('bookings').select('*').eq('id', voiceBkId).single();
    voiceFoundInSupabase = Boolean(vRow && vRow.source === 'VOICE_IVR');
  }

  assertTest('Voice IVR Booking stored in Supabase with source=VOICE_IVR', voiceFoundInSupabase);

  // --- G. FAILURE / EDGE CASE TESTING ---
  console.log('\n📌 G. Failure & Edge Case Testing');

  // Edge 1: Invalid Farmer ID
  let invalidFarmerErr = false;
  try {
    await db.createBooking({ farmerId: '99999999', mandiId: 'MANDI01', cropId: 'crop-1', date: todayStr, timeSlot: '11:00 - 11:30' });
  } catch (err) {
    invalidFarmerErr = err.message.includes('Invalid Farmer');
  }
  assertTest('Edge 1: Invalid Farmer ID rejected gracefully', invalidFarmerErr);

  // Edge 2: Mandi not accepting crop
  let unacceptedCropErr = false;
  try {
    await db.rescheduleBooking('10029384', e2eBooking.id, todayStr, '11:00 - 11:30');
  } catch (err) {
    unacceptedCropErr = err.message.includes('does not accept') || err.message.includes('already') || err.message.includes('Cannot reschedule');
  }
  assertTest('Edge 2: Invalid Mandi/Crop or Reschedule on completed booking rejected', unacceptedCropErr);

  // Edge 3: Verification for wrong Mandi
  let wrongMandiVerifyErr = false;
  try {
    await db.verifyArrival('MANDI02', { tokenNumber: 'TKN-INVALID-999' });
  } catch (err) {
    wrongMandiVerifyErr = err.message.includes('No matching booking found');
  }
  assertTest('Edge 3: Verification with non-existent token rejected', wrongMandiVerifyErr);

  // Edge 4: Offline Fail-safe simulation
  db.supabase = null;
  let offlineFallbackPassed = false;
  try {
    const fallbackMandis = await db.getMandis();
    const fallbackSlots = await db.getTimeSlots('MANDI01', todayStr);
    const fallbackStats = await db.getAdminStats(todayStr);
    offlineFallbackPassed = Array.isArray(fallbackMandis) && Array.isArray(fallbackSlots) && Boolean(fallbackStats);
  } catch (err) {
    offlineFallbackPassed = false;
  } finally {
    db.supabase = undefined; // restore default
  }
  assertTest('Edge 4: Offline database simulation falls back safely to local JSON', offlineFallbackPassed);

  console.log('\n====================================================');
  console.log(`📊 END-TO-END INTEGRATION SUITE SUMMARY: ${passedTests} / ${totalTests} PASSED`);
  console.log('====================================================\n');
}

runEndToEndIntegrationTests().catch(err => {
  console.error('Fatal End-to-End Integration Error:', err);
  process.exit(1);
});
