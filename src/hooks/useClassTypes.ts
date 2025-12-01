import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export type ClassType = {
  id: string;
  box_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  color?: string;
  duration_default: number;
  capacity_default?: number;
  waitlist_default?: number;
};

export function useClassTypes(boxId?: string) {
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchClassTypes() {
    if (!boxId) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("Class_Type")
      .select("*")
      .eq("box_id", boxId)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const mapped: ClassType[] = (data || []).map((p: any) => ({
      id: p.id,
      box_id: p.box_id,
      name: p.name,
      description: p.description,
      created_at: p.created_at,
      updated_at: p.updated_at,
      color: p.color,
      duration_default: Number(p.duration_default),
      capacity_default: Number(p.capacity_default),
      waitlist_default: Number(p.waitlist_default)
    }));

    setClassTypes(mapped);
    setLoading(false);
  }

  useEffect(() => {
    fetchClassTypes();
  }, [boxId]);

  // DELETE class type
  async function deleteClassType(id: string) {
    const { error } = await supabase.from("Class_Type").delete().eq("id", id)
    
    if (error) {
      setError(error.message);
      return false;
    }

    return true;
  }


  return {
    classTypes,
    loading,
    error,
    refetch: fetchClassTypes,
    deleteClassType,
  };
}

