import { useState } from "react";
import { Member } from "../hooks/useMembers";

type EditPlanModalProps = {
  member: Member;
  onSave: (isPaid: boolean) => void;
  onCancelPlan: () => void;
  onClose: () => void;
};

export default function EditPlanModal({
  member,
  onSave,
  onCancelPlan,
  onClose,
}: EditPlanModalProps) {
  const [isPaid, setIsPaid] = useState(member.membership_paid ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(isPaid);
  }

  function handleCancelClick() {
    const confirmCancel = window.confirm(
      "Tem a certeza que deseja cancelar o plano atual?"
    );
    if (confirmCancel) {
      onCancelPlan();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Editar plano atual
      </h2>

      {/* Estado do pagamento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Estado do pagamento
        </label>
        <div className="flex justify-center gap-4">
          <label
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition ${
              isPaid === true
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <input
              type="radio"
              name="paymentStatus"
              value="paid"
              checked={isPaid === true}
              onChange={() => setIsPaid(true)}
              className="h-4 w-4 text-green-600"
              required
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Pago
            </span>
          </label>

          <label
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition ${
              isPaid === false
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                : "border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <input
              type="radio"
              name="paymentStatus"
              value="pending"
              checked={isPaid === false}
              onChange={() => setIsPaid(false)}
              className="h-4 w-4 text-yellow-600"
              required
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Pendente
            </span>
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
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}
