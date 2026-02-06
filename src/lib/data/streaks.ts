import { createSupabaseClient } from "@/lib/supabase/client";
import type { Streak } from "@/lib/types";

export async function getStreak(userId: string): Promise<Streak | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("streaks")
    .select("user_id, current_streak, longest_streak, last_completed_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load streak: ${error.message}`);
  }

  if (!data) return null;

  return {
    userId: data.user_id,
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastCompletedDate: data.last_completed_date,
  };
}

export async function updateStreak(params: {
  userId: string;
  completedLocalDate: string;
}): Promise<Streak> {
  const supabase = createSupabaseClient();

  type StreakRow = {
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_completed_date: string | null;
  };

  const { data, error } = await supabase
    .rpc("update_streak", {
      p_user_id: params.userId,
      p_completed_local_date: params.completedLocalDate,
    })
    .returns<StreakRow | StreakRow[]>();

  if (error) {
    throw new Error(`Failed to update streak: ${error.message}`);
  }

  const row = (Array.isArray(data) ? data[0] : data) as StreakRow | undefined;

  if (!row) {
    throw new Error("Failed to update streak: no data returned.");
  }

  return {
    userId: row.user_id,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastCompletedDate: row.last_completed_date,
  };
}
