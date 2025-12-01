import { useState, useEffect, useCallback } from "react";
import { Enums, supabase } from "../lib/supabase";

export type ClassType = {
  id: string;
  box_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  color: string | null;
  duration_default: number;
  capacity_default: number;
  waitlist_default: number;
};

export function useClassTypeById(id?: string) {
  const [classType, setClassType] = useState<ClassType | null> (null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const fetchClassType = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("Class_Type")
      .select("*")
      .eq("id", id)
      .single(); // returns one row

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data) {
      const mappedClassType: ClassType = {
        id: data.id,
        box_id: data.box_id,
        name: data.name,
        description: data.description,
        created_at: data.created_at,
        updated_at: data.updated_at,
        color: data.color,
        duration_default: Number(data.duration_default),
        capacity_default: Number(data.capacity_default),
        waitlist_default: Number(data.waitlist_default),
      };
      setClassType(mappedClassType);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchClassType();
  }, [fetchClassType]);

  return {
    classType,
    loading,
    error,
    refetch: fetchClassType,
  };
}