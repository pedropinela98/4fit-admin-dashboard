import { useState, useMemo } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useParams } from "react-router-dom";
import { useSessionPacks } from "../../hooks/useSessionPacks";
import ActionsDropdown from "../../components/ActionsDropdown";
import Pagination from "../../components/ui/pagination";

export default function SessionPackList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const { boxId = "" } = useParams<{ boxId: string }>();
  const { sessionPacks, loading, error, refetch, deleteSessionPack } =
    useSessionPacks(boxId);

  // Filtrar e ordenar
  const filteredPacks = useMemo(() => {
    let result = sessionPacks;

    // Filtro por pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description?.toLowerCase() ?? "").includes(query)
      );
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      result = result.filter((p) =>
        statusFilter === "active" ? p.is_active : !p.is_active
      );
    }

    // Ordenação
    result.sort((a, b) => {
      let aField: any = a[sortField as keyof typeof a];
      let bField: any = b[sortField as keyof typeof b];

      if (typeof aField === "string") aField = aField.toLowerCase();
      if (typeof bField === "string") bField = bField.toLowerCase();

      if (aField < bField) return sortDirection === "asc" ? -1 : 1;
      if (aField > bField) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [sessionPacks, searchQuery, statusFilter, sortField, sortDirection]);

  // Paginação
  const packsPerPage = 5;
  const totalPages = Math.ceil(filteredPacks.length / packsPerPage);
  const paginatedPacks = filteredPacks.slice(
    (currentPage - 1) * packsPerPage,
    currentPage * packsPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <>
      <PageMeta title="Senhas | Gestão" description="" />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Senhas
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gere os packs de senhas disponíveis
            </p>
          </div>

          <Link to="/plans/sessionpacks/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Criar Nova Senha
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <input
            type="text"
            placeholder="Procurar senha por nome ou descrição..."
            className="w-full border rounded-lg px-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="border rounded-lg px-4 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option className="dark:text-black" value="all">
              Todos os Estados
            </option>
            <option className="dark:text-black" value="active">
              Ativos
            </option>
            <option className="dark:text-black" value="inactive">
              Inativos
            </option>
          </select>
        </div>

        {/* Lista */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">A carregar senhas...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Erro: {error}{" "}
              <Button className="ml-2" onClick={refetch}>
                Tentar Novamente
              </Button>
            </div>
          ) : filteredPacks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? "Nenhuma senha encontrada com a pesquisa"
                : "Ainda não existe nenhuma senha"}
            </div>
          ) : (
            <>
              {/* Tabela Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      {[
                        "name",
                        "price",
                        "session_count",
                        "validity_days",
                        "is_active",
                      ].map((field) => (
                        <th
                          key={field}
                          className="px-6 py-3 text-left text-xs font-medium uppercase cursor-pointer text-gray-500 dark:text-gray-400"
                          onClick={() => handleSort(field)}
                        >
                          {field === "name" && "Nome"}
                          {field === "price" && "Preço"}
                          {field === "session_count" && "Sessões"}
                          {field === "validity_days" && "Validade"}
                          {field === "is_active" && "Estado"}
                          {sortField === field
                            ? sortDirection === "asc"
                              ? " ↑"
                              : " ↓"
                            : ""}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedPacks.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">{p.name}</td>
                        <td className="px-6 py-4">{p.price} €</td>
                        <td className="px-6 py-4">{p.session_count}</td>
                        <td className="px-6 py-4">{p.validity_days} dias</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              p.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {p.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ActionsDropdown
                            entityId={p.id}
                            editPath={`/box/${p.box_id}/sessionpacks/${p.id}/edit`}
                            entityName={p.name}
                            onDelete={(id) => deleteSessionPack(id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Paginação */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>

              {/* Cards Mobile */}
              <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedPacks.map((p) => (
                  <div key={p.id} className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{p.name}</h3>
                        <p className="text-sm">{p.price} €</p>
                        <p className="text-xs">{p.session_count} sessões</p>
                        <p className="text-xs text-gray-400">
                          Validade: {p.validity_days} dias
                        </p>
                      </div>
                      <ActionsDropdown
                        entityId={p.id}
                        editPath={`/plans/sessionpacks/${p.id}/edit`}
                        entityName={p.name}
                        onDelete={(id) => deleteSessionPack(id)}
                      />
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
