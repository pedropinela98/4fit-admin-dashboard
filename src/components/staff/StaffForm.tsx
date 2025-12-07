import { useState } from "react";
import Button from "../ui/button/Button";
import { Staff } from "../../hooks/useStaff";

type StaffFormProps = {
  initialData?: Partial<Staff>;
  onSubmit: (
    data: Omit<Staff, "id" | "created_at" | "box_id" | "user_id">
  ) => void;
  mode: "create" | "edit";
};

// Traduções para mostrar ao utilizador
const roleTranslations: Record<"admin" | "coach" | "receptionist", string> = {
  admin: "Administrador",
  coach: "Treinador",
  receptionist: "Rececionista",
};

export default function StaffForm({
  initialData = {},
  onSubmit,
  mode,
}: StaffFormProps) {
  const [name, setName] = useState(initialData.name || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<Staff["role"]>(
    initialData.role || ["coach"]
  );
  const [active, setActive] = useState(initialData.active ?? true);

  function toggleRole(role: "admin" | "coach" | "receptionist") {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setIsSubmitting(true); // bloqueia o botão
    await onSubmit({
      name,
      email,
      role: roles,
      active,
      start_date:
        initialData.start_date || new Date().toISOString().split("T")[0],
      end_date: initialData.end_date,
    });
    setIsSubmitting(false); // desbloqueia quando o parent confirmar
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
          disabled={mode === "edit"}
          required
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled={mode === "edit"}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Funções em badges */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Funções
        </legend>
        <div className="flex flex-wrap gap-3">
          {(["admin", "coach", "receptionist"] as const).map((role) => (
            <label
              key={role}
              className={`flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer text-sm transition
                ${
                  roles.includes(role)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={roles.includes(role)}
                onChange={() => toggleRole(role)}
              />
              {/* Mostra tradução em português */}
              <span>{roleTranslations[role]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Estado ativo */}
      <div className="flex items-center">
        <input
          id="ativo"
          type="checkbox"
          checked={active}
          disabled={mode === "create"}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label
          htmlFor="ativo"
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          Ativo
        </label>
      </div>

      <Button disabled={isSubmitting}>
        {isSubmitting
          ? "A guardar..."
          : mode === "create"
          ? "Criar Staff"
          : "Guardar Alterações"}
      </Button>
    </form>
  );
}
