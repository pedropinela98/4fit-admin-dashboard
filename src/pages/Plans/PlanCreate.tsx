// src/pages/plans/PlanCreate.tsx
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PlanForm from "../../components/plans/PlanForm";
import { usePlans } from "../../hooks/usePlans";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function PlanCreate() {
  const navigate = useNavigate();
  const { addPlan } = usePlans();

  function handleCreate(data: any) {
    console.log("Novo plano:", data);
    addPlan(data);
    navigate("/plans"); // voltar à lista
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Criar Plano" description="" />

      {/* Botão de voltar */}
      <button
        onClick={() => navigate("/plans")}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos planos
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Criar Novo Plano
      </h1>

      <PlanForm mode="create" onSubmit={handleCreate} />
    </div>
  );
}
