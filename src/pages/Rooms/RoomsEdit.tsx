import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import RoomsForm from "../../components/rooms/RoomsForm";
import { useRooms, Room } from "../../hooks/useRooms";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function RoomEdit() {
  const { id, boxId = "" } = useParams<{ id: string; boxId?: string }>();
  const { rooms, loading, updateRoom } = useRooms(boxId);
  const navigate = useNavigate();

  if (loading) {
    return <p>A carregar sala...</p>;
  }

  // tentar encontrar a sala
  const maybeRoom: Room | undefined = rooms.find((s) => s.id === id);

  if (!maybeRoom) {
    return <p className="text-red-500">Sala não encontrada</p>;
  }

  const room : Room = maybeRoom;

  async function handleEdit(data: Partial<Room>) {
    try {
      await updateRoom(room.id, data);
      navigate(`/box/${boxId}/rooms`);
    } catch (err) {
      console.error('Erro ao atualizar sala:', err);
    }
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Editar Sala" description="" />

      {/* Botão de voltar */}
      <button
        onClick={() => navigate(`/box/${boxId}/rooms`)}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar às Salas
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Editar {room.name}
      </h1>

      <RoomsForm mode="edit" initialData={room} onSubmit={handleEdit} />
    </div>
  );
}
