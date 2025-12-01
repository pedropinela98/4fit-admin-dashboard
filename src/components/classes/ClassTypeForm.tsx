import { useState, useEffect } from "react";
import Button from "../ui/button/Button";

// Tipos internos do formulário
export type ClassTypeFormData = {
  name: string;
  description?: string | null;
  color?: string | null;
  duration_default: number;
  capacity_default?: number;
  waitlist_default?: number;
};

type ClassTypeFormProps = {
  initialData?: Partial<ClassTypeFormData>;
  onSubmit: (data: ClassTypeFormData) => void;
  mode: "create" | "edit";
};

export default function ClassTypeForm({
  initialData,
  onSubmit,
  mode,
}: ClassTypeFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [color, setColor] = useState(initialData?.color || "#cccccc");
  const [durationDefault, setDurationDefault] = useState<number | "">(
    initialData?.duration_default ?? ""
  );
  const [capacityDefault, setCapacityDefault] = useState<number | "">(
    initialData?.capacity_default ?? ""
  );
  const [waitlistDefault, setWaitlistDefault] = useState<number | "">(
    initialData?.waitlist_default ?? ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onSubmit({
      name: name.trim(),
      description: description === "" ? null : description,
      color: color,
      duration_default: Number(durationDefault),
      capacity_default: capacityDefault === "" ? undefined : capacityDefault,
      waitlist_default: waitlistDefault === "" ? undefined : waitlistDefault,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nome
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

      {/* Cor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Cor
        </label>
        <div className="mt-1 flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-8 p-0 border rounded"
            aria-label="Escolher cor"
          />
        </div>
      </div>

      {/* Duração padrão */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Duração
        </label>
        <input
          type="number"
          min={0}
          value={durationDefault}
          onChange={(e) =>
            setDurationDefault(e.target.value === "" ? "" : Number(e.target.value))
          }
          required
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Capacidade padrão */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Capacidade
        </label>
        <input
          type="number"
          min={0}
          value={capacityDefault}
          onChange={(e) =>
            setCapacityDefault(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Lista de espera padrão */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Lista de espera
        </label>
        <input
          type="number"
          min={0}
          value={waitlistDefault}
          onChange={(e) =>
            setWaitlistDefault(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <Button>
        {mode === "create" ? "Criar Tipo de Aula" : "Guardar Alterações"}
      </Button>
    </form>
  );
}
