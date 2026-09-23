import { db } from './db.js';

console.log("=================================================");
console.log("🧪 RUNNING MANDI OFFICER HISTORY & OPERATIONAL TESTS");
console.log("=================================================");

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

const mandiId = "MANDI02"; // Nizamabad APMC Mandi
const todayStr = new Date().toISOString().split('T')[0];
const historicalDate = "2026-09-14";

try {
  // Test 1: Fetch History for Today
  const todayHistory = await db.getMandiHistoryForDate(mandiId, todayStr);
  assert(todayHistory && todayHistory.mandiId === mandiId, "History returned for today's local date");
  assert(typeof todayHistory.totalBooked === 'number', "totalBooked is a valid number");
  assert(typeof todayHistory.totalVerified === 'number', "totalVerified is a valid number");
  assert(typeof todayHistory.totalCompleted === 'number', "totalCompleted is a valid number");
  assert(typeof todayHistory.totalQty === 'number', "totalQty is a valid number");
  assert(typeof todayHistory.totalPayment === 'number', "totalPayment is a valid number");
  assert(Array.isArray(todayHistory.bookings), "bookings is an array");

  // Test 2: Fetch History for Historical Date (2026-09-14)
  const histData = await db.getMandiHistoryForDate(mandiId, historicalDate);
  assert(histData && histData.date === historicalDate, "History returned for historical date 2026-09-14");
  assert(Array.isArray(histData.bookings), "Bookings retrieved for historical date");

  // Test 3: Verify Dynamic Aggregation without relying solely on daily_reports
  assert(histData.totalBooked === histData.bookings.length, "totalBooked matches underlying transactional bookings count");
  
  // Test 4: Booking Source Classification (WEB vs VOICE IVR)
  assert(typeof histData.webBookingsCount === 'number', "webBookingsCount is calculated");
  assert(typeof histData.ivrBookingsCount === 'number', "ivrBookingsCount is calculated");
  assert(histData.webBookingsCount + histData.ivrBookingsCount === histData.totalBooked, "WEB + IVR bookings equal total bookings");

  // Test 5: Audit Reconciliation & Anomaly Detection
  assert(histData.reconciliation && typeof histData.reconciliation.bookingsCount === 'number', "Reconciliation metrics structure present");
  assert(Array.isArray(histData.reconciliation.warnings), "Reconciliation warnings array present");

  // Test 6: Crop Breakdown Aggregation
  assert(Array.isArray(histData.cropBreakdown), "Crop breakdown array present");

  // Test 7: Timeline Events Extraction
  assert(Array.isArray(histData.timeline), "Activity timeline array present");

  // Test 8: Enriched Bookings for Excel Export
  const enriched = await db.getEnrichedBookings(mandiId, historicalDate);
  assert(Array.isArray(enriched), "Enriched bookings retrieved for Excel export");
  if (enriched.length > 0) {
    const sample = enriched[0];
    assert(sample.tokenNumber != null, "Enriched booking contains token number");
    assert(sample.source === 'WEB' || sample.source === 'VOICE IVR', "Enriched booking source normalized to WEB or VOICE IVR");
  }

  // Test 9: Mandi Isolation Security
  let invalidMandiError = false;
  try {
    await db.getMandiHistoryForDate("NON_EXISTENT_MANDI", todayStr);
  } catch (err) {
    invalidMandiError = true;
  }
  assert(invalidMandiError, "Rejects request for non-existent Mandi ID");

  console.log("\n=================================================");
  console.log(`📊 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("=================================================");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
} catch (err) {
  console.error("CRITICAL HISTORY TEST EXCEPTION:", err);
  process.exit(1);
}
