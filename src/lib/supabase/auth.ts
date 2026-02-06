import { createSupabaseClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

export async function signInWithGoogle() {
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(`Google sign-in failed: ${error.message}`);
  }
}

export async function signOut() {
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Sign-out failed: ${error.message}`);
  }
}

export async function getSession() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(`Failed to get session: ${error.message}`);
  }
  return data.session;
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const supabase = createSupabaseClient();
  return supabase.auth.onAuthStateChange(callback);
}
