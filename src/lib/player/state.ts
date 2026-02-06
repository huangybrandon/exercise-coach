import type { ExerciseTiming, PlayerExercise } from "@/lib/types";
import type { PlayerAction, PlayerState } from "@/lib/player/types";

const PREP_SECONDS = 0;
const REST_SECONDS = 15;

function getExerciseDuration(timing: ExerciseTiming): number {
  if (timing.mode === "reps") {
    return timing.reps ?? 0;
  }
  return timing.seconds ?? 0;
}

function getInitialSide(timing: ExerciseTiming): "left" | "right" | null {
  if (timing.mode === "reps") return null;
  return timing.perSide ? "left" : null;
}

function resetForExercise(exercise: PlayerExercise) {
  return {
    currentSet: 1,
    currentSide: getInitialSide(exercise.timing),
    remaining: getExerciseDuration(exercise.timing),
  };
}

function nextSide(current: "left" | "right" | null): "left" | "right" | null {
  if (!current) return null;
  return current === "left" ? "right" : null;
}

function advanceExercise(state: PlayerState, nextIndex: number): PlayerState {
  if (nextIndex >= state.exercises.length) {
    return {
      ...state,
      phase: "complete",
      remaining: 0,
      paused: false,
    };
  }

  const nextExercise = state.exercises[nextIndex];
  const reset = resetForExercise(nextExercise);

  return {
    ...state,
    phase: "prep",
    currentIndex: nextIndex,
    ...reset,
    remaining: PREP_SECONDS,
    paused: false,
  };
}

export function initPlayerState(payload: PlayerAction & { type: "INIT" }): PlayerState {
  const firstExercise = payload.payload.exercises[0];
  const reset = resetForExercise(firstExercise);

  return {
    phase: "prep",
    currentIndex: 0,
    ...payload.payload,
    ...reset,
    remaining: PREP_SECONDS,
    paused: false,
  };
}

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "INIT": {
      return initPlayerState(action);
    }
    case "START": {
      if (state.phase !== "prep") return state;
      const exercise = state.exercises[state.currentIndex];
      return {
        ...state,
        phase: "active",
        remaining: getExerciseDuration(exercise.timing),
        paused: false,
      };
    }
    case "TICK": {
      if (state.paused) return state;
      if (state.phase === "prep" || state.phase === "active" || state.phase === "rest") {
        if (state.phase === "active") {
          const exercise = state.exercises[state.currentIndex];
          if (exercise?.timing?.mode === "reps") {
            return state;
          }
        }
        const nextRemaining = Math.max(state.remaining - 1, 0);
        return {
          ...state,
          remaining: nextRemaining,
        };
      }
      return state;
    }
    case "NEXT": {
      if (state.phase === "complete") return state;

      const exercise = state.exercises[state.currentIndex];
      const timing = exercise.timing;
      const hasSides = Boolean(timing.perSide) && timing.mode !== "reps";

      if (state.phase === "prep") {
        return {
          ...state,
          phase: "active",
          remaining: getExerciseDuration(timing),
          paused: false,
        };
      }

      if (state.phase === "active") {
        if (hasSides) {
          const next = nextSide(state.currentSide);
          if (next) {
            return {
              ...state,
              currentSide: next,
              remaining: getExerciseDuration(timing),
            };
          }
        }

        if (state.currentSet < timing.sets) {
          return {
            ...state,
            phase: "rest",
            remaining: REST_SECONDS,
          };
        }

        return advanceExercise(state, state.currentIndex + 1);
      }

      if (state.phase === "rest") {
        const reset = resetForExercise(exercise);
        return {
          ...state,
          phase: "active",
          currentSet: state.currentSet + 1,
          currentSide: reset.currentSide,
          remaining: getExerciseDuration(timing),
        };
      }

      return state;
    }
    case "PREV": {
      const exercise = state.exercises[state.currentIndex];
      if (!exercise) return state;

      if (state.currentSet > 1) {
        const reset = resetForExercise(exercise);
        return {
          ...state,
          phase: "prep",
          currentSet: state.currentSet - 1,
          currentSide: reset.currentSide,
          remaining: PREP_SECONDS,
          paused: false,
        };
      }

      if (state.currentIndex === 0) return state;
      return advanceExercise(state, state.currentIndex - 1);
    }
    case "SKIP": {
      return advanceExercise(state, state.currentIndex + 1);
    }
    case "TOGGLE_AUDIO": {
      return {
        ...state,
        audioEnabled: !state.audioEnabled,
      };
    }
    case "PAUSE": {
      return {
        ...state,
        paused: true,
      };
    }
    case "RESUME": {
      return {
        ...state,
        paused: false,
      };
    }
    default:
      return state;
  }
}
