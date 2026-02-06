import type { PlayerExercise } from "@/lib/types";

export type PlayerPhase = "prep" | "active" | "rest" | "complete";

export type PlayerState = {
  phase: PlayerPhase;
  routineId: string;
  routineTitle: string;
  exercises: PlayerExercise[];
  currentIndex: number;
  currentSet: number;
  currentSide: "left" | "right" | null;
  remaining: number;
  audioEnabled: boolean;
  paused: boolean;
};

export type PlayerAction =
  | {
      type: "INIT";
      payload: Omit<
        PlayerState,
        | "phase"
        | "currentIndex"
        | "currentSet"
        | "currentSide"
        | "remaining"
        | "paused"
      >;
    }
  | { type: "START" }
  | { type: "TICK" }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "SKIP" }
  | { type: "TOGGLE_AUDIO" }
  | { type: "PAUSE" }
  | { type: "RESUME" };
