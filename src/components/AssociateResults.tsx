import React from "react";

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
  athlete: string;
  workoutType: WorkoutType;
  resultType: ResultType;
  value: string;
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
  workoutTypes?: WorkoutType[]; // se não passar usa default
  resultTypes?: { id: ResultType; label: string; placeholder?: string }[];
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
];

export function AssociateResults({
  section,
  onChange,
  onClose,
  workoutTypes = DEFAULT_WORKOUT_TYPES,
  resultTypes = DEFAULT_RESULT_TYPES,
}: Props) {
  const [athlete, setAthlete] = React.useState("");
  const [workoutType, setWorkoutType] =
    React.useState<WorkoutType>("Individual");
  const [resultType, setResultType] = React.useState<ResultType>("time");
  const [value, setValue] = React.useState("");
  const [coachNotes, setCoachNotes] = React.useState(section.coachNotes || "");
  const [editList, setEditList] = React.useState<Association[]>(
    section.associations ?? []
  );

  React.useEffect(() => {
    setCoachNotes(section.coachNotes || "");
    setEditList(section.associations ?? []);
  }, [section]);

  function resetNewForm() {
    setAthlete("");
    setWorkoutType("Individual");
    setResultType("time");
    setValue("");
  }

  function handleAddAssociation() {
    if (!athlete.trim() || !value.trim()) return;
    const next: Association[] = [
      ...editList,
      {
        athlete: athlete.trim(),
        workoutType,
        resultType,
        value: value.trim(),
      },
    ];
    setEditList(next);
    resetNewForm();
  }

  function handleUpdateAssociation(idx: number, patch: Partial<Association>) {
    setEditList((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  }

  function handleDeleteAssociation(idx: number) {
    setEditList((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSaveAll() {
    onChange({ ...section, associations: editList, coachNotes });
    onClose();
  }

  const resultPlaceholder =
    resultTypes.find((r) => r.id === resultType)?.placeholder || "valor";

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {section.associations?.length
          ? "Editar resultados associados"
          : "Associar resultados"}{" "}
        — {section.label || "Sem título"}
      </h3>

      {/* Notas para o coach */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Notas para o coach</label>
        <textarea
          className="w-full rounded-lg border px-3 py-2 text-sm"
          rows={3}
          placeholder="Escreve aqui notas para o coach…"
          value={coachNotes}
          onChange={(e) => setCoachNotes(e.target.value)}
        />
      </div>

      {/* Adicionar nova associação */}
      <div className="space-y-3 rounded-2xl border p-3">
        <div className="text-sm font-medium">Adicionar resultado</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Atleta / Utilizador"
            value={athlete}
            onChange={(e) => setAthlete(e.target.value)}
          />
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
          >
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
            {resultTypes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder={resultPlaceholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAddAssociation}
            className="px-3 py-2 rounded-full border text-sm bg-slate-900 text-white hover:opacity-90"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Lista editável */}
      <div className="space-y-3">
        <div className="text-sm font-medium">Resultados associados</div>

        {editList.length === 0 ? (
          <p className="text-sm text-slate-500">Sem resultados associados.</p>
        ) : (
          <div className="space-y-2">
            {editList.map((a, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center rounded-xl border p-2"
              >
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  value={a.athlete}
                  onChange={(e) =>
                    handleUpdateAssociation(idx, { athlete: e.target.value })
                  }
                />
                <select
                  className="rounded-lg border px-3 py-2 text-sm"
                  value={a.workoutType}
                  onChange={(e) =>
                    handleUpdateAssociation(idx, {
                      workoutType: e.target.value as WorkoutType,
                    })
                  }
                >
                  {workoutTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border px-3 py-2 text-sm"
                  value={a.resultType}
                  onChange={(e) =>
                    handleUpdateAssociation(idx, {
                      resultType: e.target.value as ResultType,
                    })
                  }
                >
                  {resultTypes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  value={a.value}
                  placeholder={
                    resultTypes.find((r) => r.id === a.resultType)
                      ?.placeholder || "valor"
                  }
                  onChange={(e) =>
                    handleUpdateAssociation(idx, { value: e.target.value })
                  }
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDeleteAssociation(idx)}
                    className="px-3 py-2 rounded-full border text-sm hover:bg-slate-50"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
