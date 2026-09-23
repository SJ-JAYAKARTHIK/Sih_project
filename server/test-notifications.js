import { db, getTodayLocalDateStr } from './db.js';

console.log("=================================================");
console.log("🧪 RUNNING SUITE OF FARMER STATUS & NOTIFICATION TESTS");
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

const notifTestDate = "2030-01-01"; // Fixed test date

try {
  // Clean up any test data for test date in both local JSON and Supabase
  if (db.supabase) {
    await db.supabase.from('procurements').delete().eq('date', notifTestDate);
    await db.supabase.from('bookings').delete().eq('date', notifTestDate);
    await db.supabase.from('bookings').delete().eq('farmer_id', "10029384").eq('date', getTodayLocalDateStr());
  }
  db.data.bookings = db.data.bookings.filter(b => b.date !== notifTestDate && b.farmerId !== "10029384");
  db.data.notifications = (db.data.notifications || []).filter(n => !n.id.startsWith("TEST-"));
  db.save();

  const farmer1Id = "10029384"; // Ramesh Verma
  const farmer2Id = "10029002"; // Lakshmi Narasimha
  const mandiA = "MANDI01";

  console.log("\n1. BOOKING CONFIRMED NOTIFICATION & STATUS JOURNEY (STEP 1: BOOKED)");
  const b1 = await db.createBooking({ farmerId: farmer1Id, mandiId: mandiA, cropId: "crop-1", date: notifTestDate, timeSlot: "09:00 - 09:30" });
  
  let f1Notifs = await db.getFarmerNotifications(farmer1Id);
  const bookingNotif = f1Notifs.find(n => n.bookingId === b1.id && n.type === 'BOOKING_CONFIRMED');
  assert(Boolean(bookingNotif), "BOOKING_CONFIRMED notification automatically created upon booking");
  assert(bookingNotif?.read === false, "New notification has unread state (read = false)");
  assert((await db.getFarmerUnreadCount(farmer1Id)) > 0, "Farmer 1 unread count is greater than 0");

  console.log("\n2. ARRIVAL VERIFICATION NOTIFICATION (STEP 2 & 3: ARRIVED & WAITING)");
  const todayStr = getTodayLocalDateStr();
  b1.date = todayStr; // Set to today for verifyArrival
  if (db.supabase) {
    await db.supabase.from('bookings').update({ date: todayStr }).eq('id', b1.id);
  }
  await db.verifyArrival(mandiA, { tokenNumber: b1.tokenNumber });
  
  f1Notifs = await db.getFarmerNotifications(farmer1Id);
  const arrivalNotif = f1Notifs.find(n => n.bookingId === b1.id && n.type === 'ARRIVED_AT_MANDI');
  assert(Boolean(arrivalNotif), "ARRIVED_AT_MANDI notification automatically generated on gate verification");

  console.log("\n3. TURN APPROACHING / PROCUREMENT START (STEP 4: PROCUREMENT)");
  await db.startProcurement(mandiA, b1.id);
  f1Notifs = await db.getFarmerNotifications(farmer1Id);
  const turnNotif = f1Notifs.find(n => n.bookingId === b1.id && n.type === 'TURN_APPROACHING');
  assert(Boolean(turnNotif), "TURN_APPROACHING notification generated when Mandi officer starts procurement");

  console.log("\n4. PROCUREMENT & PAYMENT COMPLETION (STEP 5 & 6: PAYMENT & COMPLETED)");
  await db.processProcurement(mandiA, { bookingId: b1.id, actualQty: 52.0, billedBy: "Officer Verma" });
  f1Notifs = await db.getFarmerNotifications(farmer1Id);
  const completedNotif = f1Notifs.find(n => n.bookingId === b1.id && n.type === 'PROCUREMENT_COMPLETED');
  assert(Boolean(completedNotif), "PROCUREMENT_COMPLETED notification generated upon weighing and billing");

  console.log("\n5. CANCELLATION & RESCHEDULING NOTIFICATIONS");
  b1.date = notifTestDate; // reset test date for b2 booking
  const b2 = await db.createBooking({ farmerId: farmer2Id, mandiId: mandiA, cropId: "crop-3", date: notifTestDate, timeSlot: "11:00 - 11:30" });
  await db.updateBookingStatus(mandiA, b2.id, { action: 'CANCEL' });
  let f2Notifs = await db.getFarmerNotifications(farmer2Id);
  assert(f2Notifs.some(n => n.bookingId === b2.id && n.type === 'BOOKING_CANCELLED'), "BOOKING_CANCELLED notification generated upon cancellation");

  console.log("\n6. NOTIFICATION PERSISTENCE IN DATABASE");
  const storedNotifCount = db.data.notifications.length;
  assert(storedNotifCount > 0, `Notifications persisted in store.json (Count: ${storedNotifCount})`);

  console.log("\n7. EVENT DEDUPLICATION");
  const dupeCountInitial = db.data.notifications.length;
  await db.addNotification({ farmerId: farmer1Id, bookingId: b1.id, type: "PROCUREMENT_COMPLETED", title: "Duplicate Test", message: "Duplicate" });
  assert(db.data.notifications.length === dupeCountInitial, "Duplicate event within 10 seconds is cleanly deduplicated");

  console.log("\n8. READ / UNREAD STATE TRANSITIONS & FARMER OWNERSHIP ISOLATION");
  const unreadBefore = await db.getFarmerUnreadCount(farmer1Id);
  const targetNotif = f1Notifs[0];
  await db.markNotificationAsRead(farmer1Id, targetNotif.id);
  const unreadAfter = await db.getFarmerUnreadCount(farmer1Id);
  assert(unreadAfter === unreadBefore - 1, "markNotificationAsRead decrements unread count by 1");

  let unauthorizedError = false;
  try {
    // Farmer 2 attempts to mark Farmer 1's notification as read
    await db.markNotificationAsRead(farmer2Id, targetNotif.id);
  } catch (e) {
    unauthorizedError = true;
  }
  assert(unauthorizedError, "Farmer 2 cannot mark Farmer 1's notification as read (Strict Farmer Ownership Enforced)");

  // Clean up test bookings and test notifications
  db.data.bookings = db.data.bookings.filter(b => b.date !== notifTestDate && b.id !== b1.id);
  db.data.notifications = db.data.notifications.filter(n => n.bookingId !== b1.id && n.bookingId !== b2.id);
  db.save();

} catch (err) {
  console.error("CRITICAL NOTIFICATION TEST EXCEPTION:", err);
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
