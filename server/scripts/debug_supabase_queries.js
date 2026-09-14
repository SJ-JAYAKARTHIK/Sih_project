import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSupabaseData() {
  console.log('--- INSPECTING SUPABASE BOOKINGS FOR 10029384 ---');
  const { data: bk1, error: e1 } = await supabase.from('bookings').select('*').limit(5);
  console.log('Sample Supabase Bookings:', bk1);

  const { data: farmerBk, error: e2 } = await supabase.from('bookings').select('*').filter('farmer_name', 'eq', 'Ramesh Verma');
  console.log('Bookings for Ramesh Verma:', farmerBk);

  console.log('--- INSPECTING SUPABASE NOTIFICATIONS FOR 10029384 ---');
  const { data: notifs, error: e3 } = await supabase.from('notifications').select('*').limit(5);
  console.log('Sample Notifications:', notifs);

  console.log('--- INSPECTING SUPABASE DAILY REPORTS ---');
  const { data: reports, error: e4 } = await supabase.from('daily_reports').select('*');
  console.log('Daily Reports:', reports);

  console.log('--- INSPECTING SUPABASE COMPLAINTS ---');
  const { data: complaints, error: e5 } = await supabase.from('complaints').select('*');
  console.log('Complaints:', complaints);
}

inspectSupabaseData();
