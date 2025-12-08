import { useState } from "react";
import { Member } from "../hooks/useMembers";
import { Modal } from "../components/ui/modal"; // usa o mesmo componente Modal

type EditInsuranceModalProps = {
  member: Member;
  onSave: (isPaid: boolean, insuranceId: string | null) => void;
  onCancelInsurance: (insuranceId: string | null) => void;
  onClose: () => void;
};

export default function EditInsuranceModal({
  member,
  onSave,
  onCancelInsurance,
  onClose,
}: EditInsuranceModalProps) {
  const [isPaid, setIsPaid] = useState(
    member.insurance_payment_state === "paid"
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(isPaid, member.user_insurance_id ?? null);
  }

  function handleCancelClick() {
    setShowConfirmModal(true);
  }

  function confirmCancel() {
    onCancelInsurance(member.user_insurance_id ?? null);
    setShowConfirmModal(false);
  }

  // Dados vindos diretamente do `member`
  const insuranceName = member.insurance_name || "Seguro desconhecido";
  const finalPrice = member.insurance_price_paid ?? 0;
  const startDate = member.insurance_start
    ? new Date(member.insurance_start).toLocaleDateString("pt-PT")
    : "-";
  const endDate = member.insurance_end
    ? new Date(member.insurance_end).toLocaleDateString("pt-PT")
    : "-";

  const isPaymentLocked = member.insurance_payment_state === "paid";

  return (
    <>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Editar seguro atual
        </h2>

        {/* Nome do seguro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Seguro
          </label>
          <input
            type="text"
            value={insuranceName}
            readOnly
            className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Preço pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Total pago (€)
          </label>
          <input
            type="number"
            value={finalPrice}
            readOnly
            className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Data de início */}
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

        {/* Data de fim */}
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
                required
              />
              <span className="text-sm">Pago</span>
            </label>

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
                required
              />
              <span className="text-sm">Pendente</span>
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-between gap-3 mt-6">
          <button
            type="button"
            onClick={handleCancelClick}
            className="px-4 py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Cancelar seguro
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

      {/* Modal de confirmação */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Confirmar cancelamento
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Tem a certeza que deseja cancelar o seguro atual? Esta ação não pode
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
            Cancelar seguro
          </button>
        </div>
      </Modal>
    </>
  );
}
