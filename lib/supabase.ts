import { createClient } from "@supabase/supabase-js";

const fallbackSupabaseUrl = "https://okwbjcsmqohnjtpxyjkb.supabase.co";
const fallbackSupabaseAnonKey = "sb_publishable_Do0QjqsS6ugRq72lr-xSXA_hr_upgPe";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackSupabaseUrl;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackSupabaseAnonKey;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
