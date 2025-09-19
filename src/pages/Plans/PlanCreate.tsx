// src/pages/plans/PlanCreate.tsx
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PlanForm from "../../components/plans/PlanForm";
import { usePlans } from "../../hooks/usePlans";

export default function PlanCreate() {
  const navigate = useNavigate();
  const { addPlan } = usePlans();

  function handleCreate(data: any) {
    console.log("Novo plano:", data);
    addPlan(data);
    navigate("/plans"); // back to list
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Criar Plano" description="" />
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Criar Novo Plano
      </h1>
      <PlanForm mode="create" onSubmit={handleCreate} />
    </div>
  );
}
