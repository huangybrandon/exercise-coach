export type SupportedLanguage = "en" | "zh-TW";

export type ExerciseType = "balance" | "strength" | "core" | "mobility";

export type TimingMode = "hold" | "reps" | "timed";

export type ExerciseTiming = {
  mode: TimingMode;
  seconds?: number;
  reps?: number;
  sets: number;
  restSeconds: number;
  perSide?: boolean;
};

export type ExerciseMedia = {
  videoUrl: string;
  posterUrl?: string;
};

export type ExerciseTranslation = {
  lang: SupportedLanguage;
  title: string;
  description: string;
  cues: string[];
  safety: string;
};

export type Exercise = {
  id: string;
  type: ExerciseType;
  timing: ExerciseTiming;
  media: ExerciseMedia;
  translation: ExerciseTranslation;
};

export type PlayerExercise = Exercise & {
  order: number;
};

export type Routine = {
  id: string;
  durationMinutes: number;
  title: string;
  items: { exerciseId: string; sortOrder: number }[];
};

export type Session = {
  id: string;
  userId: string;
  routineId: string;
  completedAt: string;
  completedLocalDate: string;
  durationMinutes: number;
};

export type Streak = {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
};
