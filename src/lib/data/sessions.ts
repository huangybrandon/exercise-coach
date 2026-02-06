import { createSupabaseClient } from "@/lib/supabase/client";
import type { Session } from "@/lib/types";

export function getLocalDateString(date = new Date()): string {
  return date.toLocaleDateString("en-CA");
}

export async function insertSession(params: {
  userId: string;
  routineId: string;
  durationMinutes: number;
  completedLocalDate?: string;
}): Promise<Session> {
  const supabase = createSupabaseClient();
  const completedLocalDate =
    params.completedLocalDate ?? getLocalDateString();

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: params.userId,
      routine_id: params.routineId,
      completed_local_date: completedLocalDate,
      duration_minutes: params.durationMinutes,
    })
    .select("id, user_id, routine_id, completed_at, completed_local_date, duration_minutes")
    .single();

  if (error) {
    throw new Error(`Failed to insert session: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    routineId: data.routine_id,
    completedAt: data.completed_at,
    completedLocalDate: data.completed_local_date,
    durationMinutes: data.duration_minutes,
  };
}

export async function getMonthlySessions(params: {
  userId: string;
  startDate: string;
  endDate: string;
}): Promise<Session[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("id, user_id, routine_id, completed_at, completed_local_date, duration_minutes")
    .eq("user_id", params.userId)
    .gte("completed_local_date", params.startDate)
    .lte("completed_local_date", params.endDate)
    .order("completed_local_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to load sessions: ${error.message}`);
  }

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    routineId: row.routine_id,
    completedAt: row.completed_at,
    completedLocalDate: row.completed_local_date,
    durationMinutes: row.duration_minutes,
  }));
}
