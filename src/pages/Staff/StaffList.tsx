import { useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useStaff } from "../../hooks/useStaff";
import StaffActionsDropdown from "../../components/staff/StaffActionsDropdown";

export default function StaffList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { staff, loading, error, refetch } = useStaff();

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              Gere os teus administradores, coaches e rececionistas
            </p>
          </div>

          <Link to="/staff/new">
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
          ) : filteredStaff.length === 0 ? (
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Funções
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Criado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStaff.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">{s.name}</td>
                        <td className="px-6 py-4">{s.email}</td>
                        <td className="px-6 py-4">
                          {s.role
                            .map((r) => r.charAt(0).toUpperCase() + r.slice(1))
                            .join(", ")}
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
                          <StaffActionsDropdown staff={s} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile */}
              <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStaff.map((s) => (
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
                          {s.role.join(", ")}
                        </p>
                      </div>
                      <StaffActionsDropdown staff={s} />
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Criado em{" "}
                      {new Date(s.created_at).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                ))}
              </div>
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
              Coaches
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
              {staff.filter((s) => s.role.includes("rececionista")).length}
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
