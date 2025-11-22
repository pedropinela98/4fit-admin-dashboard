import { useState, useEffect } from "react";
import Button from "../ui/button/Button";

// Tipos internos do formulário
export type PlanClassLimit = {
  class_type_id: string;
  included: boolean;
  max_sessions_per_week: number | null; // null = ilimitado
};

export type PlanFormData = {
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  plans_public: boolean;
  periodicity: "monthly" | "quarterly" | "semester" | "annualy" | null;
  class_limits: PlanClassLimit[];
};

export type ClassType = {
  id: string;
  box_id: string;
  name: string;
  description: string | null;
  active: boolean;
};

type PlanFormProps = {
  initialData?: Partial<PlanFormData>;
  classTypes?: ClassType[]; // dados do hook
  onSubmit: (data: PlanFormData) => void;
  mode: "create" | "edit";
};

export default function PlanForm({
  initialData,
  classTypes = [],
  onSubmit,
  mode,
}: PlanFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [price, setPrice] = useState(initialData?.price || 0);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [plansPublic, setPlansPublic] = useState(
    initialData?.plans_public ?? true
  );
  const [classLimits, setClassLimits] = useState<PlanClassLimit[]>([]);
  const [periodicity, setPeriodicity] = useState(
    initialData?.periodicity || "monthly"
  );

  // Inicializa os limites com base nos tipos de aula e nos dados iniciais
  useEffect(() => {
    if (!classTypes) return;

    setClassLimits(
      classTypes.map((ct) => {
        const existing = initialData?.class_limits?.find(
          (l) => l.class_type_id === ct.id
        );
        return (
          existing || {
            class_type_id: ct.id,
            included: false,
            max_sessions_per_week: null,
          }
        );
      })
    );
  }, [classTypes, initialData]);

  function handleClassLimitChange(
    class_type_id: string,
    field: "included" | "max_sessions_per_week",
    value: any
  ) {
    setClassLimits((prev) =>
      prev.map((cl) =>
        cl.class_type_id === class_type_id ? { ...cl, [field]: value } : cl
      )
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      description,
      price,
      is_active: isActive,
      plans_public: plansPublic,
      periodicity,
      class_limits: classLimits,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nome do Plano
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Preço */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preço (€)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          placeholder="0,00"
          required
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Periodicidade
        </label>
        <select
          value={periodicity}
          disabled={mode === "edit"}
          onChange={(e) =>
            setPeriodicity(
              e.target.value as "monthly" | "quarterly" | "semester" | "annualy"
            )
          }
          className={`mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
      ${mode === "edit" ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <option value="monthly">Mensal</option>
          <option value="quarterly">Trimestral</option>
          <option value="semester">Semestral</option>
          <option value="annualy">Anual</option>
        </select>
      </div>

      {/* Limites por tipo de aula */}
      <div>
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
          Limites por Tipo de Aula
        </h3>
        <div className="space-y-3">
          {classTypes.map((ct) => {
            const limit = classLimits.find(
              (l) => l.class_type_id === ct.id
            ) || {
              class_type_id: ct.id,
              included: false,
              max_sessions_per_week: null,
            };
            return (
              <div
                key={ct.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 gap-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={limit.included}
                    onChange={(e) =>
                      handleClassLimitChange(
                        ct.id,
                        "included",
                        e.target.checked
                      )
                    }
                  />
                  <span className="text-sm font-medium">{ct.name}</span>
                </div>

                {limit.included && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-300">
                      Máx./semana
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Ilimitado"
                      value={limit.max_sessions_per_week ?? ""}
                      onChange={(e) =>
                        handleClassLimitChange(
                          ct.id,
                          "max_sessions_per_week",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                      className="w-32 border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
                    />
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={limit.max_sessions_per_week === null}
                        onChange={(e) =>
                          handleClassLimitChange(
                            ct.id,
                            "max_sessions_per_week",
                            e.target.checked ? null : 1
                          )
                        }
                      />
                      Ilimitado
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ativo */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Ativo
        </label>
      </div>

      <Button>
        {mode === "create" ? "Criar Plano" : "Guardar Alterações"}
      </Button>
    </form>
  );
}
