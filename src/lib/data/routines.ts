import { createSupabaseClient } from "@/lib/supabase/client";
import type { Routine, SupportedLanguage } from "@/lib/types";

export async function getRoutines(lang: SupportedLanguage): Promise<Routine[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("routines")
    .select(
      "id, duration_minutes, routine_translations!inner(lang, title), routine_items(exercise_id, sort_order)"
    )
    .eq("routine_translations.lang", lang)
    .order("duration_minutes", { ascending: true });

  if (error) {
    throw new Error(`Failed to load routines: ${error.message}`);
  }

  return (data || []).map((row) => ({
    id: row.id,
    durationMinutes: row.duration_minutes,
    title: row.routine_translations[0].title,
    items: (row.routine_items || [])
      .map((item) => ({
        exerciseId: item.exercise_id,
        sortOrder: item.sort_order,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

export async function getRoutineById(
  routineId: string,
  lang: SupportedLanguage
): Promise<Routine | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("routines")
    .select(
      "id, duration_minutes, routine_translations!inner(lang, title), routine_items(exercise_id, sort_order)"
    )
    .eq("id", routineId)
    .eq("routine_translations.lang", lang)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load routine: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    durationMinutes: data.duration_minutes,
    title: data.routine_translations[0].title,
    items: (data.routine_items || [])
      .map((item) => ({
        exerciseId: item.exercise_id,
        sortOrder: item.sort_order,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}
