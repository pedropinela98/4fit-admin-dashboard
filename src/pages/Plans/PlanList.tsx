import { useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useParams } from "react-router-dom";
import { usePlans } from "../../hooks/usePlans";
import PlanActionsDropdown from "../../components/plans/PlanActionsDropdown";

export default function PlanList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { boxId = "" } = useParams<{ boxId?: string }>();
  const { plans, loading, error, refetch } = usePlans(boxId);

  const filteredPlans = plans.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <input
            type="text"
            placeholder="Procurar plano por nome ou descrição..."
            className="w-full border rounded-lg px-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Preço (€)
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
                    {filteredPlans.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">{p.name}</td>
                        <td className="px-6 py-4">{p.price}€</td>
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
