import React from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";

export type WorkoutType = "Individual" | "Partner" | "Team Wod";
export type ResultType =
  | "time"
  | "reps"
  | "weight"
  | "distance"
  | "rounds_plus_reps"
  | "calories"
  | "time(max. time)";

export type Association = {
  workoutType: WorkoutType;
  resultType: ResultType;
  value?: string;
  exercise?: string;
  sets?: number;
  notes?: string;
};

export type SectionData = {
  id: string;
  label: string;
  color: string;
  text: string;
  placeholder?: string;
  associations?: Association[];
  coachNotes?: string;
};

type Props = {
  section: SectionData;
  onChange: (updated: SectionData) => void;
  onClose: () => void;
  workoutTypes?: WorkoutType[];
  resultTypes?: { id: ResultType; label: string; placeholder?: string }[];
  exercises?: string[];
};

const DEFAULT_WORKOUT_TYPES: WorkoutType[] = [
  "Individual",
  "Partner",
  "Team Wod",
];

const DEFAULT_RESULT_TYPES: {
  id: ResultType;
  label: string;
  placeholder?: string;
}[] = [
  { id: "time", label: "Tempo" },
  { id: "reps", label: "Reps" },
  { id: "weight", label: "Peso" },
  { id: "distance", label: "Distância" },
  { id: "rounds_plus_reps", label: "Rounds + Reps" },
  { id: "calories", label: "Calorias" },
  { id: "time(max. time)", label: "Tempo (max. tempo)" },
];

const DEFAULT_EXERCISES = [
  "Back Squat",
  "Front Squat",
  "Overhead Squat",
  "Deadlift",
  "Clean",
  "Snatch",
  "Bench Press",
  "Push Press",
  "Jerk",
];

