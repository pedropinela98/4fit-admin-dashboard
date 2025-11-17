// src/pages/plans/PlanEdit.tsx
import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PlanForm, { PlanFormData } from "../../components/plans/PlanForm";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { usePlanById } from "../../hooks/usePlanById";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/ui/Toast";

export default function PlanEdit() {
  const { id } = useParams<{ id: string }>();
  const { boxId = "" } = useParams<{ boxId?: string }>();
  const navigate = useNavigate();

  const { addToast } = useToast();

  const { plan, classLimits, loading, error, refetch } = usePlanById(
    boxId,
    id!
  );

  async function handleEdit(data: PlanFormData) {
    try {
      // Atualiza o plano
      await supabase
        .from("Plan")
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          is_active: data.is_active,
          plans_public: data.plans_public,
        })
        .eq("id", id)
        .eq("box_id", boxId);

      // Atualiza os limites
      for (const cl of data.class_limits) {
        const initial = classLimits.find(
          (i) => i.classType.id === cl.class_type_id
        );

        if (!cl.included && initial) {
          await supabase
            .from("Plan_Class_Limit")
            .delete()
            .eq("plan_id", id)
            .eq("class_type_id", cl.class_type_id);
        } else if (cl.included) {
          await supabase.from("Plan_Class_Limit").upsert(
            {
              plan_id: id,
              class_type_id: cl.class_type_id,
              limit_per_period: cl.max_sessions_per_week ?? 0,
              is_limitless: cl.max_sessions_per_week === null,
              period_type: "week",
            },
            { onConflict: ["plan_id", "class_type_id"] }
          );
        }
      }

      refetch();
      addToast("Plano atualizado com sucesso!", "success");
    } catch (err) {
      addToast("Não foi possível processar o pedido", "error");
    }
  }

  if (loading) return <p className="text-gray-500">A carregar plano...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!plan) return <p className="text-red-500">Plano não encontrado.</p>;

  const initialData: PlanFormData = {
    name: plan.name,
    description: plan.description || "",
    price: plan.price,
    is_active: plan.is_active,
    plans_public: plan.plans_public,
    class_limits: classLimits.map((cl) => ({
      class_type_id: cl.classType.id,
      included: cl.is_limitless || cl.limit > 0,
      max_sessions_per_week: cl.is_limitless ? null : cl.limit,
      is_limitless: cl.is_limitless,
    })),
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Editar Plano" description="" />
      <button
        onClick={() => navigate(`/box/${boxId}/plans`)}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos planos
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Editar {plan.name}
      </h1>

      <PlanForm
        mode="edit"
        initialData={initialData}
        classTypes={classLimits.map((cl) => cl.classType)}
        onSubmit={handleEdit}
      />
    </div>
  );
}
