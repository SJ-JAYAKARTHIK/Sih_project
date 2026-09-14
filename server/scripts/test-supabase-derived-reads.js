import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

import { db, supabase } from '../db.js';

async function runDerivedReadTests() {
  console.log('====================================================');
  console.log('🧪 PHASE 3: SUPABASE DERIVED READ PATH TEST SUITE');
  console.log('====================================================\n');

  let passedCount = 0;
  const totalCount = 8;

  // 1. Date Availability Test
  try {
    const availability = await db.getDateAvailability('MANDI01', 'crop-1');
    if (Array.isArray(availability) && availability.length === 30) {
      const sample = availability[0];
      const validProps = sample && 'date' in sample && 'bookedCount' in sample && 'status' in sample && 'remainingCount' in sample;
      const validStatus = ['Green', 'Yellow', 'Red'].includes(sample.status);
      if (validProps && validStatus) {
        console.log(`✅ 1. Date Availability: PASSED - Returned 30 days availability (Today: ${sample.date}, Status: ${sample.status}, Booked: ${sample.bookedCount}).`);
        passedCount++;
      } else {
        console.error('❌ 1. Date Availability Failed invalid props:', sample);
      }
    } else {
      console.error('❌ 1. Date Availability Failed invalid array length:', availability);
    }
  } catch (err) {
    console.error('❌ 1. Date Availability Exception:', err.message);
  }

  // 2. Time Slot Availability Test
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const slots = await db.getTimeSlots('MANDI01', todayStr);
    if (Array.isArray(slots) && slots.length === 12) {
      const sample = slots[0];
      const validProps = sample && 'time' in sample && 'bookedCount' in sample && 'maxCapacity' in sample && 'isAvailable' in sample;
      if (validProps && sample.maxCapacity === 2) {
        console.log(`✅ 2. Time Slot Availability: PASSED - Loaded 12 slots for MANDI01 on ${todayStr} (First slot ${sample.time}: ${sample.isAvailable ? 'Available' : 'Full'}).`);
        passedCount++;
      } else {
        console.error('❌ 2. Time Slot Availability Failed invalid props:', sample);
      }
    } else {
      console.error('❌ 2. Time Slot Availability Failed invalid array length:', slots);
    }
  } catch (err) {
    console.error('❌ 2. Time Slot Availability Exception:', err.message);
  }

  // 3. Full Slot Test
  try {
    const testDate = '2026-09-29';
    const mandiId = 'MANDI01';
    const testSlot = '09:00 - 09:30';

    let slots = await db.getTimeSlots(mandiId, testDate);
    let fullSlot = slots.find(s => s.time === testSlot);

    if (!fullSlot || fullSlot.bookedCount < 2) {
      const fIds = ['10029384', '10029002'];
      for (let i = (fullSlot ? fullSlot.bookedCount : 0); i < 2; i++) {
        try {
          const res = await db.createBooking({
            farmerId: fIds[i],
            mandiId,
            cropId: 'crop-1',
            date: testDate,
            timeSlot: testSlot,
            expectedQty: 20
          });
        } catch (e) {
          // ignore if already booked
        }
      }
      slots = await db.getTimeSlots(mandiId, testDate);
      fullSlot = slots.find(s => s.time === testSlot);
    }

    if (fullSlot && fullSlot.bookedCount >= 2 && fullSlot.isAvailable === false) {
      console.log(`✅ 3. Full Slot: PASSED - Slot '${testSlot}' on ${testDate} correctly reported full (bookedCount: ${fullSlot.bookedCount}, isAvailable: false).`);
      passedCount++;
    } else {
      console.error('❌ 3. Full Slot Failed:', fullSlot);
    }
  } catch (err) {
    console.error('❌ 3. Full Slot Exception:', err.message);
  }

  // 4. Mandi Active Queue Test
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const queue = await db.getMandiActiveQueue('MANDI01', todayStr);
    const validProps = queue && 'mandiId' in queue && 'activeQueue' in queue && 'waitingQueue' in queue && 'averageProcessingMinutes' in queue;
    if (validProps && queue.mandiId === 'MANDI01') {
      console.log(`✅ 4. Mandi Active Queue: PASSED - Mandi MANDI01 queue loaded (Active: ${queue.totalArrivedActive}, Completed Today: ${queue.completedTodayCount}, Avg Time: ${queue.averageProcessingMinutes} min).`);
      passedCount++;
    } else {
      console.error('❌ 4. Mandi Active Queue Failed:', queue);
    }
  } catch (err) {
    console.error('❌ 4. Mandi Active Queue Exception:', err.message);
  }

  // 5. Farmer Queue Tracker Test
  try {
    const farmerStatus = await db.getFarmerQueueStatus('10029384');
    const validProps = farmerStatus && 'hasActiveQueue' in farmerStatus;
    if (validProps) {
      console.log(`✅ 5. Farmer Queue Tracker: PASSED - Farmer 10029384 queue status loaded (hasActiveQueue: ${farmerStatus.hasActiveQueue}, Message/Position: ${farmerStatus.queuePosition || farmerStatus.message}).`);
      passedCount++;
    } else {
      console.error('❌ 5. Farmer Queue Tracker Failed:', farmerStatus);
    }
  } catch (err) {
    console.error('❌ 5. Farmer Queue Tracker Exception:', err.message);
  }

  // 6. Average Processing Time Test
  try {
    const avgTime = await db.calculateAverageProcessingTime('MANDI01');
    if (typeof avgTime === 'number' && avgTime >= 5) {
      console.log(`✅ 6. Average Processing Time: PASSED - Calculated ${avgTime} minutes for MANDI01.`);
      passedCount++;
    } else {
      console.error('❌ 6. Average Processing Time Failed:', avgTime);
    }
  } catch (err) {
    console.error('❌ 6. Average Processing Time Exception:', err.message);
  }

  // 7. Admin Statistics Test (Today)
  try {
    const stats = await db.getAdminStats();
    const validProps = stats && 'totalMandis' in stats && 'totalFarmers' in stats && 'todayBooked' in stats && 'mandiStats' in stats && 'cropStats' in stats;
    if (validProps && stats.totalMandis === 4 && stats.totalFarmers >= 4) {
      console.log(`✅ 7. Admin Statistics (Today): PASSED - Loaded stats for date ${stats.date} (Mandis: ${stats.totalMandis}, Farmers: ${stats.totalFarmers}, Today Booked: ${stats.todayBooked}, Procured Today: ${stats.totalQtyProcuredToday} quintals).`);
      passedCount++;
    } else {
      console.error('❌ 7. Admin Statistics Failed:', stats);
    }
  } catch (err) {
    console.error('❌ 7. Admin Statistics Exception:', err.message);
  }

  // 8. Selected-date Admin Statistics Test
  try {
    const historicalDate = '2026-09-08';
    const stats = await db.getAdminStats(historicalDate);
    if (stats && stats.date === historicalDate && Array.isArray(stats.mandiStats) && Array.isArray(stats.cropStats)) {
      console.log(`✅ 8. Selected-Date Admin Statistics: PASSED - Loaded historical stats for date ${stats.date} (Booked: ${stats.todayBooked}, Completed: ${stats.todayCompleted}, Qty: ${stats.totalQtyProcuredToday} quintals).`);
      passedCount++;
    } else {
      console.error('❌ 8. Selected-Date Admin Statistics Failed:', stats);
    }
  } catch (err) {
    console.error('❌ 8. Selected-Date Admin Statistics Exception:', err.message);
  }

  console.log('\n====================================================');
  console.log(`📊 PHASE 3 DERIVED READ TEST SUMMARY: ${passedCount}/${totalCount} PASSED`);
  console.log('====================================================\n');

  // Fallback Simulation Test
  console.log('====================================================');
  console.log('🧪 TESTING LOCAL JSON FALLBACK FOR DERIVED READS');
  console.log('====================================================');
  try {
    db.supabase = null;
    const fallbackAvailability = await db.getDateAvailability('MANDI01', 'crop-1');
    const fallbackSlots = await db.getTimeSlots('MANDI01', new Date().toISOString().split('T')[0]);
    const fallbackQueue = await db.getMandiActiveQueue('MANDI01');
    const fallbackStats = await db.getAdminStats();

    if (Array.isArray(fallbackAvailability) && Array.isArray(fallbackSlots) && fallbackQueue && fallbackStats) {
      console.log('✅ Fallback Mechanism Verified: All derived read functions operate cleanly using local JSON when Supabase connection is offline.');
    } else {
      console.error('❌ Fallback Mechanism Failed');
    }
  } catch (fallbackErr) {
    console.error('❌ Fallback Exception:', fallbackErr.message);
  } finally {
    db.supabase = undefined; // restore default
  }
}

runDerivedReadTests().catch(err => {
  console.error('Fatal error in derived read test suite:', err);
  process.exit(1);
});
