import { useState } from "react";
import { Link, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useStaff } from "../../hooks/useStaff";
import StaffActionsDropdown from "../../components/staff/StaffActionsDropdown";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/ui/Toast";

export default function StaffList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { boxId = "" } = useParams<{ boxId?: string }>();

  const { staff, loading, error, refetch } = useStaff(boxId, null);
  const { addToast } = useToast();

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ordenação
  const [sortConfig, setSortConfig] = useState<{
    key: keyof any;
    direction: "asc" | "desc";
  } | null>(null);

  function handleSort(key: keyof any) {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  }

  // Tradução dos roles
  const translatedRole = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "coach":
        return "Treinador";
      case "receptionist":
        return "Rececionista";
      default:
        return role;
    }
  };

  // Filtro de pesquisa
  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.some((r) =>
        translatedRole(r).toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Ordenação aplicada
  const sortedStaff = sortConfig
    ? [...filteredStaff].sort((a, b) => {
        const aVal = (a as any)[sortConfig.key];
        const bVal = (b as any)[sortConfig.key];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        if (typeof aVal === "boolean" && typeof bVal === "boolean") {
          return sortConfig.direction === "asc"
            ? Number(aVal) - Number(bVal)
            : Number(bVal) - Number(aVal);
        }
        if (aVal instanceof Date && bVal instanceof Date) {
          return sortConfig.direction === "asc"
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }
        return 0;
      })
    : filteredStaff;

  // Paginação aplicada
  const totalPages = Math.ceil(sortedStaff.length / itemsPerPage);
  const paginatedStaff = sortedStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("Box_Staff")
        .delete()
        .eq("user_id", userId)
        .eq("box_id", boxId);
      if (error) throw error;

      addToast("Staff removido com sucesso!", "success");
      refetch(); // atualizar a lista
    } catch (err: any) {
      console.error("Erro ao remover staff:", err);
      addToast("Erro ao remover staff", "error");
    }
  };

  return (
    <>
      <PageMeta title="Staff | Gestão" description="" />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Staff
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gere os teus administradores, treinadores e rececionistas
            </p>
          </div>

          <Link to={`/box/${boxId}/staff/new`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Adicionar Novo Staff
            </Button>
          </Link>
        </div>

        {/* Pesquisa */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <input
            type="text"
            placeholder="Procurar staff por nome, email ou função..."
            className="w-full border rounded-lg px-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Lista de staff */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">A carregar staff...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Erro: {error}{" "}
              <Button className="ml-2" onClick={refetch}>
                Tentar Novamente
              </Button>
            </div>
          ) : paginatedStaff.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? "Nenhum staff encontrado com a pesquisa"
                : "Ainda não existe staff adicionado"}
            </div>
          ) : (
            <>
              {/* Tabela Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th
                        onClick={() => handleSort("name")}
                        className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                      >
                        Nome
                      </th>
                      <th
                        onClick={() => handleSort("email")}
                        className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                      >
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Funções
                      </th>
                      <th
                        onClick={() => handleSort("active")}
                        className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                      >
                        Estado
                      </th>
                      <th
                        onClick={() => handleSort("created_at")}
                        className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                      >
                        Criado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedStaff.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">{s.name}</td>
                        <td className="px-6 py-4">{s.email}</td>
                        <td className="px-6 py-4">
                          {s.role.map((r) => translatedRole(r)).join(", ")}
                        </td>
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
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(s.created_at).toLocaleDateString("pt-PT")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <StaffActionsDropdown
                            staff={s}
                            boxId={boxId}
                            onDelete={handleDelete}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile */}
              <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedStaff.map((s) => (
                  <div key={s.id} className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {s.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {s.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {s.role.map((r) => translatedRole(r)).join(", ")}
                        </p>
                      </div>
                      <StaffActionsDropdown
                        staff={s}
                        boxId={boxId}
                        onDelete={handleDelete}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Criado em{" "}
                      {new Date(s.created_at).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {staff.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total de Staff
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {staff.filter((s) => s.role.includes("coach")).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Treinadores
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {staff.filter((s) => s.role.includes("admin")).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Administradores
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {staff.filter((s) => s.role.includes("receptionist")).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Rececionistas
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
