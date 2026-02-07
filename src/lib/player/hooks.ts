"use client";

import { useEffect, useMemo, useReducer } from "react";
import type { Exercise, PlayerExercise, Routine } from "@/lib/types";
import type { PlayerState } from "@/lib/player/types";
import { initPlayerState, playerReducer } from "@/lib/player/state";

function buildExerciseList(routine: Routine, exercises: Exercise[]): PlayerExercise[] {
  const map = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  return routine.items
    .map((item) => {
      const exercise = map.get(item.exerciseId);
      if (!exercise) return null;
      return {
        ...exercise,
        order: item.sortOrder,
      };
    })
    .filter((exercise): exercise is PlayerExercise => Boolean(exercise))
    .sort((a, b) => a.order - b.order);
}

export function usePlayerState(params: {
  routine: Routine;
  exercises: Exercise[];
}) {
  const exerciseList = useMemo(
    () => buildExerciseList(params.routine, params.exercises),
    [params.routine, params.exercises]
  );

  const [state, dispatch] = useReducer(playerReducer, undefined, () =>
    initPlayerState({
      type: "INIT",
      payload: {
        routineId: params.routine.id,
        routineTitle: params.routine.title,
        exercises: exerciseList,
        audioEnabled: true,
      },
    })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (state.paused) return;
    const currentExercise = exerciseList[state.currentIndex];
    const isRepBased = currentExercise?.timing?.mode === "reps";

    if (state.phase === "prep" && isRepBased) {
      dispatch({ type: "NEXT" });
      return;
    }

    if (state.phase === "active" && state.remaining === 0 && !isRepBased) {
      dispatch({ type: "NEXT" });
    }
    if (state.phase === "ready" && state.remaining === 0) {
      dispatch({ type: "NEXT" });
    }
    if (state.phase === "rest" && state.remaining === 0) {
      dispatch({ type: "NEXT" });
    }
  }, [exerciseList, state.currentIndex, state.phase, state.remaining, state.paused]);

  const currentExercise = useMemo(
    () => exerciseList[state.currentIndex] ?? null,
    [exerciseList, state.currentIndex]
  );

  return { state, dispatch, exerciseList, currentExercise };
}
