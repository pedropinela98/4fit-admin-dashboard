// src/pages/plans/PlanCreate.tsx
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PlanForm, { PlanFormData } from "../../components/plans/PlanForm";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/ui/Toast";
import { ClassType } from "../../components/plans/PlanForm";
import { useState, useEffect } from "react";

export default function PlanCreate() {
  const navigate = useNavigate();
  const { boxId = "" } = useParams<{ boxId: string }>();
  const { addToast } = useToast();
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);

  useEffect(() => {
    async function fetchClassTypes() {
      const { data, error } = await supabase
        .from("Class_Type")
        .select("*")
        .eq("box_id", boxId)
        .eq("active", true);

      if (!error && data) setClassTypes(data);
    }

    fetchClassTypes();
  }, [boxId]);

  async function handleCreate(data: PlanFormData) {
    try {
      // 1 Inserir o plano
      const { data: insertedPlan, error } = await supabase
        .from("Plan")
        .insert([
          {
            box_id: boxId,
            name: data.name,
            description: data.description,
            price: data.price,
            is_active: data.is_active,
            plans_public: data.plans_public,
            periodicity: data.periodicity,
          },
        ])
        .select()
        .single();

      if (error || !insertedPlan) throw error;

      // 2️⃣ Inserir limites das classes
      for (const cl of data.class_limits) {
        if (cl.included) {
          await supabase.from("Plan_Class_Limit").insert({
            plan_id: insertedPlan.id,
            class_type_id: cl.class_type_id,
            limit_per_period: cl.max_sessions_per_week ?? 0,
            is_limitless: cl.max_sessions_per_week === null,
            period_type: "week",
          });
        }
      }

      // 3️⃣ Mostrar toast de sucesso
      addToast("Plano criado com sucesso!", "success");

      // 4️⃣ Voltar para a lista de planos
      navigate(`/box/${boxId}/plans`);
    } catch (err) {
      console.error(err);
      addToast("Não foi possível criar o plano", "error");
    }
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Criar Plano" description="" />

      {/* Botão de voltar */}
      <button
        onClick={() => navigate(`/box/${boxId}/plans`)}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos planos
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Criar Novo Plano
      </h1>

      {/* Formulário */}
      <PlanForm mode="create" onSubmit={handleCreate} classTypes={classTypes} />
    </div>
  );
}
