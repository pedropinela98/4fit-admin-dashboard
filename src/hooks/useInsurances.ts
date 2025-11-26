// src/hooks/useInsurances.ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export type Insurance = {
  id: string;
  name: string;
  period: "monthly" | "quarterly" | "semester" | "annualy";
  box_id: string;
  is_active: boolean | null;
  created_at: string;
};

export function useInsurances(boxId: string) {
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(boxId);

  // Fetch insurances
  const fetchInsurances = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Insurance")
      .select("*")
      .eq("box_id", boxId)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      console.log(data);
      const mapped: Insurance[] = (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        period: row.period,
        box_id: row.box_id,
        is_active: row.is_active ?? false,
        created_at: row.created_at,
      }));

      setInsurances(mapped);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (boxId) fetchInsurances();
  }, [boxId]);

  // Get insurance by ID
  const getInsuranceById = async (id: string): Promise<Insurance | null> => {
    const { data, error } = await supabase
      .from("Insurance")
      .select("*")
      .eq("id", id)
      .eq("box_id", boxId)
      .single();

    if (error) {
      console.error("Erro ao buscar insurance:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      period: data.period,
      box_id: data.box_id,
      is_active: data.is_active ?? false,
      created_at: data.created_at,
    };
  };

  // Delete insurance
  const deleteInsurance = async (id: string) => {
    const { error } = await supabase
      .from("Insurance")
      .delete()
      .eq("id", id)
      .eq("box_id", boxId);

    if (error) {
      console.error("Erro ao deletar insurance:", error);
      return false;
    }

    // Re-fetch depois de deletar
    fetchInsurances();
    return true;
  };

  // Update insurance
  const updateInsurance = async (
    id: string,
    updated: Partial<Omit<Insurance, "id" | "box_id" | "created_at">>
  ) => {
    const { data, error } = await supabase
      .from("Insurance")
      .update(updated)
      .eq("id", id)
      .eq("box_id", boxId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar insurance:", error);
      return null;
    }

    fetchInsurances();
    return data;
  };

  return {
    insurances,
    loading,
    error,
    refetch: fetchInsurances,
    deleteInsurance,
    updateInsurance,
    getInsuranceById,
  };
}
