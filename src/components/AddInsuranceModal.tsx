import { useState, useEffect } from "react";
import { Member } from "../hooks/useMembers";
import { supabase } from "../lib/supabase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface InsuranceOption {
  id: string;
  name: string;
  price: number;
}

type AddInsuranceModalProps = {
  member: Member;
  endDate?: string;
  onSave: (
    insuranceId: string,
    price: number,
    startDate: string,
    isPaid: boolean
  ) => void;
  onClose: () => void;
};

export default function AddInsuranceModal({
  member,
  endDate,
  onSave,
  onClose,
}: AddInsuranceModalProps) {
  const [insurances, setInsurances] = useState<InsuranceOption[]>([]);
  const [insuranceId, setInsuranceId] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [isPaid, setIsPaid] = useState<boolean | null>(null);

  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(today);

  const minDate = endDate
    ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000)
    : today;

  const [discount, setDiscount] = useState<number>(0);
  const finalPrice = price - (price * discount) / 100;
  // Buscar insurances diretamente da tabela
  useEffect(() => {
    async function fetchInsurances() {
      if (!member.box_id) return;

      const { data, error } = await supabase
        .from("Insurance")
        .select("id, name, price")
        .eq("box_id", member.box_id);

      if (error) {
        console.error("Erro ao buscar insurances:", error.message);
        return;
      }

      setInsurances(data ?? []);
    }

    fetchInsurances();
  }, [member.box_id]);

  function handleInsuranceChange(id: string) {
    setInsuranceId(id);
    const selected = insurances.find((i) => i.id === id);
    if (selected) {
      setPrice(selected.price);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!insuranceId || isPaid === null) return;
    onSave(insuranceId, price, startDate.toISOString().split("T")[0], isPaid);
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Atribuir novo seguro
      </h2>

      {/* Dropdown de seguros */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Selecionar Seguro
        </label>
        <select
          value={insuranceId}
          onChange={(e) => handleInsuranceChange(e.target.value)}
          className="mt-1 w-full border rounded-lg px-3 py-2"
          required
        >
          <option value="">-- Escolher seguro --</option>
          {insurances.map((insurance) => (
            <option key={insurance.id} value={insurance.id}>
              {insurance.name} - {insurance.price}€
            </option>
          ))}
        </select>
      </div>

      {/* Preço */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preço (€)
        </label>
        <input
          type="number"
          value={price}
          readOnly
          className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
        />
      </div>

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

      {/* DatePicker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Data de início
        </label>
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => {
            if (date) setStartDate(date);
          }}
          minDate={minDate}
          dateFormat="dd/MM/yyyy"
          className="mt-1 w-full border rounded-lg px-3 py-2"
        />
        {endDate && (
          <p className="text-xs text-gray-500 mt-1">
            Tem de começar após {new Date(endDate).toLocaleDateString("pt-PT")}
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
            <span className="text-sm">Pago</span>
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
            <span className="text-sm">Pendente</span>
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
