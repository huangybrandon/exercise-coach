"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import { getExercises } from "@/lib/data/exercises";
import { getRoutineById } from "@/lib/data/routines";
import type { Exercise, Routine } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export default function RoutinePreviewPage() {
  return (
    <AuthGate>
      <RoutinePreviewContent />
    </AuthGate>
  );
}

function RoutinePreviewContent() {
  const params = useParams<{ id: string }>();
  const routineId = params?.id;
  const { language } = useLanguage();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (!routineId) throw new Error("Missing routine id.");

        const [routineData, exerciseData] = await Promise.all([
          getRoutineById(routineId, language),
          getExercises(language),
        ]);

        if (!mounted) return;

        if (!routineData) {
          setError("Routine not found.");
          setLoading(false);
          return;
        }

        const map: Record<string, Exercise> = {};
        exerciseData.forEach((exercise) => {
          map[exercise.id] = exercise;
        });

        setRoutine(routineData);
        setExercises(map);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load routine.");
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [language, routineId]);

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pb-16 pt-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-800">{t(language, "loadingRoutine")}</p>
          <p className="mt-2 text-secondary">{t(language, "loading")}</p>
        </div>
      </main>
    );
  }

  if (error || !routine) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pb-16 pt-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-800">{t(language, "unableToLoad")}</p>
          <p className="mt-2 text-secondary">{error ?? t(language, "routineNotFound")}</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            {t(language, "back")}
          </Link>
        </div>
      </main>
    );
  }

  const exerciseList = routine.items
    .map((item) => exercises[item.exerciseId])
    .filter(Boolean);

  const totalExercises = exerciseList.length;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-16 pt-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700"
        >
          {t(language, "back")}
        </Link>
        <h1 className="text-4xl font-semibold text-slate-900">{routine.title}</h1>
        <p className="text-secondary">
          {routine.durationMinutes} {t(language, "routineSummary")} {totalExercises} {t(language, "exercises")}
        </p>
        <Link
          href={`/player/${routine.id}`}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-4 text-base font-semibold text-white hover:bg-emerald-600"
        >
          {t(language, "startRoutine")}
        </Link>
      </header>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">{t(language, "whatYoullDo")}</h2>
        <div className="mt-6 grid gap-4">
          {exerciseList.map((exercise, index) => (
            <div
              key={`${exercise.id}-${index}`}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4"
            >
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {index + 1}. {exercise.translation.title}
                </p>
                <p className="text-secondary">{exercise.translation.description}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                {exercise.type}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-4 rounded-3xl bg-emerald-50 p-8 text-emerald-900">
        <h2 className="text-2xl font-semibold">{t(language, "readyToBegin")}</h2>
        <p className="text-sm">{t(language, "prepSafety")}</p>
      </section>
    </main>
  );
}
