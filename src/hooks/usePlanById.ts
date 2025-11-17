import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export type Plan = {
  id: string;
  box_id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  plans_public: boolean;
  created_at: string;
  updated_at: string;
};

export type PlanClassLimit = {
  class_type_id: string;
  included: boolean;
  max_sessions_per_week: number | null;
  period_type?: string; // se quiseres manter
};

export type ClassType = {
  id: string;
  box_id: string;
  name: string;
  description: string | null;
  active: boolean;
};

export function usePlanById(boxId?: string, planId?: string) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [classLimits, setClassLimits] = useState<
    { classType: ClassType; limit: number | null; period_type: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!boxId || !planId) return;

    setLoading(true);
    setError(null);

    try {
      // 🔹 Executar todas as queries em paralelo
      const [planRes, classTypesRes, limitsRes] = await Promise.all([
        supabase
          .from("Plan")
          .select("*")
          .eq("id", planId)
          .eq("box_id", boxId)
          .single(),
        supabase
          .from("Class_Type")
          .select("*")
          .eq("box_id", boxId)
          .eq("active", true),
        supabase.from("Plan_Class_Limit").select("*").eq("plan_id", planId),
      ]);

      if (planRes.error) throw planRes.error;
      if (classTypesRes.error) throw classTypesRes.error;
      if (limitsRes.error) throw limitsRes.error;

      // 🔹 Mapear plano
      const mappedPlan: Plan = {
        id: planRes.data.id,
        box_id: planRes.data.box_id,
        name: planRes.data.name,
        description: planRes.data.description,
        price: Number(planRes.data.price),
        is_active: planRes.data.is_active,
        plans_public: planRes.data.plans_public,
        created_at: planRes.data.created_at,
        updated_at: planRes.data.updated_at,
      };
      setPlan(mappedPlan);

      // 🔹 Mapear limites
      const limitsMap = new Map(
        (limitsRes.data || []).map((l: any) => [
          l.class_type_id,
          {
            limit: l.limit_per_period ?? 0, // default 0 se não definido
            period_type: l.period_type,
            is_limitless: l.is_limitless ?? false, // default false
          },
        ])
      );

      // 🔹 Combinar ClassType + limites
      const combined =
        classTypesRes.data?.map((ct: ClassType) => {
          const found = limitsMap.get(ct.id);

          return {
            classType: ct,
            is_limitless: found?.is_limitless ?? false,
            limit: found ? (found.is_limitless ? null : found.limit ?? 0) : 0,
            period_type: found?.period_type ?? "week",
          };
        }) ?? [];

      setClassLimits(combined);
    } catch (e: any) {
      setError(e.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [boxId, planId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { plan, classLimits, loading, error, refetch: fetchData };
}
