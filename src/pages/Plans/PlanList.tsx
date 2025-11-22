import { useState, useMemo } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useParams } from "react-router-dom";
import { usePlans } from "../../hooks/usePlans";
import PlanActionsDropdown from "../../components/plans/PlanActionsDropdown";
import Pagination from "../../components/ui/Pagination";

export default function PlanList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { boxId = "" } = useParams<{ boxId: string }>();
  const { plans, loading, error, refetch } = usePlans(boxId);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [periodicityFilter, setPeriodicityFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPlans = useMemo(() => {
    let result = plans;

    // Filtro por pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description || "").toLowerCase().includes(query)
      );
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      result = result.filter((p) =>
        statusFilter === "active" ? p.is_active : !p.is_active
      );
    }

    // Filtro por periodicidade
    if (periodicityFilter !== "all") {
      result = result.filter((p) => p.periodicity === periodicityFilter);
    }

    // Ordenação
    result.sort((a, b) => {
      let aField: any = a[sortField as keyof typeof a];
      let bField: any = b[sortField as keyof typeof b];

      if (sortField === "periodicity") {
        aField = translatePeriodicity(aField);
        bField = translatePeriodicity(bField);
      }

      if (typeof aField === "string") aField = aField.toLowerCase();
      if (typeof bField === "string") bField = bField.toLowerCase();

      if (aField < bField) return sortDirection === "asc" ? -1 : 1;
      if (aField > bField) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    plans,
    searchQuery,
    statusFilter,
    periodicityFilter,
    sortField,
    sortDirection,
  ]);

  const plansPerPage = 5;
  const totalPages = Math.ceil(filteredPlans.length / plansPerPage);
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * plansPerPage,
    currentPage * plansPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Função de tradução
  function translatePeriodicity(periodicity: string) {
    switch (periodicity) {
      case "monthly":
        return "Mensal";
      case "quarterly":
        return "Trimestral";
      case "semester":
        return "Semestral";
      case "annualy":
        return "Anual";
      default:
        return periodicity; // fallback
    }
  }

  return (
    <>
      <PageMeta title="Planos | Gestão" description="" />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Planos de Pagamento
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gere os diferentes planos de adesão (mensalidades, livre-trânsito,
              etc.)
            </p>
          </div>

          <Link to={`/box/${boxId}/plans/new`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Adicionar Novo Plano
            </Button>
          </Link>
        </div>

        {/* Pesquisa */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <input
            type="text"
            placeholder="Procurar plano por nome ou descrição..."
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
          <select
            className="border rounded-lg px-4 py-2"
            value={periodicityFilter}
            onChange={(e) => setPeriodicityFilter(e.target.value)}
          >
            <option className="dark:text-black" value="all">
              Todas as Periodicidades
            </option>
            <option className="dark:text-black" value="monthly">
              Mensal
            </option>
            <option className="dark:text-black" value="quarterly">
              Trimestral
            </option>
            <option className="dark:text-black" value="semester">
              Semestral
            </option>
            <option className="dark:text-black" value="annualy">
              Anual
            </option>
          </select>
        </div>

        {/* Lista de planos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">A carregar planos...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Erro: {"Não foi possivel proceder com o pedido"}{" "}
              <Button className="ml-2" onClick={refetch}>
                Tentar Novamente
              </Button>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? "Nenhum plano encontrado com a pesquisa"
                : "Não existe nenhum plano criado"}
            </div>
          ) : (
            <>
              {/* Tabela Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        Nome{" "}
                        {sortField === "name"
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer"
                        onClick={() => handleSort("price")}
                      >
                        Preço (€){" "}
                        {sortField === "price"
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer"
                        onClick={() => handleSort("periodicity")}
                      >
                        Periodicidade{" "}
                        {sortField === "periodicity"
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer"
                        onClick={() => handleSort("is_active")}
                      >
                        Estado{" "}
                        {sortField === "is_active"
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedPlans.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">{p.name}</td>
                        <td className="px-6 py-4">{p.price}€</td>
                        <td className="px-6 py-4">
                          {translatePeriodicity(p.periodicity)}
                        </td>
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
                          <PlanActionsDropdown plan={p} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>

              {/* Cards Mobile */}
              <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPlans.map((p) => (
                  <div key={p.id} className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {p.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {p.price}€ —{" "}
                        </p>
                      </div>
                      <PlanActionsDropdown plan={p} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {plans.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total de Planos
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {plans.filter((p) => p.is_active).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Ativos
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
              {plans.filter((p) => !p.is_active).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Inativos
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
