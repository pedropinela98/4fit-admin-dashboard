// src/pages/insurances/InsuranceList.tsx
import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useInsurances, Insurance } from "../../hooks/useInsurances";
import ActionsDropdown from "../../components/ActionsDropdown";
import Pagination from "../../components/ui/Pagination";

export default function InsuranceList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Insurance>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const { boxId = "" } = useParams<{ boxId: string }>();
  const { insurances, loading, error, refetch, deleteInsurance } =
    useInsurances(boxId);

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

  // Filtrar e ordenar
  const filteredInsurances = useMemo(() => {
    let result = insurances;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(query));
    }

    if (statusFilter !== "all") {
      result = result.filter((i) =>
        statusFilter === "active" ? i.is_active : !i.is_active
      );
    }

    if (periodFilter !== "all") {
      result = result.filter((i) => i.period === periodFilter);
    }

    result.sort((a, b) => {
      let aField: any = a[sortField];
      let bField: any = b[sortField];

      if (typeof aField === "string") aField = aField.toLowerCase();
      if (typeof bField === "string") bField = bField.toLowerCase();

      if (aField < bField) return sortDirection === "asc" ? -1 : 1;
      if (aField > bField) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    insurances,
    searchQuery,
    statusFilter,
    periodFilter,
    sortField,
    sortDirection,
  ]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredInsurances.length / itemsPerPage);
  const paginatedInsurances = filteredInsurances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Insurance) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <>
      <PageMeta title="Seguros | Gestão" description="" />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Seguros
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gere os seguros disponíveis
            </p>
          </div>

          <Link to={`/box/${boxId}/insurances/new`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Criar Novo Seguro
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <input
            type="text"
            placeholder="Procurar seguro por nome..."
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
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
          >
            <option className="dark:text-black" value="all">
              Todos os Períodos
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

        {/* Lista */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">A carregar seguros...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Erro: {error}{" "}
              <Button className="ml-2" onClick={refetch}>
                Tentar Novamente
              </Button>
            </div>
          ) : filteredInsurances.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? "Nenhum seguro encontrado"
                : "Ainda não existe nenhum seguro"}
            </div>
          ) : (
            <>
              {/* Tabela Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      {["name", "period", "price", "is_active"].map((field) => (
                        <th
                          key={field}
                          className="px-6 py-3 text-left text-xs font-medium uppercase cursor-pointer text-gray-500 dark:text-gray-400"
                          onClick={() => handleSort(field as keyof Insurance)}
                        >
                          {field === "name" && "Nome"}
                          {field === "period" && "Período"}
                          {field === "price" && "Preço"}
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
                    {paginatedInsurances.map((i) => (
                      <tr
                        key={i.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">{i.name}</td>
                        <td className="px-6 py-4">
                          {" "}
                          {translatePeriodicity(i.period)}
                        </td>
                        <td className="px-6 py-4">{i.price}€</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              i.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {i.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ActionsDropdown
                            entityId={i.id}
                            editPath={`/box/${boxId}/insurances/${i.id}/edit`}
                            entityName={i.name}
                            onDelete={deleteInsurance}
                          />
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
                {paginatedInsurances.map((i) => (
                  <div
                    key={i.id}
                    className="p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{i.name}</h3>
                      <p className="text-sm">{i.period}</p>
                      <p className="text-xs text-gray-400">
                        {i.is_active ? "Ativo" : "Inativo"}
                      </p>
                    </div>
                    <ActionsDropdown
                      entityId={i.id}
                      editPath={`/box/${boxId}/insurances/${i.id}/edit`}
                      entityName={i.name}
                      onDelete={deleteInsurance}
                    />
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
