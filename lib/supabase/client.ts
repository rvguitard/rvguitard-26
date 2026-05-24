import { supabase } from "@/lib/supabase";

export function getSupabaseBrowserClient() {
  return supabase;
}
