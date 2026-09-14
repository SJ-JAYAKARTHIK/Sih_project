import { db } from './db.js';

console.log("=================================================");
console.log("🧪 RUNNING DAILY REPORT SUBMISSION & READ TESTS");
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

const testDate = "2026-09-14";
const mandiId = "MANDI01";

try {
  // Test 1: Submit Daily Report for MANDI01
  const report = await db.submitDailyReport(mandiId, testDate);
  assert(report && report.id === `REP-${mandiId}-${testDate}`, "Daily report generated with correct ID format");
  assert(report.mandiId === mandiId, "Report contains matching Mandi ID");
  assert(report.date === testDate, "Report contains matching date");
  assert(typeof report.totalBooked === 'number', "totalBooked is a valid number");
  assert(typeof report.totalQty === 'number', "totalQty is a valid number");

  // Test 2: Retrieve reports via getAllDailyReports
  const reports = await db.getAllDailyReports({ mandiId, startDate: testDate, endDate: testDate });
  assert(Array.isArray(reports) && reports.some(r => r.id === report.id), "Submitted report retrieved via getAllDailyReports");

  // Test 3: Invalid Mandi ID throws error
  let invalidMandiError = false;
  try {
    await db.submitDailyReport("NON_EXISTENT_MANDI", testDate);
  } catch (err) {
    invalidMandiError = true;
  }
  assert(invalidMandiError, "Rejects submission for non-existent Mandi ID");

  console.log("\n=================================================");
  console.log(`📊 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("=================================================");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
} catch (err) {
  console.error("CRITICAL TEST EXCEPTION:", err);
  process.exit(1);
}
