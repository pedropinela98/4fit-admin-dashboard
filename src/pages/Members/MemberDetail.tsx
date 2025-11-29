import { useState } from "react";
import { useParams, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { useMembers } from "../../hooks/useMembers";
import { ChevronLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/24/solid";
import { Modal } from "../../components/ui/modal/index";
import AddPlanModal from "../../components/AddPlanModal";
import EditPlanModal from "../../components/EditPlanModal";
import EditInsuranceModal from "../../components/EditInsuranceModal";
import AddInsuranceModal from "../../components/AddInsuranceModal";

export default function MemberDetail() {
  const { id = "" } = useParams<{ id?: string }>();
  const { boxId = "" } = useParams<{ boxId?: string }>();
  const { members, loading, error } = useMembers(boxId, id, true);

  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [isAddInsuranceModalOpen, setIsAddInsuranceModalOpen] = useState(false);
  const [isEditInsuranceModalOpen, setIsEditInsuranceModalOpen] =
    useState(false);

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
    (m) => m.user_id === id && m.membership_active
  );
  const currentSessionPack = members.find(
    (m) => m.user_id === id && m.session_pack_active
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

  function handleSavePlan(
    planId: string,
    price: number,
    discount: number,
    startDate: string,
    isPaid: boolean
  ) {
    setIsAddPlanModalOpen(false);
  }

  function handleSaveInsurance(
    insuranceId: string,
    price: number,
    startDate: string,
    isPaid: boolean
  ) {
    console.log(
      `Novo seguro: id=${insuranceId}, preço=${price}, início=${startDate}, estado=${
        isPaid ? "Pago" : "Pendente"
      }`
    );
    setIsAddInsuranceModalOpen(false);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Plano atual */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Plano atual
            </h2>

            {currentPlan ? (
              <button
                onClick={() => setIsEditPlanModalOpen(true)}
                className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Editar Plano
              </button>
            ) : (
              <button
                onClick={() => setIsAddPlanModalOpen(true)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Adicionar Plano
              </button>
            )}
          </div>

          {currentPlan ? (
            <>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {currentPlan.membership_plan_name ||
                  currentPlan.session_pack_name}
              </p>
              <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Ativo
              </span>
              {currentPlan.membership_end || currentPlan.session_pack_end ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  válido até{" "}
                  {new Date(
                    currentPlan.membership_end || currentPlan.session_pack_end
                  ).toLocaleDateString("pt-PT")}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              Nenhum plano ativo
            </p>
          )}
        </div>

        {/* Planos futuros */}
        {futurePlans.length > 0 && (
          <div className="space-y-4">
            {futurePlans.map((fp) => (
              <div
                key={fp.membership_id || fp.user_session_pack_id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border"
              >
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Plano agendado
                </h2>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {fp.membership_plan_name || fp.session_pack_name}
                </p>
                <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Agendado
                </span>
                {fp.membership_start || fp.session_pack_start ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    começa em{" "}
                    {new Date(
                      fp.membership_start || fp.session_pack_start
                    ).toLocaleDateString("pt-PT")}
                  </p>
                ) : null}
                {fp.membership_end || fp.session_pack_end ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    termina em{" "}
                    {new Date(
                      fp.membership_end || fp.session_pack_end
                    ).toLocaleDateString("pt-PT")}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Seguro */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Seguro
            </h2>

            {member.insurance_active ? (
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
            {member.insurance_name || "Sem seguro"}
          </p>

          <span
            className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
              member.insurance_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {member.insurance_active ? "Ativo" : "Inativo"}
          </span>

          {member.insurance_end && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              válido até{" "}
              {new Date(member.insurance_end).toLocaleDateString("pt-PT")}
            </p>
          )}
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
          onSave={handleSavePlan}
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
          onSave={(isPaid) => {
            setIsEditPlanModalOpen(false);
          }}
          onCancelPlan={() => {
            setIsEditPlanModalOpen(false);
          }}
          onClose={() => setIsEditPlanModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isAddInsuranceModalOpen}
        className="max-w-md p-6"
        onClose={() => setIsAddInsuranceModalOpen(false)}
      >
        <AddInsuranceModal
          member={member}
          endDate={member.insurance_end} // se quiseres respeitar fim anterior
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
          onSave={(isPaid) => {
            setIsEditInsuranceModalOpen(false);
          }}
          onCancelInsurance={() => {
            setIsEditInsuranceModalOpen(false);
          }}
          onClose={() => setIsEditInsuranceModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
