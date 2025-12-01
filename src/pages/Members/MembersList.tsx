import { useState } from "react";
import { Link } from "react-router";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useMembers } from "../../hooks/useMembers";
import EntityActionsDropdown from "../../components/ActionsDropdown";
import { supabase } from "../../lib/supabase";

export default function MemberList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { boxId = "" } = useParams<{ boxId?: string }>();

  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterInsurance, setFilterInsurance] = useState<
    "all" | "valid" | "expiring_soon" | "expired"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { members, loading, error, refetch } = useMembers(boxId, null, false);

  async function handleDeleteMember(userDetailId: string, boxId: string) {
    try {
      console.log(userDetailId + boxId);

      const { data, error } = await supabase.rpc("soft_delete_user_from_box", {
        p_user_id: userDetailId,
        p_box_id: boxId,
      });

      if (error) {
        throw new Error(`Erro ao eliminar membro: ${error.message}`);
      }

      console.log("✅ Membro eliminado:", data);
      refetch();
      // Aqui podes atualizar o estado da lista de membros no frontend, se quiseres
    } catch (err) {
      console.error("❌ Erro ao eliminar membro:", err);
    }
  }

  // ---- Filtros ----
  const filteredMembers = members
    .filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((m) => {
      // membership_active derivado do estado de pagamento
      const membership_active = m.membership_payment_state === "paid";
      if (filterStatus === "active") return membership_active;
      if (filterStatus === "inactive") return !membership_active;
      return true;
    })
    .filter((m) => {
      // insurance_state derivado do estado de pagamento
      const insurance_state =
        m.insurance_payment_state === "paid" ? "valid" : "expired";
      if (filterInsurance === "all") return true;
      return insurance_state === filterInsurance;
    });

  // ---- Paginação ----
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  if (loading) return <p>Carregando membros...</p>;
  if (error) return <p>Erro: {error}</p>;

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

          <Link to={`/box/${boxId}/members/new`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Adicionar Novo Membro
            </Button>
          </Link>
        </div>

        {/* Pesquisa e filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border space-y-4">
          <input
            type="text"
            placeholder="Procurar membro por nome/email..."
            className="w-full border rounded-lg px-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex flex-wrap gap-4">
            {/* Filtro Subscrição */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">Todas Subscrições</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>

            {/* Filtro Seguro */}
            <select
              value={filterInsurance}
              onChange={(e) => setFilterInsurance(e.target.value as any)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">Todos Seguros</option>
              <option value="valid">Válidos</option>
              <option value="expiring_soon">A Expirar</option>
              <option value="expired">Expirados</option>
            </select>
          </div>
        </div>

        {/* Lista de membros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">A carregar membros...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Erro: {error}{" "}
              <Button className="ml-2" /* onClick={fetch} */>
                Tentar Novamente
              </Button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ||
              filterStatus !== "all" ||
              filterInsurance !== "all"
                ? "Nenhum membro encontrado com os filtros aplicados"
                : "Ainda não existem membros adicionados"}
            </div>
          ) : (
            <>
              {/* Tabela */}
              <div className="overflow-x-auto">
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
                        Subscrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Seguro
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedMembers.map((m) => {
                      const membership_active =
                        m.membership_payment_state === "paid";
                      let insurance_state:
                        | "valid"
                        | "expiring_soon"
                        | "expired" = "expired";
                      if (m.insurance_payment_state === "paid")
                        insurance_state = "valid";
                      if (m.insurance_payment_state === "expiring")
                        insurance_state = "expiring_soon";

                      return (
                        <tr
                          key={m.user_id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={`/box/${boxId}/members/${m.user_id}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {m.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4">{m.email}</td>
                          <td className="px-6 py-4">
                            {membership_active ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                Ativo
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                Inativo
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {insurance_state === "valid" && (
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                Válido
                              </span>
                            )}
                            {insurance_state === "expiring_soon" && (
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                A Expirar
                              </span>
                            )}
                            {insurance_state === "expired" && (
                              <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                Expirado
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <EntityActionsDropdown
                              entityId={m.user_id}
                              editPath={`/box/${boxId}/members/${m.user_id}`}
                              entityName={m.name}
                              onDelete={() =>
                                handleDeleteMember(m.user_id, boxId)
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

        {/* Resumo de Subscrições */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Ativos */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {
                members.filter(
                  (m) => m.membership_active || m.session_pack_active
                ).length
              }
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Subscrições Ativas
            </div>
          </div>

          {/* A Expirar */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              {
                members.filter((m) => {
                  if (!m.membership_end) return false;
                  const endDate = new Date(m.membership_end);
                  const today = new Date();
                  const diffDays = Math.ceil(
                    (endDate.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return diffDays > 0 && diffDays <= 30;
                }).length
              }
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              A Expirar (≤ 5 dias)
            </div>
          </div>

          {/* Expirados */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
              {
                members.filter((m) => {
                  return (
                    !m.membership_end || new Date(m.membership_end) < new Date()
                  );
                }).length
              }
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Subscrições Expiradas
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
