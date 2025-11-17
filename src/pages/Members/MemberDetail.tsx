import { useState } from "react";
import { useParams, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { useMembers } from "../../hooks/useMembers";
import { ChevronLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../components/ui/modal/index";
import AddPlanModal from "../../components/AddPlanModal";
import EditPlanModal from "../../components/EditPlanModal";

export default function MemberDetail() {
  const params = useParams();
  const id = params.id!;
  const { boxId = "" } = useParams<{ boxId?: string }>();
  const { members, loading, error } = useMembers(boxId, id);

  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);

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

  function handleSavePlan(
    planId: string,
    price: number,
    discount: number,
    startDate: string,
    isPaid: boolean
  ) {
    console.log(
      `Novo plano: plano=${planId}, preço base=${price}, desconto=${discount}%, início=${startDate}, estado=${
        isPaid ? "Pago" : "Pendente"
      }`
    );
    setIsAddPlanModalOpen(false);
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
        <img
          src={member.photoUrl || "/images/user/user-01.jpg"}
          alt={member.name}
          className="w-20 h-20 rounded-full object-cover border"
        />
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

      {/* Botão adicionar novo plano */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddPlanModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Adicionar novo plano
        </button>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Plano */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Plano
            </h2>
            {member.plan_name && member.membership_active && (
              <button
                onClick={() => setIsEditPlanModalOpen(true)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <PencilIcon className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            {member.plan_name || "Nenhum"}
          </p>
          <span
            className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
              member.membership_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {member.membership_active ? "Ativo" : "Inativo"}
          </span>
          {member.membership_end && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              válido até{" "}
              {new Date(member.membership_end).toLocaleDateString("pt-PT")}
            </p>
          )}
        </div>

        {/* Seguro */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Seguro
          </h2>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            {member.insurance_name || "Sem seguro"}
          </p>
          <span
            className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
              member.insurance_state === "valid"
                ? "bg-green-100 text-green-800"
                : member.insurance_state === "expiring_soon"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {member.insurance_state === "valid"
              ? "Ativo"
              : member.insurance_state === "expiring_soon"
              ? "A expirar"
              : "Expirado"}
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
            console.log("Atualizar estado para:", isPaid ? "Pago" : "Pendente");
            setIsEditPlanModalOpen(false);
          }}
          onCancelPlan={() => {
            console.log("Plano cancelado");
            setIsEditPlanModalOpen(false);
          }}
          onClose={() => setIsEditPlanModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
