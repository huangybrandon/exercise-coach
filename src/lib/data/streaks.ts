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
    .returns<StreakRow>()
    .single();

  if (error) {
    throw new Error(`Failed to update streak: ${error.message}`);
  }

  return {
    userId: data.user_id,
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastCompletedDate: data.last_completed_date,
  };
}
