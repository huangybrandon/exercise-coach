import { createSupabaseClient } from "@/lib/supabase/client";
import type { Exercise, SupportedLanguage } from "@/lib/types";

export async function getExercises(lang: SupportedLanguage): Promise<Exercise[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("exercises")
    .select(
      "id, type, timing, media, exercise_translations!inner(lang, title, description, cues, safety)"
    )
    .eq("exercise_translations.lang", lang)
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to load exercises: ${error.message}`);
  }

  return (data || []).map((row) => ({
    id: row.id,
    type: row.type,
    timing: row.timing,
    media: row.media,
    translation: row.exercise_translations[0],
  }));
}
