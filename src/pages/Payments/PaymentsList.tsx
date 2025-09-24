import { useState, useEffect } from "react";

type Payment = {
  id: string;
  memberName: string;
  type: "plan" | "insurance";
  planName?: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  date: string; // ISO date
};

const mockPayments: Payment[] = [
  {
    id: "1",
    memberName: "João Silva",
    type: "plan",
    planName: "Mensal Ilimitado",
    amount: 40,
    status: "paid",
    date: "2025-01-20",
  },
  {
    id: "2",
    memberName: "Maria Santos",
    type: "insurance",
    amount: 15,
    status: "pending",
    date: "2025-02-01",
  },
  {
    id: "3",
    memberName: "Pedro Costa",
    type: "plan",
    planName: "Trimestral",
    amount: 100,
    status: "failed",
    date: "2025-02-15",
  },
  {
    id: "4",
    memberName: "Ana Ferreira",
    type: "plan",
    planName: "Mensal Ilimitado",
    amount: 40,
    status: "paid",
    date: "2025-02-20",
  },
  {
    id: "5",
    memberName: "Carlos Mendes",
    type: "insurance",
    amount: 15,
    status: "paid",
    date: "2025-03-05",
  },
];

export default function PaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setTimeout(() => setPayments(mockPayments), 300);
  }, []);

  // filtrar por mês
  const filteredPayments =
    selectedMonth === "all"
      ? payments
      : payments.filter((p) => {
          const d = new Date(p.date);
          const monthKey = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`;
          return monthKey === selectedMonth;
        });

  // paginação
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // cálculos dos totais
  const totalPaid = filteredPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = filteredPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Pagamentos
      </h1>

      {/* Filtro */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filtrar por mês:
        </label>
        <input
          type="month"
          value={selectedMonth === "all" ? "" : selectedMonth}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedMonth(val || "all");
            setCurrentPage(1);
          }}
          className="border px-3 py-1 rounded-lg text-sm"
        />
        {selectedMonth !== "all" && (
          <button
            onClick={() => setSelectedMonth("all")}
            className="ml-2 text-sm text-gray-500 underline"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Membro</th>
              <th className="px-4 py-3 text-left">Plano/Seguro</th>
              <th className="px-4 py-3 text-left">Valor</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Data</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.map((p) => (
              <tr
                key={p.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="px-4 py-3">{p.memberName}</td>
                <td className="px-4 py-3">
                  {p.type === "plan" ? p.planName : "Seguro"}
                </td>
                <td className="px-4 py-3">{p.amount.toFixed(2)} €</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      p.status === "paid"
                        ? "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400"
                        : p.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400"
                    }`}
                  >
                    {p.status === "paid"
                      ? "Pago"
                      : p.status === "pending"
                      ? "Pendente"
                      : "Falhou"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(p.date).toLocaleDateString("pt-PT")}
                </td>
              </tr>
            ))}

            {paginatedPayments.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  Nenhum pagamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Seguinte
          </button>
        </div>
      )}

      {/* Cards de totais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Valor Recebido
          </h2>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {totalPaid.toFixed(2)} €
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Valor Pendente
          </h2>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {totalPending.toFixed(2)} €
          </p>
        </div>
      </div>
    </div>
  );
}
