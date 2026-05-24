import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Cursor presence needs public browser env vars. If they are missing, the
  // experiment quietly disables itself instead of breaking the page.
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 20,
      },
    },
  });

  return browserClient;
}
