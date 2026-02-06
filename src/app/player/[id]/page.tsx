"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import PlayerUI from "@/components/PlayerUI";
import { getExercises } from "@/lib/data/exercises";
import { getRoutineById } from "@/lib/data/routines";
import { usePlayerState } from "@/lib/player/hooks";
import type { Exercise, Routine } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export default function PlayerPage() {
  return (
    <AuthGate>
      <PlayerShell />
    </AuthGate>
  );
}

function PlayerShell() {
  const params = useParams<{ id: string }>();
  const routineId = params?.id ?? "";
  const { language } = useLanguage();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
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

        setRoutine(routineData);
        setExercises(exerciseData);
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
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-16 pt-8">
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">{t(language, "loadingPlayer")}</h1>
          <p className="mt-2 text-secondary">{t(language, "loading")}</p>
        </section>
      </main>
    );
  }

  if (error || !routine) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-16 pt-8">
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">{t(language, "unableToStart")}</h1>
          <p className="mt-2 text-secondary">{error ?? "Unknown error."}</p>
          <Link
            href={`/routines/${routineId}`}
            className="mt-6 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            {t(language, "back")}
          </Link>
        </section>
      </main>
    );
  }

  return <PlayerFlow routine={routine} exercises={exercises} />;
}

function PlayerFlow({ routine, exercises }: { routine: Routine; exercises: Exercise[] }) {
  const { language } = useLanguage();
  const { state, dispatch, exerciseList, currentExercise } = usePlayerState({
    routine,
    exercises,
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-16 pt-8">
      <header className="flex items-center justify-between">
        <Link
          href={`/routines/${routine.id}`}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700"
        >
          {t(language, "back")}
        </Link>
        <span className="text-sm text-slate-500">
          {t(language, "exerciseProgress")} {state.currentIndex + 1} {t(language, "of")} {exerciseList.length}
        </span>
      </header>

      <PlayerUI
        state={state}
        currentExercise={currentExercise}
        onNext={() => dispatch({ type: "NEXT" })}
        onPause={() => dispatch({ type: "PAUSE" })}
        onResume={() => dispatch({ type: "RESUME" })}
        onBack={() => dispatch({ type: "PREV" })}
        onToggleAudio={() => dispatch({ type: "TOGGLE_AUDIO" })}
      />
    </main>
  );
}
