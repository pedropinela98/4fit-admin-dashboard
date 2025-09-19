import { useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useSessionPacks } from "../../hooks/useSessionPacks";
import ActionsDropdown from "../../components/ActionsDropdown";

export default function SessionPackList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { sessionPacks, loading, error, refetch, deleteSessionPack } =
    useSessionPacks();

  const filteredPacks = sessionPacks.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase() ?? "")
  );

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

        {/* Pesquisa */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <input
            type="text"
            placeholder="Procurar senha por nome ou descrição..."
            className="w-full border rounded-lg px-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                        Preço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                        Sessões
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                        Validade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPacks.map((p) => (
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
                            editPath={`/plans/sessionpacks/${p.id}/edit`}
                            entityName={p.name}
                            onDelete={(id) => deleteSessionPack(id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile */}
              <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPacks.map((p) => (
                  <div key={p.id} className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{p.name}</h3>
                        <p className="text-sm">{p.price} €</p>
                        <p className="text-xs">{p.session_count} sessões</p>
                      </div>
                      <ActionsDropdown
                        entityId={p.id}
                        editPath={`/sessionpacks/${p.id}/edit`}
                        entityName={p.name}
                        onDelete={(id) => deleteSessionPack(id)}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Validade: {p.validity_days} dias
                    </p>
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
