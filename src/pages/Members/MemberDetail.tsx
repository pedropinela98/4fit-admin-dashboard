import { useState } from "react";
import { useParams, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { useMembers, Member } from "../../hooks/useMembers";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/24/solid";
import { Modal } from "../../components/ui/modal/index";
import AddPlanModal from "../../components/AddPlanModal";
import EditPlanModal from "../../components/EditPlanModal";
import EditInsuranceModal from "../../components/EditInsuranceModal";
import AddInsuranceModal from "../../components/AddInsuranceModal";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/ui/Toast";
import { addMonths } from "date-fns";

export default function MemberDetail() {
  const { id = "" } = useParams<{ id?: string }>();
  const { boxId = "" } = useParams<{ boxId?: string }>();
  const { members, loading, error, refetch } = useMembers(boxId, id, true);
  const { addToast } = useToast();
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isMembership, setIsMembership] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [isAddInsuranceModalOpen, setIsAddInsuranceModalOpen] = useState(false);
  const [selectedFuturePlan, setSelectedFuturePlan] = useState<Member | null>(
    null
  );
  const [isEditInsuranceModalOpen, setIsEditInsuranceModalOpen] =
    useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">A carregar membro...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Ocorreu um erro ao carregar o membro.
      </div>
    );
  }

  const member = members.find((m) => m.user_id === id);

  if (!member) {
    return (
      <div className="p-8 text-center text-gray-500">
        Membro não encontrado.
      </div>
    );
  }

  // Plano atual: membership OU session pack ativo
  const currentMembership = members.find(
    (m) =>
      m.user_id === id &&
      (m.membership_active ||
        (m.membership_payment_state === "pending" &&
          m.membership_id != null &&
          !m.membership_future))
  );

  const currentInsurance = members.find(
    (m) =>
      m.user_id === id &&
      (m.insurance_active ||
        (m.user_insurance_id != null && !m.membership_future))
  );

  const futureInsurance = members.filter(
    (m) => m.user_insurance_id != null && m.membership_future
  );

  const currentSessionPack = members.find(
    (m) =>
      m.user_id === id &&
      m.session_pack_name != "" &&
      (m.sessions_left ?? 0) > 0
  );
  const currentPlan = currentMembership || currentSessionPack;

  // Planos futuros: membership OU session pack futuros
  const futureMemberships = members.filter(
    (m) => m.user_id === id && m.membership_future
  );
  const futureSessionPacks = members.filter(
    (m) => m.user_id === id && m.session_pack_future
  );
  const futurePlans = [...futureMemberships, ...futureSessionPacks];

  // Determinar data de fim (membership ou session pack)
  const endDatePlan =
    member.membership_active && member.membership_end
      ? member.membership_end
      : member.session_pack_active && member.session_pack_end
      ? member.session_pack_end
      : undefined;

  async function handleCreatePlan(
    planId: string,
    price: number,
    discount: number,
    startDate: string,
    isPaid: boolean,
    isMembership: boolean
  ) {
    try {
      // calcular preço final após desconto
      const finalPrice = price - (discount || 0);

      // fim da mensalidade = 30 dias depois (ou o que usares)
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const { error } = await supabase.rpc("create_membership_or_pack", {
        p_user_id: id,
        p_plan_id: planId,
        p_start_date: startDate,
        p_end_date: endDate.toISOString().split("T")[0],
        p_price: finalPrice,
        p_is_paid: isPaid,
        p_is_membership: isMembership,
      });

      if (error) {
        throw new Error(error.message || "Erro ao associar plano");
      }
      setIsAddPlanModalOpen(false);
      await refetch();
      addToast("Plano associado com sucesso!", "success");
    } catch (err) {
      addToast("Não foi possivel associar o plano", "error");
    }
  }

  async function handleEditPlan(isPaid: boolean, planId: string | null) {
    if (!planId) return;

    if (isPaid) {
      const { error } = await supabase.rpc("update_membership_payment_status", {
        p_membership_id: planId,
        p_userdetail_id: id,
      });

      if (error) {
        addToast("Erro ao atualizar pagamento", "error");
        return;
      }
      await refetch();
      addToast("Pagamento atualizado com sucesso!", "success");
    }
  }

  async function handleEditInsurance(
    isPaid: boolean,
    insuranceId: string | null
  ) {
    if (!insuranceId) return;

    if (isPaid) {
      const { error } = await supabase.rpc("update_insurance_payment_status", {
        p_user_insurance_id: insuranceId,
        p_user_id: id,
      });

      if (error) {
        addToast("Erro ao atualizar pagamento", "error");
        return;
      }
      await refetch();
      setIsEditInsuranceModalOpen(false);
      addToast("Pagamento atualizado com sucesso!", "success");
    }
  }

  async function confirmDeactivate() {
    const { error } = await supabase.rpc("deactivate_user_session_packs", {
      p_box_id: boxId,
      p_user_id: id,
    });

    if (error) {
      addToast("Erro ao desativar senhas", "error");
      return;
    }
    await refetch();
    setShowConfirmModal(false);
    addToast("Senhas desativadas com sucesso", "success");
  }

  async function handleCancelPlan(planId: string | null) {
    if (!planId) return;

    const { error } = await supabase.rpc("delete_membership", {
      p_membership_id: planId,
      p_user_id: id,
    });

    if (error) {
      addToast("Erro ao cancelar plano", "error");
      return;
    }
    await refetch();
    setIsEditPlanModalOpen(false);
    addToast("Plano cancelado com sucesso!", "success");
  }

  async function cancelInsurance(insuranceId: string | null) {
    if (!insuranceId) return;

    const { error } = await supabase.rpc("delete_user_insurance", {
      p_user_insurance_id: insuranceId,
    });

    if (error) {
      addToast("Erro ao cancelar seguro", "error");
      return;
    }
    setIsEditInsuranceModalOpen(false);
    await refetch();
    addToast("Seguro cancelado com sucesso!", "success");
  }

  async function handleSaveInsurance(
    insuranceId: string,
    price: number,
    startDate: string,
    isPaid: boolean,
    period: string
  ) {
    try {
      // Converter startDate string para Date
      const start = new Date(startDate);

      // Calcular endDate consoante o período
      let end: Date | null = null;
      if (period === "monthly") {
        end = addMonths(start, 1);
      } else if (period === "quarterly") {
        end = addMonths(start, 3);
      } else if (period === "semester") {
        end = addMonths(start, 6);
      } else if (period === "yearly") {
        end = addMonths(start, 12);
      }

      const endDateStr = end ? end.toISOString().split("T")[0] : null;

      const { error } = await supabase.rpc("create_insurance", {
        p_user_id: id, // id do utilizador atual
        p_insurance_id: insuranceId, // id do seguro escolhido
        p_start_date: startDate, // data de início (YYYY-MM-DD)
        p_end_date: endDateStr ?? "", // se tiver fim, podes passar aqui
        p_price: price,
        p_is_paid: isPaid,
      });

      if (error) {
        throw new Error(error.message || "Erro ao associar seguro");
      }
      setIsAddInsuranceModalOpen(false);
      refetch();
      addToast("Seguro associado com sucesso", "success");
    } catch (err) {
      addToast("Erro ao associar seguro", "error");
    }
  }

  return (
    <div className="space-y-6">
      <PageMeta title={`${member.name} | Membro`} description="" />

      {/* Botão voltar */}
      <Link
        to={`/box/${boxId}/members`}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar à lista de membros
      </Link>

      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={member.name}
            className="w-20 h-20 rounded-full object-cover border"
          />
        ) : (
          <div className="w-20 h-20 rounded-full border flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <UserIcon className="h-10 w-10 text-gray-400" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {member.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {member.email}
          </p>
          {member.phone && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {member.phone}
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-8">
        {/* ===== Planos ===== */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Planos
          </h2>
          {futurePlans.length === 0 && currentPlan?.membership_id != null && (
            <div className="mb-4">
              <button
                onClick={() => {
                  setIsAddPlanModalOpen(true);
                  setIsMembership(true);
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Adicionar plano
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Memberships */}
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Plano atual
                  </h3>
                  {currentPlan?.membership_id ? (
                    <button
                      onClick={() => setIsEditPlanModalOpen(true)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Editar Plano
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAddPlanModalOpen(true);
                        setIsMembership(true);
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Adicionar Plano
                    </button>
                  )}
                </div>

                {currentPlan?.membership_id ? (
                  <>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {currentPlan.membership_plan_name}
                    </p>
                    {currentPlan.membership_payment_state === "pending" ? (
                      <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        Pagamento Pendente
                      </span>
                    ) : (
                      <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Ativo
                      </span>
                    )}
                    {currentPlan.membership_end && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        válido até{" "}
                        {new Date(
                          currentPlan.membership_end
                        ).toLocaleDateString("pt-PT")}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    Nenhum plano ativo
                  </p>
                )}

                {/* Planos futuros */}
                {futurePlans.length > 0 && (
                  <div className="space-y-4 mt-4">
                    {futurePlans.map((fp) => (
                      <div
                        key={fp.membership_id}
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Plano agendado
                          </h4>
                          <button
                            onClick={() => {
                              setSelectedFuturePlan(fp);
                              setIsEditPlanModalOpen(true);
                            }}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Editar
                          </button>
                        </div>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {fp.membership_plan_name}
                        </p>
                        <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          Agendado
                        </span>
                        {fp.membership_payment_state !== "paid" && (
                          <span className="inline-block ml-2 mt-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            Pagamento Pendente
                          </span>
                        )}
                        {fp.membership_start && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            começa em{" "}
                            {new Date(fp.membership_start).toLocaleDateString(
                              "pt-PT"
                            )}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Session Packs */}
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Packs de sessões
                  </h3>
                  <button
                    onClick={() => {
                      setIsAddPlanModalOpen(true);
                      setIsMembership(false);
                    }}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Adicionar Pack
                  </button>
                </div>

                {(currentSessionPack?.sessions_left ?? 0) > 0 ? (
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      Restam {member.sessions_left} sessões no total
                    </p>

                    <button
                      onClick={() => {
                        setShowConfirmModal(true);
                      }}
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Desativar Pack
                    </button>
                  </div>
                ) : (
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    Nenhum pack ativo
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Seguros ===== */}
        <div>
          <div className="flex gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Seguro
            </h2>
            {futureInsurance.length === 0 &&
              currentInsurance?.user_insurance_id != null && (
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setIsAddInsuranceModalOpen(true);
                    }}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Adicionar plano
                  </button>
                </div>
              )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seguro atual */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Seguro atual
                </h3>
                {currentInsurance?.user_insurance_id ? (
                  <button
                    onClick={() => setIsEditInsuranceModalOpen(true)}
                    className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Editar Seguro
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAddInsuranceModalOpen(true)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Adicionar Seguro
                  </button>
                )}
              </div>

              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {currentInsurance?.insurance_name || "Sem seguro"}
              </p>

              {currentInsurance?.user_insurance_id != null &&
              currentInsurance?.insurance_payment_state === "pending" ? (
                <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Pagamento Pendente
                </span>
              ) : currentInsurance?.insurance_active ? (
                <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Ativo
                </span>
              ) : (
                <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                  Inativo
                </span>
              )}

              {currentInsurance?.insurance_end &&
                currentInsurance?.insurance_active && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    válido até{" "}
                    {new Date(
                      currentInsurance?.insurance_end
                    ).toLocaleDateString("pt-PT")}
                  </p>
                )}
            </div>

            {/* Seguros futuros */}
            <div className="space-y-4">
              {members
                .filter((m) => m.user_id === id && m.insurance_future)
                .map((fp) => (
                  <div
                    key={fp.user_insurance_id}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Seguro agendado
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {fp.insurance_name}
                    </p>
                    {fp.insurance_payment_state === "pending" && (
                      <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        Pagamento Pendente
                      </span>
                    )}
                    {fp.insurance_start && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        começa em{" "}
                        {new Date(fp.insurance_start).toLocaleDateString(
                          "pt-PT"
                        )}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal criar plano */}
      <Modal
        isOpen={isAddPlanModalOpen}
        className="max-w-md p-6"
        onClose={() => setIsAddPlanModalOpen(false)}
      >
        <AddPlanModal
          member={member}
          onSave={handleCreatePlan}
          isMembership={isMembership}
          endDate={endDatePlan}
          onClose={() => setIsAddPlanModalOpen(false)}
        />
      </Modal>

      {/* Modal editar plano */}
      <Modal
        isOpen={isEditPlanModalOpen}
        className="max-w-md p-6"
        onClose={() => setIsEditPlanModalOpen(false)}
      >
        <EditPlanModal
          member={member}
          plan={selectedFuturePlan || currentPlan}
          onSave={handleEditPlan}
          onCancelPlan={handleCancelPlan}
          onClose={() => {
            setIsEditPlanModalOpen(false);
            setSelectedFuturePlan(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={isAddInsuranceModalOpen}
        className="max-w-md p-6"
        onClose={() => setIsAddInsuranceModalOpen(false)}
      >
        <AddInsuranceModal
          member={member}
          endDate={member.insurance_end}
          onSave={handleSaveInsurance}
          onClose={() => setIsAddInsuranceModalOpen(false)}
        />
      </Modal>

      {/* Modal editar seguro */}
      <Modal
        isOpen={isEditInsuranceModalOpen}
        className="max-w-md p-6"
        onClose={() => setIsEditInsuranceModalOpen(false)}
      >
        <EditInsuranceModal
          member={member}
          onSave={handleEditInsurance}
          onCancelInsurance={cancelInsurance}
          onClose={() => setIsEditInsuranceModalOpen(false)}
        />
      </Modal>

      {/* Modal de confirmação */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Confirmar desativação
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Tem a certeza que deseja desativar as senhas? Esta ação não pode ser
          desfeita.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={confirmDeactivate}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Desativar Senhas
          </button>
        </div>
      </Modal>
    </div>
  );
}
