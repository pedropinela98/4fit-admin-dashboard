import { useState } from "react";
import Button from "../ui/button/Button";
import type { Insurance } from "../../hooks/useInsurances";

type InsuranceFormProps = {
  initialData?: Partial<Insurance>;
  onSubmit: (data: Omit<Insurance, "id" | "box_id" | "created_at">) => void;
  mode: "create" | "edit";
};

export default function InsuranceForm({
  initialData = {},
  onSubmit,
  mode,
}: InsuranceFormProps) {
  const [name, setName] = useState(initialData.name || "");
  const [period, setPeriod] = useState(initialData.period || "monthly");
  const [isActive, setIsActive] = useState(initialData.is_active ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onSubmit({
      name,
      period,
      is_active: isActive,
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

      {/* Período */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Período
        </label>
        <select
          value={period}
          disabled={mode === "edit"}
          onChange={(e) => setPeriod(e.target.value as Insurance["period"])}
          required
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="monthly">Mensal</option>
          <option value="quarterly">Trimestral</option>
          <option value="semester">Semestral</option>
          <option value="annualy">Anual</option>
        </select>
      </div>

      {/* Ativo */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Ativo
        </label>
      </div>

      <Button>
        {mode === "create" ? "Criar Seguro" : "Guardar Alterações"}
      </Button>
    </form>
  );
}
