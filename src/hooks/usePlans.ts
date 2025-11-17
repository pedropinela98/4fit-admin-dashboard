import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export type Plan = {
  id: string;
  box_id: string;
  name: string;
  description?: string | null;
  price: number;
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

    console.log(data);

    const mapped: Plan[] = (data || []).map((p: any) => ({
      id: p.id,
      box_id: p.box_id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
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

  // ADD plan
  async function addPlan(
    newPlan: Omit<Plan, "id" | "created_at" | "updated_at">
  ) {
    const { data, error } = await supabase
      .from("Plan")
      .insert([
        {
          box_id: newPlan.box_id,
          name: newPlan.name,
          description: newPlan.description,
          price: newPlan.price,
          max_sessions: 3,
          is_active: newPlan.is_active,
          plans_public: newPlan.plans_public,
        },
      ])
      .select()
      .single();

    if (error) {
      setError(error.message);
      return null;
    }

    setPlans((prev) => [data, ...prev]);
    return data;
  }

  // UPDATE plan
  async function updatePlan(id: string, updated: Partial<Plan>) {
    const { data, error } = await supabase
      .from("Plan")
      .update({
        ...updated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return null;
    }

    setPlans((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  }

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
    addPlan,
    updatePlan,
    deletePlan,
  };
}
