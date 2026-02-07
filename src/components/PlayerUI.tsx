"use client";

import type { PlayerState } from "@/lib/player/types";
import type { PlayerExercise } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return min > 0 ? `${min}:${String(sec).padStart(2, "0")}` : `${sec}`;
}

export default function PlayerUI({
  state,
  currentExercise,
  onNext,
  onPause,
  onResume,
  onBack,
  onToggleAudio,
}: {
  state: PlayerState;
  currentExercise: PlayerExercise | null;
  onNext: () => void;
  onPause: () => void;
  onResume: () => void;
  onBack: () => void;
  onToggleAudio: () => void;
}) {
  const { language } = useLanguage();
  if (state.phase === "complete") {
    return (
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">{t(language, "greatJob")}</h1>
        <p className="mt-2 text-secondary">
          {t(language, "finishedRoutine")}
        </p>
      </section>
    );
  }

  if (!currentExercise) {
    return (
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Loading exercise…</h1>
      </section>
    );
  }

  const timing = currentExercise.timing;
  const isRest = state.phase === "rest";
  const isPrep = state.phase === "prep";
  const isActive = state.phase === "active";
  const isRepBased = timing.mode === "reps";

  const label = isPrep
    ? t(language, "ready")
    : isRest
    ? t(language, "rest")
    : timing.mode === "reps"
    ? t(language, "reps")
    : t(language, "seconds");

  return (
    <section
      className={`rounded-3xl p-8 shadow-sm ${
        isRest ? "bg-slate-200" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {isRest ? t(language, "rest") : state.routineTitle}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            {isRest ? t(language, "rest") : currentExercise.translation.title}
          </h1>
        </div>
        <button
          onClick={onToggleAudio}
          className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
        >
          {state.audioEnabled ? t(language, "audioOn") : t(language, "audioOff")}
        </button>
      </div>

      <div className="mt-6 grid gap-6">
        <div className="flex items-center justify-center rounded-3xl bg-slate-100 p-6 text-slate-400">
          <span className="text-sm">Video placeholder</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="text-6xl font-semibold text-slate-900">
            {isPrep
              ? "—"
              : timing.mode === "reps"
              ? timing.reps ?? 0
              : formatTime(state.remaining)}
          </div>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
            {timing.mode === "reps" && !isRest ? t(language, "reps") : label}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-base text-slate-600">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            {t(language, "setLabel")} {state.currentSet} {t(language, "of")} {timing.sets}
          </span>
          {timing.perSide && !isRest && state.currentSide && (
            <span className="rounded-full bg-slate-900 px-4 py-1 text-base font-semibold uppercase tracking-[0.2em] text-white">
              {state.currentSide === "left" ? t(language, "left") : t(language, "right")}
            </span>
          )}
          {timing.mode === "reps" && timing.perSide && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-base">{t(language, "perSide")}</span>
          )}
        </div>

        {isRest && (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-secondary text-emerald-800">
            {t(language, "next")}: {currentExercise.translation.title} — {t(language, "setLabel")}{" "}
            {state.currentSet + 1} {t(language, "of")} {timing.sets}
          </div>
        )}

        {!isRest && (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-secondary">
            {timing.mode === "reps" ? (
              <p>
                {t(language, "reps")} {timing.reps ?? 0}
                {timing.perSide ? ` ${t(language, "perSide")}` : ""}.
              </p>
            ) : (
              currentExercise.translation.description
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onBack}
            className="flex-1 rounded-full border border-slate-200 px-6 py-3 text-lg font-semibold text-slate-700 hover:bg-slate-100"
          >
            {t(language, "backButton")}
          </button>
          {!(isPrep && isRepBased) && (
            <button
              onClick={onNext}
              className="flex-1 rounded-full bg-emerald-700 px-6 py-3 text-lg font-semibold text-white hover:bg-emerald-600"
            >
              {isPrep && !isRepBased ? t(language, "startSet") : isRest ? t(language, "startSet") : t(language, "done")}
            </button>
          )}
          <button
            onClick={state.paused ? onResume : onPause}
            className="flex-1 rounded-full border border-slate-200 px-6 py-3 text-lg font-semibold text-slate-700 hover:bg-slate-100"
          >
            {state.paused ? t(language, "resume") : t(language, "pause")}
          </button>
        </div>
      </div>
    </section>
  );
}
