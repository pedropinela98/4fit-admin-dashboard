
import PageMeta from "../../components/common/PageMeta";
import RoomsForm from "../../components/rooms/RoomsForm";
import { useNavigate } from "react-router";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function RoomCreate() {
  const navigate = useNavigate();

  function handleCreate(data: any) {
    console.log("Nova sala criada:", data);
    // aqui faria POST para API
    navigate("/rooms"); // redireciona de volta à lista
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Criar Sala" description="" />

      {/* Botão de voltar */}
      <button
        onClick={() => navigate("/rooms")}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar às Salas
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Criar Nova Sala
      </h1>

      <RoomsForm mode="create" onSubmit={handleCreate} />
    </div>
  );
}
