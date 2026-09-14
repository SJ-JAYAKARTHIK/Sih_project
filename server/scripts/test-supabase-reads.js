import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fojdhgbrsvmokiljacup.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSupabaseReadVerification() {
  console.log('====================================================');
  console.log('🔍 SUPABASE DIRECT READ VERIFICATION TEST');
  console.log('====================================================\n');

  let allPassed = true;

  // 1. Read Crops
  const { data: crops, error: cropsErr } = await supabase.from('crops').select('*');
  if (cropsErr || !crops || crops.length !== 6) {
    console.error(`❌ Crops Read Failed: count=${crops?.length}, error=${cropsErr?.message}`);
    allPassed = false;
  } else {
    console.log(`✅ Crops Read PASSED: ${crops.length} rows read.`);
  }

  // 2. Read Mandis
  const { data: mandis, error: mandisErr } = await supabase.from('mandis').select('*');
  if (mandisErr || !mandis || mandis.length !== 4) {
    console.error(`❌ Mandis Read Failed: count=${mandis?.length}, error=${mandisErr?.message}`);
    allPassed = false;
  } else {
    console.log(`✅ Mandis Read PASSED: ${mandis.length} rows read.`);
  }

  // 3. Read Farmers
  const { data: farmers, error: farmersErr } = await supabase.from('farmers').select('*');
  if (farmersErr || !farmers || farmers.length !== 7) {
    console.error(`❌ Farmers Read Failed: count=${farmers?.length}, error=${farmersErr?.message}`);
    allPassed = false;
  } else {
    console.log(`✅ Farmers Read PASSED: ${farmers.length} rows read (6 original + 1 provisioned IVR orphan).`);
  }

  // 4. Read Bookings
  const { data: bookings, error: bookingsErr } = await supabase.from('bookings').select('*');
  if (bookingsErr || !bookings || bookings.length !== 44) {
    console.error(`❌ Bookings Read Failed: count=${bookings?.length}, error=${bookingsErr?.message}`);
    allPassed = false;
  } else {
    console.log(`✅ Bookings Read PASSED: ${bookings.length} rows read (25 original + 19 reconstructed historical).`);
  }

  // 5. Read Procurements
  const { data: procurements, error: procurementsErr } = await supabase.from('procurements').select('*');
  if (procurementsErr || !procurements || procurements.length !== 23) {
    console.error(`❌ Procurements Read Failed: count=${procurements?.length}, error=${procurementsErr?.message}`);
    allPassed = false;
  } else {
    console.log(`✅ Procurements Read PASSED: ${procurements.length} rows read.`);
  }

  // 6. Read Daily Reports
  const { data: reports, error: reportsErr } = await supabase.from('daily_reports').select('*');
  if (reportsErr || !reports || reports.length !== 3) {
    console.error(`❌ Daily Reports Read Failed: count=${reports?.length}, error=${reportsErr?.message}`);
    allPassed = false;
  } else {
    console.log(`✅ Daily Reports Read PASSED: ${reports.length} rows read.`);
  }

  // 7. Read Notifications
  const { data: notifications, error: notifErr } = await supabase.from('notifications').select('*');
  if (notifErr || !notifications || notifications.length !== 170) {
    console.error(`❌ Notifications Read Failed: count=${notifications?.length}, error=${notifErr?.message}`);
    allPassed = false;
  } else {
    console.log(`✅ Notifications Read PASSED: ${notifications.length} rows read.`);
  }

  // 8. Read Complaints
  const { data: complaints, error: complaintsErr } = await supabase.from('complaints').select('*');
  if (complaintsErr || !complaints || complaints.length !== 3) {
    console.error(`❌ Complaints Read Failed: count=${complaints?.length}, error=${complaintsErr?.message}`);
    allPassed = false;
  } else {
    console.log(`✅ Complaints Read PASSED: ${complaints.length} rows read.`);
  }

  console.log('\n====================================================');
  if (allPassed) {
    console.log('🎉 ALL SUPABASE DIRECT READ VERIFICATION TESTS PASSED!');
  } else {
    console.log('❌ SOME VERIFICATION TESTS FAILED.');
  }
  console.log('====================================================');
}

runSupabaseReadVerification();
