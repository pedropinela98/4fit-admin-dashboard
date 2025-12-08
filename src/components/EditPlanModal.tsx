import { useState } from "react";
import { Member } from "../hooks/useMembers";
import { Modal } from "../components/ui/modal";

type EditPlanModalProps = {
  member: Member;
  plan: Member | undefined; // <<< NOVO
  onSave: (
    isPaid: boolean,
    planId: string | null,
    sessionPackId: string | null
  ) => void;
  onCancelPlan: (planId: string | null) => void;
  onClose: () => void;
};

export default function EditPlanModal({
  member,
  plan,
  onSave,
  onCancelPlan,
  onClose,
}: EditPlanModalProps) {
  // Se é plano futuro, usa-o. Senão usa o atual.
  const data = plan ?? member;

  const [isPaid, setIsPaid] = useState(
    data.membership_payment_state === "paid" ||
      data.session_pack_payment_state === "paid"
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(
      isPaid,
      data.membership_id ?? null,
      data.user_session_pack_id ?? null
    );
  }

  function handleCancelClick() {
    setShowConfirmModal(true);
  }

  function confirmCancel() {
    onCancelPlan(data.membership_id ?? null);
    setShowConfirmModal(false);
  }

  const planName =
    data.membership_plan_name || data.session_pack_name || "Plano desconhecido";

  const finalPrice =
    data.membership_price_paid ?? data.session_pack_price_paid ?? 0;

  const startDate =
    data.membership_start || data.session_pack_start
      ? new Date(
          data.membership_start || data.session_pack_start
        ).toLocaleDateString("pt-PT")
      : "-";

  const endDate =
    data.membership_end || data.session_pack_end
      ? new Date(
          data.membership_end || data.session_pack_end
        ).toLocaleDateString("pt-PT")
      : "-";

  const isPaymentLocked =
    data.membership_payment_state === "paid" ||
    data.session_pack_payment_state === "paid";

  return (
    <>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Editar plano
        </h2>

        {/* Nome do plano */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Plano
          </label>
          <input
            type="text"
            value={planName}
            readOnly
            className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Preço final */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Total a pagar (€)
          </label>
          <input
            type="number"
            value={finalPrice}
            readOnly
            className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Data início */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Data de início
          </label>
          <input
            type="text"
            value={startDate}
            readOnly
            className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Data fim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Data de fim
          </label>
          <input
            type="text"
            value={endDate}
            readOnly
            className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Estado do pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Estado do pagamento
          </label>

          <div className="flex justify-center gap-4">
            {/* Pago */}
            <label
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isPaid
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="paymentStatus"
                value="paid"
                checked={isPaid}
                onChange={() => setIsPaid(true)}
                disabled={isPaymentLocked}
                className="h-4 w-4 text-green-600"
              />
              <span className="text-sm">Pago</span>
            </label>

            {/* Pendente */}
            <label
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                !isPaid
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                  : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="paymentStatus"
                value="pending"
                checked={!isPaid}
                onChange={() => setIsPaid(false)}
                disabled={isPaymentLocked}
                className="h-4 w-4 text-yellow-600"
              />
              <span className="text-sm">Pendente</span>
            </label>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="flex justify-between gap-3 mt-6">
          <button
            type="button"
            onClick={handleCancelClick}
            className="px-4 py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Cancelar plano
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Fechar
            </button>

            {!isPaymentLocked && (
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Guardar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* CONFIRMAR CANCELAMENTO */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Confirmar cancelamento
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Tem a certeza que deseja cancelar o plano atual? Esta ação não pode
          ser desfeita.
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
            onClick={confirmCancel}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Cancelar plano
          </button>
        </div>
      </Modal>
    </>
  );
}
