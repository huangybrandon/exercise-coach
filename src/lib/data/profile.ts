import { createSupabaseClient } from "@/lib/supabase/client";
import type { SupportedLanguage } from "@/lib/types";

export type Profile = {
  id: string;
  displayName: string | null;
  isAdmin: boolean;
  language: SupportedLanguage;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, is_admin, language")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    displayName: data.display_name,
    isAdmin: data.is_admin,
    language: data.language as SupportedLanguage,
  };
}

export async function updateProfileLanguage(params: {
  userId: string;
  language: SupportedLanguage;
}): Promise<void> {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("profiles")
    .update({ language: params.language })
    .eq("id", params.userId);

  if (error) {
    throw new Error(`Failed to update language: ${error.message}`);
  }
}
