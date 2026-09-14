import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

import { db, supabase } from '../db.js';

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

const cleanupConcurrencyTestData = async () => {
  if (supabase) {
    // Delete test procurements first to satisfy FK constraints
    const { data: testBookings } = await supabase.from('bookings').select('id').gte('date', '2026-09-14');
    if (testBookings && testBookings.length > 0) {
      // Exclude seed/historical bookings
      const testIds = testBookings.map(b => b.id).filter(id => id.startsWith('BK-178') || id.startsWith('BK-TEST') || id.startsWith('BK-CONC'));
      if (testIds.length > 0) {
        await supabase.from('procurements').delete().in('booking_id', testIds);
        await supabase.from('bookings').delete().in('id', testIds);
      }
    }
  }
};

async function runConcurrencyTestSuite() {
  console.log('====================================================');
  console.log('🧪 PHASE 2: SUPABASE CONCURRENCY & MUTATION TEST SUITE');
  console.log('====================================================\n');

  await cleanupConcurrencyTestData();

  const todayStr = new Date().toISOString().split('T')[0];

  try {
    // --------------------------------------------------
    // TEST 1: Normal Farmer Portal Booking
    // --------------------------------------------------
    console.log('📌 Test 1: Normal Farmer Portal Booking');
    const booking1 = await db.createBooking({
      farmerId: '10029384',
      mandiId: 'MANDI01',
      cropId: 'crop-1',
      date: '2026-10-10',
      timeSlot: '09:00 - 09:30',
      expectedQty: 50,
      source: 'WEB'
    });

    assert(
      booking1 &&
      booking1.id &&
      booking1.tokenNumber &&
      booking1.qrPayload &&
      booking1.expectedQty === 50 &&
      booking1.source === 'WEB' &&
      booking1.bookingStatus === 'ACTIVE',
      'Test 1: Normal WEB booking created with expected shape and attributes'
    );

    // --------------------------------------------------
    // TEST 2: Normal Exotel Voice Booking
    // --------------------------------------------------
    console.log('\n📌 Test 2: Normal Exotel Voice Booking');
    const booking2 = await db.createBooking({
      farmerId: '10029002',
      mandiId: 'MANDI02',
      cropId: 'crop-2',
      date: '2026-10-10',
      timeSlot: '10:00 - 10:30',
      expectedQty: 100,
      source: 'VOICE_IVR'
    });

    assert(
      booking2 &&
      booking2.id &&
      booking2.tokenNumber &&
      booking2.source === 'VOICE_IVR',
      'Test 2: Normal VOICE_IVR booking created with token number'
    );

    // --------------------------------------------------
    // TEST 3: Duplicate Booking Prevention
    // --------------------------------------------------
    console.log('\n📌 Test 3: Duplicate Booking Prevention');
    let dupError = null;
    try {
      await db.createBooking({
        farmerId: '10029384',
        mandiId: 'MANDI01',
        cropId: 'crop-1',
        date: '2026-10-10',
        timeSlot: '11:00 - 11:30',
        expectedQty: 25,
        source: 'WEB'
      });
    } catch (err) {
      dupError = err.message;
    }

    assert(
      dupError && dupError.includes('already have an active procurement booking'),
      'Test 3: Duplicate active booking for same farmer on same date rejected'
    );

    // --------------------------------------------------
    // TEST 4: Full Slot Capacity Booking
    // --------------------------------------------------
    console.log('\n📌 Test 4: Full Slot Capacity Booking');
    // Slot capacity = 2 per 30-min slot.
    // Fill slot 11:00 - 11:30 on 2026-10-11 at MANDI01 with 2 bookings
    await db.createBooking({
      farmerId: '10029001',
      mandiId: 'MANDI01',
      cropId: 'crop-1',
      date: '2026-10-11',
      timeSlot: '11:00 - 11:30',
      expectedQty: 40,
      source: 'WEB'
    });

    await db.createBooking({
      farmerId: '10029003',
      mandiId: 'MANDI01',
      cropId: 'crop-1',
      date: '2026-10-11',
      timeSlot: '11:00 - 11:30',
      expectedQty: 45,
      source: 'WEB'
    });

    let slotFullError = null;
    try {
      await db.createBooking({
        farmerId: '10029004',
        mandiId: 'MANDI01',
        cropId: 'crop-1',
        date: '2026-10-11',
        timeSlot: '11:00 - 11:30',
        expectedQty: 50,
        source: 'WEB'
      });
    } catch (err) {
      slotFullError = err.message;
    }

    assert(
      slotFullError && (slotFullError.includes('full') || slotFullError.includes('available')),
      'Test 4: 3rd booking request when slot capacity (2) is reached is rejected'
    );

    // --------------------------------------------------
    // TEST 5: Simultaneous Booking Requests for Last Slot
    // --------------------------------------------------
    console.log('\n📌 Test 5: Simultaneous Booking Requests for Last Available Slot');
    // Pre-occupy 1 slot out of 2 for 2026-10-12 at MANDI01 slot '14:00 - 14:30'
    await db.createBooking({
      farmerId: '10029001',
      mandiId: 'MANDI01',
      cropId: 'crop-1',
      date: '2026-10-12',
      timeSlot: '14:00 - 14:30',
      expectedQty: 30,
      source: 'WEB'
    });

    // Now send 2 simultaneous booking requests for the remaining 1 slot
    const reqA = db.createBooking({
      farmerId: '10029005',
      mandiId: 'MANDI01',
      cropId: 'crop-1',
      date: '2026-10-12',
      timeSlot: '14:00 - 14:30',
      expectedQty: 35,
      source: 'WEB'
    });

    const reqB = db.createBooking({
      farmerId: '10029006',
      mandiId: 'MANDI01',
      cropId: 'crop-1',
      date: '2026-10-12',
      timeSlot: '14:00 - 14:30',
      expectedQty: 40,
      source: 'WEB'
    });

    const simBookingResults = await Promise.allSettled([reqA, reqB]);
    const simBookingFulfilled = simBookingResults.filter(r => r.status === 'fulfilled');
    const simBookingRejected = simBookingResults.filter(r => r.status === 'rejected');

    assert(
      simBookingFulfilled.length === 1 && simBookingRejected.length === 1,
      'Test 5: Exactly ONE of two simultaneous requests for the last slot succeeded (concurrency safe)'
    );

    // --------------------------------------------------
    // TEST 6: Two Simultaneous Arrival Verification Requests
    // --------------------------------------------------
    console.log('\n📌 Test 6: Two Simultaneous Arrival Verification Requests');
    const verifyTestBooking = await db.createBooking({
      farmerId: '10029384',
      mandiId: 'MANDI01',
      cropId: 'crop-1',
      date: todayStr,
      timeSlot: '17:00 - 17:30',
      expectedQty: 50,
      source: 'WEB'
    });

    const vReq1 = db.verifyArrival('MANDI01', { tokenNumber: verifyTestBooking.tokenNumber });
    const vReq2 = db.verifyArrival('MANDI01', { tokenNumber: verifyTestBooking.tokenNumber });

    const vResults = await Promise.allSettled([vReq1, vReq2]);
    const vFulfilled = vResults.filter(r => r.status === 'fulfilled' && r.value?.booking);
    const vFailed = vResults.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value?.booking));

    assert(
      vFulfilled.length === 1 && vFailed.length === 1,
      'Test 6: Two simultaneous verifyArrival calls resulted in exactly 1 success and 1 rejection'
    );

    // --------------------------------------------------
    // TEST 7: Two Simultaneous Procurement Requests
    // --------------------------------------------------
    console.log('\n📌 Test 7: Two Simultaneous Procurement Billing Requests');
    const procTestBooking = await db.createBooking({
      farmerId: '10029002',
      mandiId: 'MANDI02',
      cropId: 'crop-2',
      date: todayStr,
      timeSlot: '17:30 - 18:00',
      expectedQty: 80,
      source: 'WEB'
    });

    // Mark arrived first
    await db.verifyArrival('MANDI02', { tokenNumber: procTestBooking.tokenNumber });
    await db.startProcurement('MANDI02', procTestBooking.id);

    const pPayload = {
      bookingId: procTestBooking.id,
      actualQty: 78.5,
      billedBy: 'Test Officer'
    };

    const pReq1 = db.processProcurement('MANDI02', pPayload);
    const pReq2 = db.processProcurement('MANDI02', pPayload);

    const pResults = await Promise.allSettled([pReq1, pReq2]);
    const pFulfilled = pResults.filter(r => r.status === 'fulfilled' && r.value?.bill);
    const pFailed = pResults.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value?.bill));

    assert(
      pFulfilled.length === 1 && pFailed.length === 1,
      'Test 7: Two simultaneous processProcurement calls resulted in exactly 1 success and 1 rejection (no duplicate bills)'
    );

    // --------------------------------------------------
    // TEST 8: Cancel + Verify Race Condition
    // --------------------------------------------------
    console.log('\n📌 Test 8: Cancel + Verify Race Condition');
    const raceBooking1 = await db.createBooking({
      farmerId: '10029001',
      mandiId: 'MANDI01',
      cropId: 'crop-1',
      date: todayStr,
      timeSlot: '18:00 - 18:30',
      expectedQty: 50,
      source: 'WEB'
    });

    const raceCancelReq = db.cancelBooking('10029001', raceBooking1.id);
    const raceVerifyReq = db.verifyArrival('MANDI01', { tokenNumber: raceBooking1.tokenNumber });

    const race1Results = await Promise.allSettled([raceCancelReq, raceVerifyReq]);
    const race1Fulfilled = race1Results.filter(r => r.status === 'fulfilled');

    // Fetch final state from Supabase
    const { data: finalRace1 } = await supabase.from('bookings').select('booking_status, arrival_status').eq('id', raceBooking1.id).single();
    
    assert(
      race1Fulfilled.length === 1 &&
      (finalRace1.booking_status === 'CANCELLED' || finalRace1.arrival_status === 'Verified / Arrived') &&
      !(finalRace1.booking_status === 'CANCELLED' && finalRace1.arrival_status === 'Verified / Arrived'),
      'Test 8: Cancel + Verify race resolved deterministically without corrupting booking state'
    );

    // --------------------------------------------------
    // TEST 9: Reschedule + Verification Race Condition
    // --------------------------------------------------
    console.log('\n📌 Test 9: Reschedule + Verification Race Condition');
    const raceBooking2 = await db.createBooking({
      farmerId: '10029003',
      mandiId: 'MANDI02',
      cropId: 'crop-2',
      date: todayStr,
      timeSlot: '18:30 - 19:00',
      expectedQty: 60,
      source: 'WEB'
    });

    const raceReschedReq = db.rescheduleBooking('10029003', raceBooking2.id, '2026-10-21', '10:30 - 11:00');
    const raceVerifyReq2 = db.verifyArrival('MANDI02', { tokenNumber: raceBooking2.tokenNumber });

    const race2Results = await Promise.allSettled([raceReschedReq, raceVerifyReq2]);
    const race2Fulfilled = race2Results.filter(r => r.status === 'fulfilled');

    assert(
      race2Fulfilled.length === 1,
      'Test 9: Reschedule + Verification race resulted in exactly 1 operation succeeding'
    );

    // --------------------------------------------------
    // TEST 10: Supabase Unavailable During Critical Mutation
    // --------------------------------------------------
    console.log('\n📌 Test 10: Supabase Unavailable During Critical Mutation (Fail Safe)');
    const realSupabase = db.supabase;
    db.supabase = null; // Simulate offline/unavailable Supabase

    let offlineError = null;
    try {
      await db.createBooking({
        farmerId: '10029384',
        mandiId: 'MANDI01',
        cropId: 'crop-1',
        date: '2026-10-25',
        timeSlot: '09:00 - 09:30',
        expectedQty: 50,
        source: 'WEB'
      });
    } catch (err) {
      offlineError = err.message;
    }

    db.supabase = realSupabase; // Restore Supabase client

    assert(
      offlineError && (offlineError.includes('Database connection unavailable') || offlineError.includes('unavailable')),
      'Test 10: Critical mutation fails safely with clear error when Supabase is unavailable (no local-only un-synced mutation created)'
    );

  } catch (err) {
    console.error('❌ Unhandled error in concurrency test suite:', err);
  } finally {
    await cleanupConcurrencyTestData();
  }

  console.log('\n====================================================');
  console.log(`📊 CONCURRENCY TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runConcurrencyTestSuite();
