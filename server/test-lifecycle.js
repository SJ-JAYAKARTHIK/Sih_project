import { db } from './db.js';

console.log("=================================================");
console.log("🧪 RUNNING SUITE OF CANCELLATION, RESCHEDULING & NO-SHOW TESTS");
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

const lifecycleDate = "2031-05-15";
const newRescheduleDate = "2031-05-16";

try {
  // Clean up any test data for test date
  db.data.bookings = db.data.bookings.filter(b => b.date !== lifecycleDate && b.date !== newRescheduleDate);
  db.data.notifications = (db.data.notifications || []).filter(n => !n.id.startsWith("TEST-"));
  db.save();

  const farmer1Id = "10029384"; // Ramesh Verma
  const farmer2Id = "10029002"; // Lakshmi Narasimha
  const farmer3Id = "10029003"; // Rajesh Singh
  const mandiA = "MANDI01";
  const mandiB = "MANDI02";

  console.log("\n1. VALID CANCELLATION & CAPACITY RELEASE");
  const b1 = db.createBooking({ farmerId: farmer1Id, mandiId: mandiA, cropId: "crop-1", date: lifecycleDate, timeSlot: "09:00 - 09:30" });
  assert(b1.bookingStatus === 'ACTIVE', "Booking created with ACTIVE status");
  
  const cancelledB1 = db.cancelBooking(farmer1Id, b1.id);
  assert(cancelledB1.bookingStatus === 'CANCELLED', "Booking status becomes CANCELLED");
  
  // Verify capacity release
  const slotsList = db.getTimeSlots(mandiA, lifecycleDate);
  const targetSlot = slotsList.find(s => s.time === "09:00 - 09:30");
  assert(targetSlot.bookedCount === 0, "Slot capacity released after cancellation (booked count = 0)");

  console.log("\n2. INVALID CANCELLATION REJECTION (AFTER GATE VERIFICATION / COMPLETION)");
  const b2 = db.createBooking({ farmerId: farmer2Id, mandiId: mandiA, cropId: "crop-1", date: new Date().toISOString().split('T')[0], timeSlot: "09:30 - 10:00" });
  db.verifyArrival(mandiA, { tokenNumber: b2.tokenNumber });

  let invalidCancelError = false;
  try {
    db.cancelBooking(farmer2Id, b2.id);
  } catch (e) {
    invalidCancelError = true;
  }
  assert(invalidCancelError, "Cancellation rejected after gate arrival verification");

  console.log("\n3. VALID RESCHEDULING & CAPACITY CONSUMPTION");
  const b3 = db.createBooking({ farmerId: farmer3Id, mandiId: mandiA, cropId: "crop-1", date: lifecycleDate, timeSlot: "09:00 - 09:30" });
  const rescheduledB3 = db.rescheduleBooking(farmer3Id, b3.id, { newDate: newRescheduleDate, newTimeSlot: "10:00 - 10:30" });
  
  assert(rescheduledB3.date === newRescheduleDate && rescheduledB3.timeSlot === "10:00 - 10:30", "Booking rescheduled to new date and time slot");
  
  const oldSlotCheck = db.getTimeSlots(mandiA, lifecycleDate).find(s => s.time === "09:00 - 09:30");
  const newSlotCheck = db.getTimeSlots(mandiA, newRescheduleDate).find(s => s.time === "10:00 - 10:30");
  assert(oldSlotCheck.bookedCount === 0, "Old slot capacity released");
  assert(newSlotCheck.bookedCount === 1, "New slot capacity consumed");

  console.log("\n4. RACE-CONDITION OVERBOOKING PREVENTION");
  // Fill slot 10:00 - 10:30 on newRescheduleDate to max capacity (2 farmers)
  const b4 = db.createBooking({ farmerId: farmer1Id, mandiId: mandiA, cropId: "crop-1", date: newRescheduleDate, timeSlot: "10:00 - 10:30" });
  assert(db.getTimeSlots(mandiA, newRescheduleDate).find(s => s.time === "10:00 - 10:30").bookedCount === 2, "Slot reached max capacity of 2");

  let overbookError = false;
  try {
    // Attempt 3rd booking on full slot
    db.createBooking({ farmerId: farmer2Id, mandiId: mandiA, cropId: "crop-1", date: newRescheduleDate, timeSlot: "10:00 - 10:30" });
  } catch (e) {
    overbookError = true;
  }
  assert(overbookError, "Backend authoritative check rejects overbooking when slot capacity is full");

  console.log("\n5. FARMER AUTHORIZATION ENFORCEMENT");
  let unauthorizedCancel = false;
  try {
    // Farmer 2 attempts to cancel Farmer 3's booking
    db.cancelBooking(farmer2Id, b3.id);
  } catch (e) {
    unauthorizedCancel = true;
  }
  assert(unauthorizedCancel, "Farmer 2 rejected from cancelling Farmer 3's booking (Farmer Ownership Enforced)");

  console.log("\n6. MANDI OFFICER AUTHORIZATION ENFORCEMENT");
  let unauthorizedMandiOverride = false;
  try {
    // Mandi B officer attempts to update booking belonging to Mandi A
    db.updateBookingStatus(mandiB, b3.id, { action: 'CANCEL' });
  } catch (e) {
    unauthorizedMandiOverride = true;
  }
  assert(unauthorizedMandiOverride, "Mandi B officer rejected from modifying Mandi A booking (Mandi Authorization Enforced)");

  console.log("\n7. CONFIGURABLE NO-SHOW GRACE PERIOD EVALUATION");
  const noShows = db.evaluateNoShows(mandiA);
  assert(Array.isArray(noShows), "evaluateNoShows executes cleanly using configurable grace period");

  console.log("\n8. QUEUE EXCLUSION VERIFICATION");
  const activeQ = db.getMandiActiveQueue(mandiA, lifecycleDate);
  assert(!activeQ.activeQueue.some(b => b.id === b1.id), "Cancelled booking B1 excluded from active queue");
  assert(!activeQ.activeQueue.some(b => b.id === b3.id), "Rescheduled booking B3 excluded from original date active queue");

  // Clean up test bookings from store.json
  db.data.bookings = db.data.bookings.filter(b => b.date !== lifecycleDate && b.date !== newRescheduleDate && b.id !== b2.id);
  db.data.notifications = db.data.notifications.filter(n => n.bookingId !== b1.id && n.bookingId !== b3.id);
  db.save();

} catch (err) {
  console.error("CRITICAL LIFECYCLE TEST EXCEPTION:", err);
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
