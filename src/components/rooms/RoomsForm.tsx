import { useState } from "react";
import Button from "../ui/button/Button";
import { Room } from "../../hooks/useRooms";

type RoomFormProps = {
  initialData?: Partial<Room>;
  onSubmit: (
    data: Omit<Room, "id" | "box_id" | "created_at" | "updated_at">
  ) => void;
  mode: "create" | "edit";
};

export default function RoomsForm({
  initialData = {},
  onSubmit,
  mode,
}: RoomFormProps) {
  
  const [active, setActive] = useState(initialData.active ?? true);
  const [capacity, setCapacity] = useState(initialData.capacity ?? 1);
  const [description, setDescription] = useState(initialData.description || "");
  const [name, setName] = useState(initialData.name || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      active,
      capacity,
      description,
      name
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Capacity
        </label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : 0)}
          required
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex items-center">
        <input
          id="ativa"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label
          htmlFor="ativa"
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          Ativa
        </label>
      </div>

      <Button>
        {mode === "create" ? "Criar Sala" : "Guardar Alterações"}
      </Button>
    </form>
  );
}
