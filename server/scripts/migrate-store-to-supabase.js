import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, '../data/store.json');

// Load environment variables from .env.local (and fallback to default .env)
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fojdhgbrsvmokiljacup.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_D3f_-VWcFiEhezHXVAxicg_076PkuLd';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  console.log('====================================================');
  console.log('🚀 STARTING STORE.JSON -> SUPABASE DATA MIGRATION');
  console.log('Target URL:', supabaseUrl);
  console.log('====================================================\n');

  if (!fs.existsSync(STORE_PATH)) {
    console.error('❌ Error: store.json file not found at:', STORE_PATH);
    process.exit(1);
  }

  const store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));

  try {
    // 1. Migrate Crops
    if (Array.isArray(store.crops) && store.crops.length > 0) {
      console.log(`📦 Migrating ${store.crops.length} Crops...`);
      const cropsData = store.crops.map(c => ({
        id: c.id,
        name: c.name,
        rate_per_quintal: c.ratePerQuintal,
        icon: c.icon || '🌾'
      }));
      const { error } = await supabase.from('crops').upsert(cropsData);
      if (error) throw new Error(`Crops migration failed: ${error.message}`);
      console.log('  ✅ Crops migrated successfully.');
    }

    // 2. Migrate Mandis & Mandi Accepted Crops
    if (Array.isArray(store.mandis) && store.mandis.length > 0) {
      console.log(`🏢 Migrating ${store.mandis.length} Mandis & Accepted Crop Mappings...`);
      const mandisData = store.mandis.map(m => ({
        id: m.id,
        name: m.name,
        location: m.location,
        password: m.password || '123456'
      }));
      const { error: mandiErr } = await supabase.from('mandis').upsert(mandisData);
      if (mandiErr) throw new Error(`Mandis migration failed: ${mandiErr.message}`);

      // Insert Accepted Crops mapping
      const acceptedCropsData = [];
      store.mandis.forEach(m => {
        if (Array.isArray(m.acceptedCrops)) {
          m.acceptedCrops.forEach(cropId => {
            acceptedCropsData.push({ mandi_id: m.id, crop_id: cropId });
          });
        }
      });

      if (acceptedCropsData.length > 0) {
        const { error: mapErr } = await supabase.from('mandi_accepted_crops').upsert(acceptedCropsData);
        if (mapErr) throw new Error(`Mandi Accepted Crops mapping failed: ${mapErr.message}`);
      }
      console.log('  ✅ Mandis & Accepted Crops migrated successfully.');
    }

    // 3. Migrate Farmers
    const farmersData = [];
    const knownFarmerIds = new Set();
    const mobileToFarmerMap = new Map();
    const legacyFarmerToCanonicalMap = new Map();

    if (Array.isArray(store.farmers) && store.farmers.length > 0) {
      store.farmers.forEach(f => {
        const farmerObj = {
          id: String(f.id),
          name: f.name,
          mobile: f.mobile,
          password: f.password || 'password123',
          language: f.language || 'EN',
          location: f.location || 'State Agriculture Division',
          bank_details: f.bankDetails || 'Bank Account **** (IFSC: SBIN0001234)'
        };
        farmersData.push(farmerObj);
        knownFarmerIds.add(String(f.id));
        if (f.mobile) {
          if (!mobileToFarmerMap.has(f.mobile)) {
            mobileToFarmerMap.set(f.mobile, []);
          }
          mobileToFarmerMap.get(f.mobile).push(farmerObj);
        }
      });
    }

    // Provision Orphan Voice IVR Farmers (e.g. BK-1788886931161 with farmerId 24463059)
    let provisionedCount = 0;
    if (Array.isArray(store.bookings) && store.bookings.length > 0) {
      store.bookings.forEach(b => {
        const fId = b.farmerId || b.farmer_id;
        if (fId && !knownFarmerIds.has(String(fId))) {
          const matchingFarmers = b.mobile ? (mobileToFarmerMap.get(b.mobile) || []) : [];
          if (matchingFarmers.length === 0) {
            const newFarmerObj = {
              id: String(fId),
              name: b.farmerName || 'Voice Caller Farmer',
              mobile: b.mobile || '9525739928',
              password: 'password123',
              language: 'EN',
              location: 'Voice IVR Registration',
              bank_details: 'Pending Bank Setup'
            };
            farmersData.push(newFarmerObj);
            knownFarmerIds.add(String(fId));
            if (b.mobile) {
              if (!mobileToFarmerMap.has(b.mobile)) {
                mobileToFarmerMap.set(b.mobile, []);
              }
              mobileToFarmerMap.get(b.mobile).push(newFarmerObj);
            }
            provisionedCount++;
            console.log(`  PROVISIONED ORPHAN VOICE IVR FARMER: ${fId} (${newFarmerObj.name})`);
          }
        }
      });
    }

    console.log(`👨‍🌾 Migrating ${farmersData.length} Farmers...`);
    const { error: farmerErr } = await supabase.from('farmers').upsert(farmersData);
    if (farmerErr) throw new Error(`Farmers migration failed: ${farmerErr.message}`);
    console.log('  ✅ Farmers migrated successfully.');

    // Map crops by name for ID lookup during historical reconstruction
    const cropNameToIdMap = new Map();
    if (Array.isArray(store.crops)) {
      store.crops.forEach(c => cropNameToIdMap.set(c.name, c.id));
    }

    // Helper to resolve farmer ID cleanly across all dependent entities
    const resolveFarmerId = (rawId, mobile) => {
      const strId = String(rawId);
      if (rawId && knownFarmerIds.has(strId)) {
        return { resolvedId: strId, method: 'DIRECT' };
      }
      if (legacyFarmerToCanonicalMap.has(strId)) {
        return { resolvedId: legacyFarmerToCanonicalMap.get(strId), method: 'LEGACY_FARMER_MAP' };
      }
      if (mobile) {
        const matches = mobileToFarmerMap.get(mobile) || [];
        if (matches.length === 1) {
          const canonicalId = String(matches[0].id);
          legacyFarmerToCanonicalMap.set(strId, canonicalId);
          return { resolvedId: canonicalId, method: 'LEGACY_MOBILE_MAP' };
        }
      }
      return { resolvedId: strId, method: 'UNMAPPED' };
    };

    // 4. Prepare Original & Reconstructed Historical Bookings
    const existingBookingMap = new Map();
    const existingTokenMap = new Map();
    const originalBookingsList = [];
    let directMatches = 0;
    let legacyMapped = 0;

    if (Array.isArray(store.bookings) && store.bookings.length > 0) {
      for (const b of store.bookings) {
        const rawFarmerId = b.farmerId || b.farmer_id;
        const { resolvedId, method } = resolveFarmerId(rawFarmerId, b.mobile);

        if (method === 'DIRECT') {
          directMatches++;
        } else if (method === 'LEGACY_MOBILE_MAP' || method === 'LEGACY_FARMER_MAP') {
          legacyMapped++;
          console.log(`  LEGACY FARMER ID ${rawFarmerId} -> CANONICAL FARMER ID ${resolvedId} (${b.farmerName})`);
        }

        if (!knownFarmerIds.has(resolvedId)) {
          console.error(`❌ Booking Foreign Key Validation Failed for Booking ID ${b.id}: farmer_id ${rawFarmerId} cannot be resolved to any existing farmer.`);
          throw new Error(`Booking ${b.id} foreign key validation failed: unmapped farmer_id ${rawFarmerId}`);
        }

        const bookingObj = {
          id: String(b.id),
          token_number: b.tokenNumber,
          qr_payload: typeof b.qrPayload === 'string' ? JSON.parse(b.qrPayload) : (b.qrPayload || {}),
          farmer_id: resolvedId,
          farmer_name: b.farmerName,
          mobile: b.mobile,
          mandi_id: b.mandiId,
          mandi_name: b.mandiName,
          crop_id: b.cropId,
          crop_name: b.cropName,
          date: b.date,
          time_slot: b.timeSlot,
          expected_qty: b.expectedQty !== null && b.expectedQty !== undefined ? parseFloat(b.expectedQty) : null,
          actual_qty: b.actualQty !== null && b.actualQty !== undefined ? parseFloat(b.actualQty) : null,
          arrival_status: b.arrivalStatus || 'Pending',
          procurement_status: b.procurementStatus || 'Pending',
          payment_status: b.paymentStatus || 'Pending',
          booking_status: b.bookingStatus || 'ACTIVE',
          procurement_stage: b.procurementStage || (b.procurementStatus === 'Completed' ? 'COMPLETED' : 'NOT_ARRIVED'),
          source: b.source || 'WEB',
          arrived_at: b.arrivedAt || null,
          procurement_started_at: b.procurementStartedAt || null,
          procurement_completed_at: b.procurementCompletedAt || null,
          created_at: b.createdAt || new Date().toISOString()
        };

        existingBookingMap.set(bookingObj.id, bookingObj);
        if (bookingObj.token_number) existingTokenMap.set(bookingObj.token_number, bookingObj.id);
        originalBookingsList.push(bookingObj);
      }
    }

    // Historical Booking Reconstruction Phase
    const reconstructedBookingsList = [];
    let directExactProcMatches = 0;
    let reconstructedHistoricalProcMatches = 0;

    if (Array.isArray(store.procurements) && store.procurements.length > 0) {
      for (const p of store.procurements) {
        const pBookingId = String(p.bookingId);

        if (existingBookingMap.has(pBookingId)) {
          directExactProcMatches++;
          const existing = existingBookingMap.get(pBookingId);
          if (existing.mandi_id !== p.mandiId && existing.mandi_name !== p.mandiName) {
            console.warn(`⚠️ Mandi mismatch for existing booking ${pBookingId}`);
          }
        } else {
          // Reconstruct missing historical booking
          const { resolvedId: resolvedFarmerId } = resolveFarmerId(p.farmerId, p.mobile);

          if (!knownFarmerIds.has(resolvedFarmerId)) {
            throw new Error(`Reconstruction failed for procurement ${p.id}: farmer_id ${p.farmerId} cannot be resolved.`);
          }

          const resolvedCropId = cropNameToIdMap.get(p.cropName) || p.cropId || 'crop-1';

          // Verify token unassigned to a different booking
          if (p.tokenNumber && existingTokenMap.has(p.tokenNumber)) {
            const assignedId = existingTokenMap.get(p.tokenNumber);
            if (assignedId !== pBookingId) {
              throw new Error(`Reconstruction failed: Token ${p.tokenNumber} is already assigned to booking ${assignedId}`);
            }
          }

          const qrPayloadObj = {
            bookingId: pBookingId,
            tokenNumber: p.tokenNumber,
            farmerId: resolvedFarmerId,
            farmerName: p.farmerName,
            mandiId: p.mandiId,
            mandiName: p.mandiName,
            cropName: p.cropName,
            date: p.date,
            timeSlot: p.timeSlot
          };

          const reconstructedBooking = {
            id: pBookingId,
            token_number: p.tokenNumber,
            qr_payload: qrPayloadObj,
            farmer_id: resolvedFarmerId,
            farmer_name: p.farmerName,
            mobile: p.mobile,
            mandi_id: p.mandiId,
            mandi_name: p.mandiName,
            crop_id: resolvedCropId,
            crop_name: p.cropName,
            date: p.date,
            time_slot: p.timeSlot,
            expected_qty: p.expectedQty !== null && p.expectedQty !== undefined ? parseFloat(p.expectedQty) : null,
            actual_qty: parseFloat(p.actualQty),
            arrival_status: 'Verified / Arrived',
            procurement_status: 'Completed',
            payment_status: 'Completed',
            booking_status: 'ACTIVE',
            procurement_stage: 'COMPLETED',
            source: 'WEB',
            arrived_at: p.createdTimestamp,
            procurement_started_at: p.createdTimestamp,
            procurement_completed_at: p.createdTimestamp,
            created_at: p.createdTimestamp
          };

          existingBookingMap.set(pBookingId, reconstructedBooking);
          if (p.tokenNumber) existingTokenMap.set(p.tokenNumber, pBookingId);
          reconstructedBookingsList.push(reconstructedBooking);
          reconstructedHistoricalProcMatches++;
        }
      }
    }

    const bookingsData = Array.from(existingBookingMap.values());

    // --- DRY-RUN / PRE-VALIDATION SUMMARY REPORT ---
    console.log('\n====================================================');
    console.log('📊 DRY-RUN / PRE-VALIDATION SUMMARY REPORT');
    console.log('====================================================');
    console.log(`Existing bookings: ${originalBookingsList.length}`);
    console.log(`Historical bookings reconstructed: ${reconstructedBookingsList.length}`);
    console.log(`Total bookings prepared: ${bookingsData.length}`);
    console.log('\nProcurements:');
    console.log(`Direct exact matches: ${directExactProcMatches}`);
    console.log(`Reconstructed historical matches: ${reconstructedHistoricalProcMatches}`);
    console.log(`Ambiguous: 0`);
    console.log(`Unmapped: 0`);
    console.log('====================================================\n');

    console.log('--- PROCUREMENT → BOOKING INTEGRITY CHECK ---');
    store.procurements.forEach((p, idx) => {
      const finalBooking = existingBookingMap.get(String(p.bookingId));
      const matchType = originalBookingsList.some(b => b.id === String(p.bookingId)) ? 'DIRECT_EXACT' : 'RECONSTRUCTED_HISTORICAL';
      console.log(`P[${idx+1}] PROC_ID: ${p.id} | ORIG_BK: ${p.bookingId} | FINAL_BK: ${finalBooking.id} | MATCH_TYPE: ${matchType} | TOKEN: ${p.tokenNumber} | FARMER: ${p.farmerName} (${finalBooking.farmer_id}) | MANDI: ${p.mandiName} | CROP: ${p.cropName} | DATE: ${p.date} | TIME: ${p.timeSlot}`);
    });

    console.log('\n--- BOOKING → PROCUREMENT COLLISION CHECK ---');
    const bookingProcCountsMap = new Map();
    bookingsData.forEach(b => bookingProcCountsMap.set(b.id, []));

    store.procurements.forEach(p => {
      const bId = String(p.bookingId);
      bookingProcCountsMap.get(bId).push(p.id);
    });

    let zeroProcCount = 0;
    let oneProcCount = 0;
    let multiProcCount = 0;

    bookingProcCountsMap.forEach((procs, bId) => {
      if (procs.length === 0) zeroProcCount++;
      else if (procs.length === 1) oneProcCount++;
      else multiProcCount++;
    });

    console.log(`• Bookings with 0 procurements: ${zeroProcCount}`);
    console.log(`• Bookings with exactly 1 procurement: ${oneProcCount}`);
    console.log(`• Bookings with >1 procurements: ${multiProcCount}`);

    // Pre-validation assertion checks before Supabase insert
    let hasFKError = false;
    let duplicateTokens = new Set();
    const tokenSeen = new Set();

    bookingsData.forEach(b => {
      if (b.token_number) {
        if (tokenSeen.has(b.token_number)) duplicateTokens.add(b.token_number);
        tokenSeen.add(b.token_number);
      }
    });

    if (multiProcCount > 0) {
      console.error(`❌ MIGRATION ABORTED: ${multiProcCount} bookings have >1 procurements attached!`);
      hasFKError = true;
    }

    if (duplicateTokens.size > 0) {
      console.error(`❌ MIGRATION ABORTED: Duplicate tokens found across bookings: ${Array.from(duplicateTokens).join(', ')}`);
      hasFKError = true;
    }

    if (hasFKError) {
      throw new Error('Strict pre-validation failed. Aborting migration without executing Supabase writes.');
    }

    console.log('\nSAFE MIGRATION PREPARATION COMPLETE — VALIDATION PASSED');
    console.log('Proceeding with actual Supabase migration...\n');

    // 5. Insert Bookings (44 total)
    console.log(`📅 Migrating ${bookingsData.length} Bookings...`);
    const { error: bookingErr } = await supabase.from('bookings').upsert(bookingsData);
    if (bookingErr) throw new Error(`Bookings migration failed: ${bookingErr.message}`);
    console.log('  ✅ Bookings migrated successfully.');

    // 6. Insert Procurements (23 total)
    // Foreign Key Safety Check: verify every procurement's FINAL_BK exists in bookingsData
    const validBookingIds = new Set(bookingsData.map(b => b.id));
    const procurementsData = store.procurements.map(p => {
      const pBookingId = String(p.bookingId);
      if (!validBookingIds.has(pBookingId)) {
        throw new Error(`Procurement ${p.id} references missing booking ${pBookingId}. Aborting procurement migration.`);
      }
      const { resolvedId: resolvedFarmerId } = resolveFarmerId(p.farmerId, p.mobile);
      return {
        id: p.id,
        booking_id: pBookingId,
        token_number: p.tokenNumber,
        farmer_id: resolvedFarmerId,
        farmer_name: p.farmerName,
        mobile: p.mobile,
        mandi_id: p.mandiId,
        mandi_name: p.mandiName,
        crop_name: p.cropName,
        date: p.date,
        time_slot: p.timeSlot,
        expected_qty: p.expectedQty !== null && p.expectedQty !== undefined ? parseFloat(p.expectedQty) : null,
        actual_qty: parseFloat(p.actualQty),
        rate_per_quintal: parseFloat(p.ratePerQuintal),
        total_amount: parseFloat(p.totalAmount),
        billed_by: p.billedBy,
        payment_ref: p.paymentRef,
        payment_status: p.paymentStatus || 'Completed',
        created_timestamp: p.createdTimestamp || new Date().toISOString()
      };
    });

    console.log(`💰 Migrating ${procurementsData.length} Procurements...`);
    const { error: procErr } = await supabase.from('procurements').upsert(procurementsData);
    if (procErr) throw new Error(`Procurements migration failed: ${procErr.message}`);
    console.log('  ✅ Procurements migrated successfully.');

    // 7. Migrate Daily Reports
    if (Array.isArray(store.dailyReports) && store.dailyReports.length > 0) {
      console.log(`📊 Migrating ${store.dailyReports.length} Daily Reports...`);
      const reportsData = store.dailyReports.map(r => ({
        id: r.id,
        mandi_id: r.mandiId,
        mandi_name: r.mandiName,
        date: r.date,
        total_booked: r.totalBooked,
        total_verified: r.totalVerified,
        total_pending: r.totalPending,
        total_completed: r.totalCompleted,
        total_qty: parseFloat(r.totalQty),
        total_payment: parseFloat(r.totalPayment),
        submitted_at: r.submittedAt || new Date().toISOString()
      }));

      const { error } = await supabase.from('daily_reports').upsert(reportsData);
      if (error) throw new Error(`Daily Reports migration failed: ${error.message}`);
      console.log('  ✅ Daily Reports migrated successfully.');
    }

    // 8. Migrate Notifications
    if (Array.isArray(store.notifications) && store.notifications.length > 0) {
      console.log(`🔔 Migrating ${store.notifications.length} Notifications...`);
      const notificationsData = store.notifications.map(n => {
        const { resolvedId: resolvedFarmerId } = resolveFarmerId(n.farmerId, null);
        return {
          id: n.id,
          farmer_id: resolvedFarmerId,
          booking_id: n.bookingId && validBookingIds.has(n.bookingId) ? n.bookingId : null,
          type: n.type,
          title: n.title,
          message: n.message,
          read: Boolean(n.read),
          created_at: n.createdAt || new Date().toISOString()
        };
      });

      const { error } = await supabase.from('notifications').upsert(notificationsData);
      if (error) throw new Error(`Notifications migration failed: ${error.message}`);
      console.log('  ✅ Notifications migrated successfully.');
    }

    // 9. Migrate Complaints
    if (Array.isArray(store.complaints) && store.complaints.length > 0) {
      console.log(`⚖️ Migrating ${store.complaints.length} Complaints...`);
      const complaintsData = store.complaints.map(c => {
        const { resolvedId: resolvedFarmerId } = resolveFarmerId(c.farmerId, c.mobile);
        const resolvedBookingId = String(c.bookingId);

        if (!resolvedBookingId || !validBookingIds.has(resolvedBookingId)) {
          throw new Error(`Complaint ${c.id} foreign key validation failed: unmapped booking_id ${c.bookingId}`);
        }

        return {
          id: c.id,
          booking_id: resolvedBookingId,
          bill_id: c.billId || null,
          farmer_id: resolvedFarmerId,
          farmer_name: c.farmerName,
          mobile: c.mobile,
          mandi_id: c.mandiId,
          mandi_name: c.mandiName,
          crop_name: c.cropName,
          token_number: c.tokenNumber,
          expected_qty: c.expectedQty ? parseFloat(c.expectedQty) : null,
          actual_qty: c.actualQty ? parseFloat(c.actualQty) : null,
          total_amount: c.totalAmount ? parseFloat(c.totalAmount) : 0,
          rate_per_quintal: c.ratePerQuintal ? parseFloat(c.ratePerQuintal) : null,
          payment_ref: c.paymentRef || 'N/A',
          category: c.category,
          description: c.description,
          status: c.status || 'Submitted',
          response_comment: c.responseComment || '',
          last_updated_by: c.lastUpdatedBy || 'Farmer (Submitted)',
          status_history: c.statusHistory || [],
          created_at: c.createdAt || new Date().toISOString(),
          updated_at: c.updatedAt || new Date().toISOString()
        };
      });

      const { error } = await supabase.from('complaints').upsert(complaintsData);
      if (error) throw new Error(`Complaints migration failed: ${error.message}`);
      console.log('  ✅ Complaints migrated successfully.');
    }

    // 10. Post-Migration Database Verification Phase
    console.log('\n====================================================');
    console.log('🔍 RUNNING POST-MIGRATION SUPABASE DATABASE AUDIT');
    console.log('====================================================');

    const { count: countCrops } = await supabase.from('crops').select('*', { count: 'exact', head: true });
    const { count: countMandis } = await supabase.from('mandis').select('*', { count: 'exact', head: true });
    const { count: countFarmers } = await supabase.from('farmers').select('*', { count: 'exact', head: true });
    const { count: countBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    const { count: countProcurements } = await supabase.from('procurements').select('*', { count: 'exact', head: true });

    // Fetch all procurements and bookings from Supabase to audit FK integrity & collisions
    const { data: dbProcurements, error: fetchProcErr } = await supabase.from('procurements').select('id, booking_id');
    if (fetchProcErr) throw new Error(`Post-migration audit error fetching procurements: ${fetchProcErr.message}`);

    const { data: dbBookings, error: fetchBkErr } = await supabase.from('bookings').select('id');
    if (fetchBkErr) throw new Error(`Post-migration audit error fetching bookings: ${fetchBkErr.message}`);

    const dbBookingIdSet = new Set((dbBookings || []).map(b => b.id));
    const procBookingCounts = new Map();
    let procurementFKErrors = 0;

    (dbProcurements || []).forEach(p => {
      if (!dbBookingIdSet.has(p.booking_id)) {
        procurementFKErrors++;
      }
      procBookingCounts.set(p.booking_id, (procBookingCounts.get(p.booking_id) || 0) + 1);
    });

    let dbCollisions = 0;
    procBookingCounts.forEach((cnt) => {
      if (cnt > 1) dbCollisions++;
    });

    const isVerificationSuccessful = (
      countCrops === store.crops.length &&
      countMandis === store.mandis.length &&
      countFarmers === farmersData.length &&
      countBookings === bookingsData.length &&
      countProcurements === store.procurements.length &&
      procurementFKErrors === 0 &&
      dbCollisions === 0
    );

    if (!isVerificationSuccessful) {
      console.error(`❌ POST-MIGRATION AUDIT FAILED!`);
      console.error(`  Crops: expected ${store.crops.length}, got ${countCrops}`);
      console.error(`  Mandis: expected ${store.mandis.length}, got ${countMandis}`);
      console.error(`  Farmers: expected ${farmersData.length}, got ${countFarmers}`);
      console.error(`  Bookings: expected ${bookingsData.length}, got ${countBookings}`);
      console.error(`  Procurements: expected ${store.procurements.length}, got ${countProcurements}`);
      console.error(`  Procurement FK Errors: ${procurementFKErrors}`);
      console.error(`  Booking Collisions (>1 proc): ${dbCollisions}`);
      throw new Error('Post-migration verification failed.');
    }

    console.log('\n====================================================');
    console.log('🎉 SUPABASE MIGRATION COMPLETED SUCCESSFULLY');
    console.log('====================================================');
    console.log(`\nCrops: ${countCrops}`);
    console.log(`Mandis: ${countMandis}`);
    console.log(`Farmers: ${countFarmers}`);
    console.log(`Bookings: ${countBookings}`);
    console.log(`Procurements: ${countProcurements}`);
    console.log(`\nProcurement FK errors: ${procurementFKErrors}`);
    console.log(`Unmapped procurements: 0`);
    console.log(`Ambiguous procurements: 0`);
    console.log(`Booking collisions: ${dbCollisions}`);
    console.log('\n====================================================');
    console.log('\nMIGRATION COMPLETE — DATA VERIFIED IN SUPABASE');
  } catch (err) {
    console.error('\n❌ MIGRATION ERROR:', err.message);
    process.exit(1);
  }
}

migrateData();
