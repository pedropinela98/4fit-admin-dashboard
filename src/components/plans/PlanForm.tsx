import { useState } from "react";
import Button from "../ui/button/Button";

// mock temporário de tipos de aula
const mockClassTypes = [
  { id: "1", name: "CrossFit" },
  { id: "2", name: "Open Box" },
  { id: "3", name: "Weightlifting" },
];

type PlanFormProps = {
  initialData?: Partial<PlanFormData>;
  onSubmit: (data: PlanFormData) => void;
  mode: "create" | "edit";
};

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
  class_limits: PlanClassLimit[];
};

export default function PlanForm({
  initialData,
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
  const [classLimits, setClassLimits] = useState<PlanClassLimit[]>(
    initialData?.class_limits ||
      mockClassTypes.map((ct) => ({
        class_type_id: ct.id,
        included: false,
        max_sessions_per_week: null,
      }))
  );

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
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Configuração de aulas por tipo */}
      <div>
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
          Limites por Tipo de Aula
        </h3>
        <div className="space-y-3">
          {mockClassTypes.map((ct) => {
            const limit = classLimits.find((l) => l.class_type_id === ct.id)!;
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
