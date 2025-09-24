// src/pages/plans/PlanEdit.tsx
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PlanForm from "../../components/plans/PlanForm";
import { usePlans } from "../../hooks/usePlans";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function PlanEdit() {
  const { id } = useParams<{ id: string }>();
  const { plans, updatePlan, loading } = usePlans();
  const navigate = useNavigate();

  const plan = plans.find((p) => p.id === id);

  function handleEdit(data: any) {
    if (!id) return;
    console.log("Plano editado:", { id, ...data });
    updatePlan(id, data);
    navigate("/plans"); // voltar à lista
  }

  if (loading) {
    return <p className="text-gray-500">A carregar plano...</p>;
  }

  if (!plan) {
    return <p className="text-red-500">Plano não encontrado</p>;
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Editar Plano" description="" />

      {/* Botão de voltar */}
      <button
        onClick={() => navigate("/plans")}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos planos
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Editar {plan.name}
      </h1>

      <PlanForm mode="edit" initialData={plan} onSubmit={handleEdit} />
    </div>
  );
}
