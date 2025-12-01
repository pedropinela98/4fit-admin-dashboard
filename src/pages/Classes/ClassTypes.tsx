import './classTypes.css';
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useClassTypes} from "../../hooks/useClassTypes";
import { useToast } from "../../components/ui/Toast";
import PageMeta from "../../components/common/PageMeta";
import { Link } from "react-router";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import ClassTypeActionsDropdown from "../../components/classes/ClassTypeActionsDropdown";
import Pagination from "../../components/ui/Pagination";

export default function ClassTypeList(){
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useToast();
  const { boxId = "" } = useParams<{ boxId: string }>();
  const { classTypes, loading, error, refetch, deleteClassType } = useClassTypes(boxId);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredClassTypes = useMemo(() => {
    let result = [...classTypes];;

    // Filtro por pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description || "").toLowerCase().includes(query)
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
  }, [
    classTypes,
    searchQuery,
    sortField,
    sortDirection
  ]);

  const classTypesPerPage = 5;
  const totalPages = Math.ceil(filteredClassTypes.length / classTypesPerPage);
  const paginatedClassTypes = filteredClassTypes.slice(
    (currentPage - 1) * classTypesPerPage,
    currentPage * classTypesPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteClassType(id);

    if (result === true) {
      await refetch();
      addToast("Tipo de aula removido com sucesso!", "success");
    } else {
      addToast("Não foi possivel remover o tipo de aula", "error");
    }
  }

  return (
    <>
      <PageMeta title="Tipos de Aulas | Gestão" description="" />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Tipos de Aulas
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gere os diferentes tipos de aulas
            </p>
          </div>

          <Link to={`/box/${boxId}/classes/types/new`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Adicionar Novo Tipo de Aula
            </Button>
          </Link>
        </div>

        {/* Pesquisa */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <input
            type="text"
            placeholder="Procurar tipo de aula por nome ou descrição..."
            className="w-full border rounded-lg px-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Lista de tipos de aula */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">A carregar tipos de aulas...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Erro: {"Não foi possivel proceder com o pedido"}{" "}
              <Button className="ml-2" onClick={refetch}>
                Tentar Novamente
              </Button>
            </div>
          ) : filteredClassTypes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? "Nenhum tipo de aula encontrado com a pesquisa"
                : "Não existe nenhum tipo de aula criado"}
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
                        onClick={() => handleSort("description")}
                      >
                        Descrição {" "}
                        {sortField === "description"
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer"
                        onClick={() => handleSort("color")}
                      >
                        Cor{" "}
                        {sortField === "color"
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer"
                        onClick={() => handleSort("duration_default")}
                      >
                        Duração{" "}
                        {sortField === "duration_default"
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer"
                        onClick={() => handleSort("capacity_default")}
                      >
                        Capacidade{" "}
                        {sortField === "capacity_default"
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer"
                        onClick={() => handleSort("waitlist_default")}
                      >
                        Lista de Espera{" "}
                        {sortField === "waitlist_default"
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
                    {paginatedClassTypes.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">{p.name}</td>
                        <td className="px-6 py-4">{p.description}</td>

                        <td className="px-6 py-4 text-left align-middle">
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded border"
                            style={{ backgroundColor: p.color }}
                            aria-label={`Cor ${p.color}`}
                          />
                        </td>

                        <td className="px-6 py-4 text-left align-middle">
                          {p.duration_default} min
                        </td>

                        <td className="px-6 py-4 text-left align-middle">
                          {p.capacity_default}
                        </td>

                        <td className="px-6 py-4 text-left align-middle">
                          {p.waitlist_default}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <ClassTypeActionsDropdown
                            onDelete={(id) => handleDelete(id)}
                            classType={p}
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
                {filteredClassTypes.map((p) => (
                  <div key={p.id} className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {p.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {p.description}
                        </p>
                      </div>
                      <ClassTypeActionsDropdown
                        onDelete={(id) => handleDelete(id)}
                        classType={p}
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