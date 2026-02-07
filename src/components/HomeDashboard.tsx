"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/supabase/auth";
import { getRoutines } from "@/lib/data/routines";
import { getStreak } from "@/lib/data/streaks";
import { getLastCompletedRoutineId } from "@/lib/data/sessions";
import type { Routine, Streak } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

const fallbackStreak: Streak = {
  userId: "",
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,
};

export default function HomeDashboard() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [streak, setStreak] = useState<Streak>(fallbackStreak);
  const [nextRoutineId, setNextRoutineId] = useState<string | null>(null);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t(language, "greetingMorning");
    if (hour < 18) return t(language, "greetingAfternoon");
    return t(language, "greetingEvening");
  }, [language]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const session = await getSession();
        if (!session?.user?.id) {
          throw new Error("No active session found.");
        }

        const [routineData, streakData, lastRoutineId] = await Promise.all([
          getRoutines(language),
          getStreak(session.user.id),
          getLastCompletedRoutineId(session.user.id),
        ]);

        if (!mounted) return;

        setRoutines(routineData);
        setStreak(streakData ?? { ...fallbackStreak, userId: session.user.id });
        if (routineData.length === 0) {
          setNextRoutineId(null);
        } else if (!lastRoutineId) {
          setNextRoutineId(routineData[0].id);
        } else {
          const lastIndex = routineData.findIndex((routine) => routine.id === lastRoutineId);
          const nextIndex =
            lastIndex === -1 || lastIndex === routineData.length - 1 ? 0 : lastIndex + 1;
          setNextRoutineId(routineData[nextIndex].id);
        }
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load data.");
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [language]);

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pb-16 pt-8">
        <div className="rounded-3xl bg-white/80 p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-800">{t(language, "loading")}</p>
          <p className="mt-2 text-secondary">{t(language, "pickDuration")}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pb-16 pt-8">
        <div className="rounded-3xl bg-white/80 p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-800">{t(language, "unableToLoad")}</p>
          <p className="mt-2 text-secondary">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-16 pt-8">
      <header className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
          {t(language, "appName")}
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">{greeting}</h1>
        <p className="text-secondary">
          {t(language, "homeSubtitle")}
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-base font-semibold uppercase tracking-[0.2em] text-slate-500">
            {t(language, "todayFocus")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            {t(language, "chooseRoutine")}
          </h2>
          <p className="mt-2 text-secondary">
            {t(language, "pickDuration")}
          </p>
          {nextRoutineId ? (
            <Link
              href={`/routines/${nextRoutineId}`}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-6 py-4 text-lg font-semibold text-white hover:bg-emerald-600"
            >
              {t(language, "startRoutine")}
            </Link>
          ) : (
            <button
              className="mt-6 w-full cursor-not-allowed rounded-full bg-slate-200 px-6 py-4 text-lg font-semibold text-slate-500"
              disabled
            >
              {t(language, "startRoutine")}
            </button>
          )}
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-base font-semibold uppercase tracking-[0.2em] text-slate-500">
            {t(language, "streak")}
          </p>
          <div className="mt-4 flex items-end gap-4">
            <div className="text-5xl font-semibold text-slate-900">
              {streak.currentStreak}
            </div>
            <div className="text-secondary">{t(language, "daysInRow")}</div>
          </div>
          <p className="mt-4 text-secondary">
            {t(language, "longestStreak")}:{" "}
            <span className="font-semibold text-slate-800">{streak.longestStreak} {t(language, "daysInRow")}</span>
          </p>
          <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-base text-emerald-800">
            {streak.currentStreak === 0
              ? t(language, "streakNudgeEmpty")
              : t(language, "streakNudgeKeep")}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">{t(language, "routines")}</h2>
          <span className="text-base text-slate-500">
            {routines.length} {t(language, "options")}
          </span>
        </div>
        <div className="mt-6 grid gap-4">
          {routines.map((routine) => (
            <Link
              key={routine.id}
              href={`/routines/${routine.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold text-slate-900">{routine.title}</span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-600">
                  {routine.durationMinutes} min
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                <span className="rounded-full bg-white px-3 py-1">Balance</span>
                <span className="rounded-full bg-white px-3 py-1">Strength</span>
                <span className="rounded-full bg-white px-3 py-1">Mobility</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
