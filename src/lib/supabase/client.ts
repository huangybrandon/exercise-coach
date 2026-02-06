import { createClient } from "@supabase/supabase-js";
import { getRequiredPublicEnv } from "@/lib/env";

export function createSupabaseClient() {
  const { url, anonKey } = getRequiredPublicEnv();

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });
}