export function AssociateResults({
  section,
  onChange,
  onClose,
  workoutTypes = DEFAULT_WORKOUT_TYPES,
  resultTypes = DEFAULT_RESULT_TYPES,
  exercises = DEFAULT_EXERCISES,
}: Props) {
  const [workoutType, setWorkoutType] = React.useState<WorkoutType | "">("");
  const [resultType, setResultType] = React.useState<ResultType | "">("");

  const [exercise, setExercise] = React.useState<string>("");
  const [exerciseOpen, setExerciseOpen] = React.useState(false);
  const [sets, setSets] = React.useState<number | "">("");
  const [minutes, setMinutes] = React.useState("");
  const [seconds, setSeconds] = React.useState("");

  const [coachNotes, setCoachNotes] = React.useState(section.coachNotes || "");
  const [editList, setEditList] = React.useState<Association[]>(
    section.associations ?? []
  );

  React.useEffect(() => {
    setCoachNotes(section.coachNotes || "");
    setEditList(section.associations ?? []);
  }, [section]);

  function resetNewForm() {
    setWorkoutType("");
    setResultType("");
    setExercise("");
    setSets("");
    setMinutes("");
    setSeconds("");
  }

  function handleSaveAll() {
    onChange({ ...section, associations: editList, coachNotes });
    onClose();
  }

  function handleDeleteAssociation(idx: number) {
    const next = editList.filter((_, i) => i !== idx);
    setEditList(next);
    onChange({ ...section, associations: next, coachNotes });
  }

  function handleAddAssociation() {
    if (!workoutType || !resultType) return;

    let finalValue: string | undefined = undefined;

    if (resultType === "time" || resultType === "time(max. time)") {
      finalValue = `${(minutes || "0").padStart(2, "0")}:${(
        seconds || "0"
      ).padStart(2, "0")}`;
    } else if (
      resultType === "reps" ||
      resultType === "distance" ||
      resultType === "calories" ||
      resultType === "rounds_plus_reps"
    ) {
      finalValue = "0";
    } else if (resultType === "weight" && (!exercise || !sets)) {
      return;
    }

    const next: Association[] = [
      ...editList,
      {
        workoutType,
        resultType,
        value: finalValue,
        exercise: resultType === "weight" ? exercise : undefined,
        sets: resultType === "weight" ? Number(sets) : undefined,
      },
    ];

    setEditList(next);
    onChange({ ...section, associations: next, coachNotes });
    resetNewForm();
  }

  const isTimeInvalid =
    (resultType === "time" || resultType === "time(max. time)") &&
    ((minutes !== "" && (+minutes < 0 || +minutes > 99)) ||
      (seconds !== "" && (+seconds < 0 || +seconds > 59)));

  const isAddDisabled =
    !workoutType ||
    !resultType ||
    isTimeInvalid ||
    (resultType === "weight" && (!exercise || sets === ""));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {section.associations?.length
          ? "Editar resultados associados"
          : "Associar resultados"}{" "}
        — {section.label || "Sem título"}
      </h3>

      {/* Seletores principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={workoutType}
          onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
        >
          <option value="" disabled>
            Tipo de treino
          </option>
          {workoutTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={resultType}
          onChange={(e) => setResultType(e.target.value as ResultType)}
        >
          <option value="" disabled>
            Tipo de resultado
          </option>
          {resultTypes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Inputs dinâmicos */}
      {resultType === "time" || resultType === "time(max. time)" ? (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            className="w-20 rounded-lg border px-3 py-2 text-sm"
            placeholder="mm"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
          <span className="text-lg font-semibold">:</span>
          <input
            type="number"
            className="w-20 rounded-lg border px-3 py-2 text-sm"
            placeholder="ss"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
          />
        </div>
      ) : resultType === "weight" ? (
        <div className="flex gap-3 items-center">
          {/* Combobox para exercício */}
          <Popover open={exerciseOpen} onOpenChange={setExerciseOpen}>
            <PopoverTrigger asChild>
              <button className="flex-1 flex justify-between items-center rounded-lg border px-3 py-2 text-sm">
                {exercise || "Seleciona exercício"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Procurar exercício..." />
                <CommandList>
                  <CommandEmpty>Nenhum exercício encontrado</CommandEmpty>
                  <CommandGroup>
                    {exercises.map((ex) => (
                      <CommandItem
                        key={ex}
                        value={ex}
                        onSelect={() => {
                          setExercise(ex);
                          setExerciseOpen(false);
                        }}
                      >
                        {ex}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Número de séries */}
          <input
            type="number"
            className="w-28 rounded-lg border px-3 py-2 text-sm"
            placeholder="Nº séries"
            value={sets}
            onChange={(e) =>
              setSets(e.target.value ? Number(e.target.value) : "")
            }
            min={1}
          />
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          onClick={handleAddAssociation}
          disabled={isAddDisabled}
          className={`px-3 py-2 rounded-full border text-sm bg-slate-900 text-white hover:opacity-90 ${
            isAddDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Adicionar
        </button>
      </div>

      {/* Lista só leitura */}
      {editList.length === 0 ? (
        <p className="text-sm text-slate-500">Sem resultados associados.</p>
      ) : (
        <div className="space-y-2">
          {editList.map((a, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center rounded-xl border p-2"
            >
              <div className="text-sm font-medium">{a.workoutType}</div>
              <div className="text-sm">
                {a.resultType === "weight" && a.exercise
                  ? `${a.exercise} — ${a.sets} séries`
                  : a.value}
              </div>
              <div className="flex justify-end col-span-2">
                <button
                  onClick={() => handleDeleteAssociation(idx)}
                  className="px-3 py-2 rounded-full border text-sm hover:bg-slate-50"
                  title="Remover resultado"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notas */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Notas para o coach</label>
        <textarea
          className="w-full rounded-lg border px-3 py-2 text-sm"
          rows={3}
          placeholder="Escreve aqui notas para o coach…"
          value={coachNotes}
          onChange={(e) => setCoachNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onClose}
          className="px-3 py-2 rounded-full border text-sm hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSaveAll}
          className="px-3 py-2 rounded-full border text-sm bg-slate-900 text-white hover:opacity-90"
        >
          Guardar alterações
        </button>
      </div>
    </div>
  );
}
