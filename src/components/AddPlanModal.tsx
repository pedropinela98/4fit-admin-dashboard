import { useState } from "react";
import { Member } from "../hooks/useMembers";

type AddPlanModalProps = {
  member: Member;
  onSave: (
    planId: string,
    price: number,
    discount: number,
    startDate: string,
    isPaid: boolean
  ) => void;
  onClose: () => void;
};

// Mock dos planos disponíveis
const availablePlans = [
  { id: "plan-1", name: "Mensal", price: 40 },
  { id: "plan-2", name: "Trimestral", price: 100 },
  { id: "plan-3", name: "Anual", price: 350 },
];

export default function AddPlanModal({
  member,
  onSave,
  onClose,
}: AddPlanModalProps) {
  const [planId, setPlanId] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0); // percentagem
  const [startDate, setStartDate] = useState("");
  const [isPaid, setIsPaid] = useState<boolean | null>(null);

  function handlePlanChange(id: string) {
    setPlanId(id);
    const selectedPlan = availablePlans.find((p) => p.id === id);
    if (selectedPlan) {
      setPrice(selectedPlan.price);
      setDiscount(0); // reset quando muda plano
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!planId || isPaid === null) return;
    onSave(planId, price, discount, startDate, isPaid);
  }

  const finalPrice = price - (price * discount) / 100;

  // Data mínima se já tiver plano ativo
  const minDate = member.membership_end
    ? new Date(new Date(member.membership_end).getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Atribuir novo plano
      </h2>

      {/* Plano */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Selecionar Plano
        </label>
        <select
          value={planId}
          onChange={(e) => handlePlanChange(e.target.value)}
          className="mt-1 w-full border rounded-lg px-3 py-2"
          required
        >
          <option value="">-- Escolher plano --</option>
          {availablePlans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>
      </div>

      {/* Preço (bloqueado) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preço base (€)
        </label>
        <input
          type="number"
          value={price}
          readOnly
          className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
        />
      </div>

      {/* Desconto em % */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Desconto (%)
        </label>
        <input
          type="number"
          value={discount}
          onChange={(e) =>
            setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))
          }
          min={0}
          max={100}
          className="mt-1 w-full border rounded-lg px-3 py-2"
        />
      </div>

      {/* Preço final */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Total a pagar (€)
        </label>
        <input
          type="number"
          value={finalPrice.toFixed(2)}
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
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={minDate}
          className="mt-1 w-full border rounded-lg px-3 py-2"
          required
        />
        {minDate && (
          <p className="text-xs text-gray-500 mt-1">
            Tem de começar após{" "}
            {new Date(member.membership_end!).toLocaleDateString("pt-PT")}
          </p>
        )}
      </div>

      {/* Estado do pagamento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Estado do pagamento
        </label>
        <div className="flex gap-4">
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
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
