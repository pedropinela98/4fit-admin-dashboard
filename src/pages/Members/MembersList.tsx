import { useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useMembers } from "../../hooks/useMembers";
import EntityActionsDropdown from "../../components/ActionsDropdown";

export default function MemberList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { members, loading, error, refetch, deleteMember } = useMembers();

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageMeta title="Membros | Gestão" description="" />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Membros
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gere os teus membros, subscrições e seguros
            </p>
          </div>

          <Link to="/members/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Adicionar Novo Membro
            </Button>
          </Link>
        </div>

        {/* Pesquisa */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <input
            type="text"
            placeholder="Procurar membro por nome ou email..."
            className="w-full border rounded-lg px-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Lista de membros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">A carregar membros...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Erro: {error}{" "}
              <Button className="ml-2" onClick={refetch}>
                Tentar Novamente
              </Button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? "Nenhum membro encontrado com a pesquisa"
                : "Ainda não existem membros adicionados"}
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
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Subscrição
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Seguro
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredMembers.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={`/members/${m.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {m.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4">{m.email}</td>
                        <td className="px-6 py-4">
                          {m.membership_active ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Ativo até {m.membership_end}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {m.insurance_state === "valid" && (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Válido até {m.insurance_end}
                            </span>
                          )}
                          {m.insurance_state === "expiring_soon" && (
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              Expira em {m.insurance_end}
                            </span>
                          )}
                          {m.insurance_state === "expired" && (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              Expirado em {m.insurance_end}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <EntityActionsDropdown
                            entityId={m.id}
                            editPath={`/members/${m.id}/edit`}
                            entityName={m.name}
                            onDelete={deleteMember}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile */}
              <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMembers.map((m) => (
                  <div key={m.id} className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          <Link
                            to={`/members/${m.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {m.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {m.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {m.membership_active
                            ? `Ativo até ${m.membership_end}`
                            : "Inativo"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Seguro:{" "}
                          {m.insurance_state === "valid" && (
                            <span className="text-green-600">
                              até {m.insurance_end}
                            </span>
                          )}
                          {m.insurance_state === "expiring_soon" && (
                            <span className="text-yellow-600">
                              expira em {m.insurance_end}
                            </span>
                          )}
                          {m.insurance_state === "expired" && (
                            <span className="text-red-600">
                              expirado em {m.insurance_end}
                            </span>
                          )}
                        </p>
                      </div>
                      <EntityActionsDropdown
                        entityId={m.id}
                        editPath={`/members/${m.id}/edit`}
                        entityName={m.name}
                        onDelete={deleteMember}
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
