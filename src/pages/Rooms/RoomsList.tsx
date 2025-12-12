import { useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useParams } from "react-router-dom";
import { useRooms } from "../../hooks/useRooms";
import RoomsActionsDropdown from "../../components/rooms/RoomsActionsDropdown";
import { useToast } from "../../components/ui/Toast";

export default function RoomsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useToast();
  const { boxId = "" } = useParams<{ boxId?: string }>();
  const { rooms, loading, error, refetch, deleteRoom } = useRooms(boxId);

  const handleDelete = async (id: string) => {
    const result = await deleteRoom(id);

    if (result === true) {
      await refetch();
      addToast("Sala removida com sucesso!", "success");
    } else {
      addToast("Não foi possível remover a sala", "error");
    }
  };

  const filteredRooms = rooms.filter(
    (s) =>
      s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageMeta title="Salas | Gestão" description="" />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Salas
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gere as tuas salas
            </p>
          </div>

          <Link to={`/box/${boxId}/rooms/new`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Adicionar Nova Sala
            </Button>
          </Link>
        </div>

        {/* Pesquisa */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <input
            type="text"
            placeholder="Procurar sala por nome ou descrição..."
            className="w-full border rounded-lg px-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Lista de salas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">A carregar salas...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Erro: {error}{" "}
              <Button className="ml-2" onClick={refetch}>
                Tentar Novamente
              </Button>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? "Nenhuma sala encontrada com a pesquisa"
                : "Ainda não existem salas adicionadas"}
            </div>
          ) : (
            <>
              {/* Tabela Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Capacidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRooms.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">{s.name}</td>
                        <td className="px-6 py-4">{s.capacity}</td>
                        <td className="px-6 py-4">{s.description}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              s.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {s.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <RoomsActionsDropdown room={s} onDelete={handleDelete} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile */}
              <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRooms.map((s) => (
                  <div key={s.id} className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {s.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Capacidade: {s.capacity}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {s.description}
                        </p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                            s.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {s.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <RoomsActionsDropdown room={s} onDelete={handleDelete} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
