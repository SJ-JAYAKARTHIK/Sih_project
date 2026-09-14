import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://fojdhgbrsvmokiljacup.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_D3f_-VWcFiEhezHXVAxicg_076PkuLd";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
