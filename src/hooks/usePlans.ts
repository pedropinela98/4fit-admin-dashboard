import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export type Plan = {
  id: string;
  box_id: string;
  name: string;
  description?: string | null;
  price: number;
  periodicity: string;
  plans_public?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
};

export function usePlans(boxId?: string) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPlans() {
    if (!boxId) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("Plan")
      .select("*")
      .eq("box_id", boxId)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const mapped: Plan[] = (data || []).map((p: any) => ({
      id: p.id,
      box_id: p.box_id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      periodicity: p.periodicity,
      is_active: p.is_active,
      plans_public: p.plans_public,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    setPlans(mapped);
    setLoading(false);
  }

  useEffect(() => {
    fetchPlans();
  }, [boxId]);

  // DELETE plan
  async function deletePlan(id: string) {
    const { error } = await supabase.from("Plan").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return false;
    }

    setPlans((prev) => prev.filter((p) => p.id !== id));
    return true;
  }

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
    deletePlan,
  };
}
