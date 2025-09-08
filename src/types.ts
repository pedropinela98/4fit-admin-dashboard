export const WORKOUT_TYPES = ["Individual", "Partner", "Team Wod"] as const;
export type WorkoutType = (typeof WORKOUT_TYPES)[number];

export const RESULT_TYPES = [
  { id: "time", label: "time", placeholder: "mm:ss (ex.: 12:34)" },
  { id: "reps", label: "reps", placeholder: "nº reps (ex.: 75)" },
  { id: "weight", label: "weight", placeholder: "peso (ex.: 100 kg)" },
  { id: "distance", label: "distance", placeholder: "distância (ex.: 5 km)" },
  {
    id: "rounds_plus_reps",
    label: "rounds_plus_reps",
    placeholder: "rondas+reps (ex.: 5+12)",
  },
  { id: "calories", label: "calories", placeholder: "calorias (ex.: 210)" },
  {
    id: "time(max. time)",
    label: "time(max. time)",
    placeholder: "mm:ss / cap (ex.: 20:00 cap)",
  },
] as const;
export type ResultType = (typeof RESULT_TYPES)[number]["id"];

export type Association = {
  athlete: string;
  workoutType: WorkoutType;
  resultType: ResultType;
  value: string;
  notes?: string;
};

export type DaySection = {
  id: string;
  label: string;
  color: string;
  text: string;
  placeholder?: string;
  isCustom?: boolean;
  associations?: Association[];
  coachNotes?: string;
};

export type SavedSection = {
  id: string;
  label: string;
  color: string;
  placeholder?: string;
  text: string;
  associations?: Association[];
  coachNotes?: string;
};
