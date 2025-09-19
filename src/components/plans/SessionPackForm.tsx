// src/components/sessionpacks/SessionPackForm.tsx
import { useState } from "react";
import Button from "../ui/button/Button";

type SessionPackFormProps = {
  initialData?: Partial<SessionPack>;
  onSubmit: (
    data: Omit<SessionPack, "id" | "created_at" | "updated_at" | "box_id">
  ) => void;
  mode: "create" | "edit";
};

export type SessionPack = {
  id: string;
  name: string;
  description?: string;
  price: number;
  session_count: number;
  validity_days: number;
  pack_public: boolean;
  is_active: boolean;
  box_id: string;
  created_at: string;
  updated_at: string;
};

export default function SessionPackForm({
  initialData = {},
  onSubmit,
  mode,
}: SessionPackFormProps) {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [price, setPrice] = useState(initialData.price?.toString() || "");
  const [sessionCount, setSessionCount] = useState(
    initialData.session_count?.toString() || ""
  );
  const [validityDays, setValidityDays] = useState(
    initialData.validity_days?.toString() || ""
  );
  const [packPublic, setPackPublic] = useState(initialData.pack_public ?? true);
  const [isActive, setIsActive] = useState(initialData.is_active ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      description,
      price: parseFloat(price),
      session_count: parseInt(sessionCount),
      validity_days: parseInt(validityDays),
      pack_public: packPublic,
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

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
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
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
          step="0.01"
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Nº de Sessões */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nº de Sessões
        </label>
        <input
          type="number"
          value={sessionCount}
          onChange={(e) => setSessionCount(e.target.value)}
          required
          min="1"
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Validade */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Validade (dias)
        </label>
        <input
          type="number"
          value={validityDays}
          onChange={(e) => setValidityDays(e.target.value)}
          required
          min="1"
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Checkboxes */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
        {mode === "create" ? "Criar Senha" : "Guardar Alterações"}
      </Button>
    </form>
  );
}
