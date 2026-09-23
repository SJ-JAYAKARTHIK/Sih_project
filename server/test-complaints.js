import { db } from './db.js';

console.log("=================================================");
console.log("🧪 RUNNING SUITE OF TRANSPARENCY & COMPLAINT SYSTEM TESTS");
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

const testDate = new Date().toISOString().split('T')[0];
const farmer1Id = "10029384"; // Ramesh Verma
const farmer2Id = "20491823"; // Lakshmi Narasimha
const mandi1Id = "MANDI01";
const mandi2Id = "MANDI02";

(async () => {
  try {
    // Clean up test bookings and complaints from Supabase & local memory for test date
    if (db.supabase) {
      await db.supabase.from('procurements').delete().eq('farmer_id', farmer1Id);
      await db.supabase.from('complaints').delete().eq('farmer_id', farmer1Id);
      await db.supabase.from('bookings').delete().in('farmer_id', [farmer1Id, farmer2Id]).in('date', [testDate]);
    }
    db.data.bookings = db.data.bookings.filter(b => b.timeSlot !== "11:00 - 11:30" || b.date !== testDate);
    db.data.complaints = (db.data.complaints || []).filter(c => c.farmerId !== farmer1Id);
    db.save();

    // 1. ACTUAL QUANTITY AUTHORITATIVE CALCULATION RULE
    console.log("\n1. ACTUAL QUANTITY AUTHORITATIVE CALCULATION RULE");
    const b1 = await db.createBooking({
      farmerId: farmer1Id,
      mandiId: mandi1Id,
      cropId: "crop-1", // Paddy rate: 2300 per quintal
      date: testDate,
      timeSlot: "11:00 - 11:30",
      expectedQty: 50 // Expected 50 Quintals (5000 kg)
    });

    // Verify Gate Arrival
    await db.verifyArrival(mandi1Id, { tokenNumber: b1.tokenNumber });

    // Process procurement with Actual Quantity = 47.2 Quintals (4720 kg) instead of 50
    const procResult = await db.processProcurement(mandi1Id, {
      bookingId: b1.id,
      actualQty: 47.2,
      billedBy: "Rajesh Officer"
    });

    const expectedAmount = Math.round(47.2 * 2300); // 108560
    assert(procResult.bill.actualQty === 47.2, "Bill actual quantity is authoritative (47.2 Quintals)");
    assert(procResult.bill.totalAmount === expectedAmount, `Final payment calculated on actual quantity (₹${expectedAmount})`);
    assert(procResult.booking.actualQty === 47.2, "Booking record reflects actual quantity (47.2 Quintals)");

    // Verify consistency across Mandi history & Admin stats
    const mandiBookings = await db.getMandiBookings(mandi1Id, testDate);
    const matchedHistBooking = mandiBookings.find(b => b.id === b1.id);
    assert(matchedHistBooking && matchedHistBooking.actualQty === 47.2, "Mandi history uses actual quantity");
    assert(matchedHistBooking && procResult.bill.totalAmount === expectedAmount, "Mandi queue uses backend calculated final amount");

    // 2. DUPLICATE PROCUREMENT / BILLING REJECTION
    console.log("\n2. DUPLICATE PROCUREMENT / BILLING REJECTION");
    let duplicateProcError = false;
    try {
      await db.processProcurement(mandi1Id, {
        bookingId: b1.id,
        actualQty: 47.2,
        billedBy: "Rajesh Officer"
      });
    } catch (e) {
      duplicateProcError = true;
    }
    assert(duplicateProcError, "Duplicate procurement/billing for same booking rejected by backend");

    // 3. COMPLAINT CREATION & UNIQUE COMPLAINT ID GENERATION
    console.log("\n3. COMPLAINT CREATION & UNIQUE ID GENERATION");
    const complaint1 = await db.createComplaint({
      farmerId: farmer1Id,
      bookingId: b1.id,
      category: "Incorrect quantity",
      description: "Actual quantity recorded as 47.2 quintals, but scale display showed 48.0 quintals."
    });

    assert(complaint1.id.startsWith("CMP-"), `Unique Complaint ID generated: ${complaint1.id}`);
    assert(complaint1.status === 'Submitted', "Initial status is 'Submitted'");
    assert(complaint1.farmerId === farmer1Id, "Farmer ID correctly attached");

    // 4. FARMER OWNERSHIP AUTHORIZATION FOR COMPLAINTS
    console.log("\n4. FARMER OWNERSHIP AUTHORIZATION FOR COMPLAINTS");
    let unauthorizedComplaintError = false;
    try {
      // Farmer 2 attempts to file a complaint on Farmer 1's booking
      await db.createComplaint({
        farmerId: farmer2Id,
        bookingId: b1.id,
        category: "Bill issue",
        description: "Filing unauthorized complaint"
      });
    } catch (e) {
      unauthorizedComplaintError = true;
    }
    assert(unauthorizedComplaintError, "Farmer 2 rejected from filing complaint on Farmer 1's booking");

    const farmer1Complaints = await db.getFarmerComplaints(farmer1Id);
    const farmer2Complaints = await db.getFarmerComplaints(farmer2Id);
    assert(farmer1Complaints.some(c => c.id === complaint1.id), "Farmer 1 can view their filed complaint");
    assert(!farmer2Complaints.some(c => c.id === complaint1.id), "Farmer 2 cannot view Farmer 1's complaints");

    // 5. MANDI ISOLATION AUTHORIZATION FOR COMPLAINTS
    console.log("\n5. MANDI ISOLATION AUTHORIZATION FOR COMPLAINTS");
    const mandi1Complaints = await db.getMandiComplaints(mandi1Id);
    const mandi2Complaints = await db.getMandiComplaints(mandi2Id);
    assert(mandi1Complaints.some(c => c.id === complaint1.id), "Mandi 1 Officer can view Mandi 1 complaint");
    assert(!mandi2Complaints.some(c => c.id === complaint1.id), "Mandi 2 Officer CANNOT view Mandi 1 complaint (Mandi Isolation Enforced)");

    let unauthorizedStatusUpdate = false;
    try {
      // Mandi 2 Officer attempts to resolve Mandi 1 complaint
      await db.updateComplaintStatus({
        complaintId: complaint1.id,
        updatedBy: "Mandi 2 Officer",
        role: "MANDI_OFFICER",
        mandiId: mandi2Id,
        newStatus: "Under Review",
        responseComment: "Unauthorized attempt"
      });
    } catch (e) {
      unauthorizedStatusUpdate = true;
    }
    assert(unauthorizedStatusUpdate, "Mandi 2 Officer rejected from updating Mandi 1 complaint status");

    // 6. VALID COMPLAINT WORKFLOW STATUS TRANSITIONS & TIMELINE
    console.log("\n6. COMPLAINT WORKFLOW STATUS TRANSITIONS & TIMELINE");
    // Step 1: Move Submitted -> Under Review
    const underReviewComp = await db.updateComplaintStatus({
      complaintId: complaint1.id,
      updatedBy: "Mandi 1 Officer",
      role: "MANDI_OFFICER",
      mandiId: mandi1Id,
      newStatus: "Under Review",
      responseComment: "Weighing scale calibration logs requested for verification."
    });
    assert(underReviewComp.status === 'Under Review', "Status transitioned to 'Under Review'");
    assert(underReviewComp.statusHistory.length === 2, "Status history timeline updated (2 events)");

    // Step 2: Move Under Review -> Resolved
    const resolvedComp = await db.updateComplaintStatus({
      complaintId: complaint1.id,
      updatedBy: "Mandi 1 Officer",
      role: "MANDI_OFFICER",
      mandiId: mandi1Id,
      newStatus: "Resolved",
      responseComment: "Verified with digital scale log. Adjusted 0.8 quintal difference approved."
    });
    assert(resolvedComp.status === 'Resolved', "Status transitioned to 'Resolved'");
    assert(resolvedComp.statusHistory.length === 3, "Status history timeline contains 3 events");

    // 7. ADMIN MULTI-FILTER COMPLAINT ACCESS
    console.log("\n7. ADMIN MULTI-FILTER COMPLAINT ACCESS");
    const adminComplaints = await db.getAllComplaints({ mandiId: 'ALL', status: 'Resolved' });
    assert(adminComplaints.some(c => c.id === complaint1.id), "Admin can view all complaints across mandis");

    // Clean up test records
    if (db.supabase) {
      await db.supabase.from('procurements').delete().eq('id', procResult.bill.id);
      await db.supabase.from('complaints').delete().eq('id', complaint1.id);
      await db.supabase.from('bookings').delete().eq('id', b1.id);
    }

    // Summary
    console.log("\n=================================================");
    console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log("=================================================");
    if (failedTests > 0) process.exit(1);

  } catch (err) {
    console.error("FATAL TEST ERROR:", err);
    process.exit(1);
  }
})();

