import { db } from './db.js';

console.log("=================================================");
console.log("🧪 RUNNING SUITE OF LIVE QUEUE & WAITING TIME TESTS");
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

const testDateStr = "2029-12-31"; // Dedicated fixed future test date

try {
  const farmer1Id = "10029384"; // Ramesh Verma
  const farmer2Id = "10029002"; // Lakshmi Narasimha
  const farmer3Id = "10029003"; // Rajesh Singh
  const mandiA = "MANDI01";
  const mandiB = "MANDI02";

  // Clean up any old test bookings for testDateStr and futureDate
  const futureDate = "2029-12-30";
  db.data.bookings = db.data.bookings.filter(b => b.date !== testDateStr && b.date !== futureDate && !b.id.startsWith("TEST-"));
  db.data.procurements = db.data.procurements.filter(p => p.date !== testDateStr && p.date !== futureDate && !p.id.startsWith("TEST-"));
  db.save();
  if (db.supabase) {
    await db.supabase.from('procurements').delete().in('date', [testDateStr, futureDate]);
    await db.supabase.from('bookings').delete().in('date', [testDateStr, futureDate]);
  }

  // Create isolated test bookings for testDateStr
  const b1 = await db.createBooking({ farmerId: farmer1Id, mandiId: mandiA, cropId: "crop-1", date: testDateStr, timeSlot: "09:00 - 09:30" });
  const b2 = await db.createBooking({ farmerId: farmer2Id, mandiId: mandiA, cropId: "crop-3", date: testDateStr, timeSlot: "09:30 - 10:00" });
  const b3 = await db.createBooking({ farmerId: farmer3Id, mandiId: mandiB, cropId: "crop-2", date: testDateStr, timeSlot: "09:00 - 09:30" });

  console.log("\n1. ACTIVE QUEUE ENTRY & EXCLUSION RULES");
  // Test 1: Unverified bookings must NOT be in active queue
  let qA = await db.getMandiActiveQueue(mandiA, testDateStr);
  assert(!qA.activeQueue.some(b => b.id === b1.id), "Unverified booking B1 is excluded from active queue");

  // Mark B1, B2, B3 verified
  const nowIso = new Date().toISOString();
  b1.arrivalStatus = "Verified / Arrived";
  b1.procurementStage = "WAITING";
  b1.arrivedAt = nowIso;

  b2.arrivalStatus = "Verified / Arrived";
  b2.procurementStage = "WAITING";
  b2.arrivedAt = new Date(Date.now() + 1000).toISOString();

  b3.arrivalStatus = "Verified / Arrived";
  b3.procurementStage = "WAITING";
  b3.arrivedAt = nowIso;
  db.save();

  if (db.supabase) {
    await db.supabase.from('bookings').update({ arrival_status: "Verified / Arrived", procurement_stage: "WAITING", arrived_at: b1.arrivedAt }).eq('id', b1.id);
    await db.supabase.from('bookings').update({ arrival_status: "Verified / Arrived", procurement_stage: "WAITING", arrived_at: b2.arrivedAt }).eq('id', b2.id);
    await db.supabase.from('bookings').update({ arrival_status: "Verified / Arrived", procurement_stage: "WAITING", arrived_at: b3.arrivedAt }).eq('id', b3.id);
  }

  qA = await db.getMandiActiveQueue(mandiA, testDateStr);
  assert(qA.activeQueue.some(b => b.id === b1.id), "Verified booking B1 entered active queue");
  assert(qA.activeQueue.some(b => b.id === b2.id), "Verified booking B2 entered active queue");

  console.log("\n2. QUEUE ORDERING (TIME SLOT & ARRIVAL CHRONOLOGY)");
  assert(qA.activeQueue[0].id === b1.id, "B1 (09:00 slot) is ahead of B2 (09:30 slot)");

  console.log("\n3. MULTI-MANDI ISOLATION & AUTHORIZATION");
  const qB = await db.getMandiActiveQueue(mandiB, testDateStr);
  assert(!qA.activeQueue.some(b => b.id === b3.id), "Mandi A queue does not contain Mandi B booking");
  assert(qB.activeQueue.some(b => b.id === b3.id), "Mandi B queue correctly contains B3");

  console.log("\n4. DUPLICATE QUEUE PREVENTION");
  assert(qA.activeQueue.filter(b => b.id === b1.id).length === 1, "B1 appears exactly once in active queue");

  console.log("\n5. PROCUREMENT START (MOVING TO SERVING STAGE)");
  await db.startProcurement(mandiA, b1.id);
  qA = await db.getMandiActiveQueue(mandiA, testDateStr);
  assert(qA.currentlyServing && qA.currentlyServing.id === b1.id, "B1 is now the currently serving farmer");
  assert(qA.nextFarmer && qA.nextFarmer.id === b2.id, "B2 is now next in queue");

  console.log("\n6. FARMER OWNERSHIP & QUEUE STATUS");
  const f1Status = await db.getFarmerQueueStatus(farmer1Id);
  const f2Status = await db.getFarmerQueueStatus(farmer2Id);
  assert(f1Status.hasActiveQueue || f1Status.booking, "Farmer 1 retrieves own booking / queue status");
  assert(f2Status.hasActiveQueue || f2Status.booking, "Farmer 2 retrieves own booking / queue status");

  console.log("\n7. PROCUREMENT COMPLETION & EXCLUSION");
  await db.processProcurement(mandiA, { bookingId: b1.id, actualQty: 48.5, billedBy: "Officer Sharma" });
  qA = await db.getMandiActiveQueue(mandiA, testDateStr);
  assert(!qA.activeQueue.some(b => b.id === b1.id), "Completed booking B1 is excluded from active queue");
  assert(qA.currentlyServing === null, "Currently serving is reset after completion");
  assert(qA.nextFarmer && qA.nextFarmer.id === b2.id, "B2 is now first in waiting queue");

  console.log("\n8. CANCELLED & NO-SHOW EXCLUSIONS");
  const bCancel = await db.createBooking({ farmerId: farmer1Id, mandiId: mandiA, cropId: "crop-1", date: testDateStr, timeSlot: "11:00 - 11:30" });
  await db.cancelBooking(farmer1Id, bCancel.id);
  qA = await db.getMandiActiveQueue(mandiA, testDateStr);
  assert(!qA.activeQueue.some(b => b.id === bCancel.id), "Cancelled booking is excluded from active queue");

  console.log("\n9. RESCHEDULED BOOKING BEHAVIOR");
  // Create an eligible booking, verify active queue exclusion after reschedule to another date
  const b4 = await db.createBooking({ farmerId: farmer1Id, mandiId: mandiA, cropId: "crop-1", date: testDateStr, timeSlot: "14:00 - 14:30" });
  await db.rescheduleBooking(farmer1Id, b4.id, { newDate: futureDate, newTimeSlot: "10:00 - 10:30" });
  qA = await db.getMandiActiveQueue(mandiA, testDateStr);
  assert(!qA.activeQueue.some(b => b.id === b4.id), "Rescheduled booking B4 is removed from original date active queue");

  console.log("\n10. WAITING-TIME ESTIMATION & FALLBACK DURATION");
  const avgTime = await db.calculateAverageProcessingTime(mandiA, testDateStr);
  assert(typeof avgTime === 'number' && avgTime > 0, `Estimated processing duration is valid number: ${avgTime} min`);

  // Clean up test bookings from store.json and Supabase after test completion
  db.data.bookings = db.data.bookings.filter(b => b.date !== testDateStr && b.date !== futureDate);
  db.save();
  if (db.supabase) {
    await db.supabase.from('bookings').delete().in('date', [testDateStr, futureDate]);
  }

} catch (err) {
  console.error("CRITICAL TEST EXCEPTION:", err);
  failedTests++;
}

console.log("\n=================================================");
console.log(`📊 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log("=================================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
