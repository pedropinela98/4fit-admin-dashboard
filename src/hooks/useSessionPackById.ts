import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export type SessionPackWithAllowed = {
  id: string;
  box_id: string;
  name: string;
  description?: string | null;
  price: number;
  session_count: number;
  validity_days: number;
  pack_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  allowed_class_types?: string[];
};

export type ClassType = {
  id: string;
  box_id: string;
  name: string;
  description?: string | null;
  active: boolean;
};

export function useSessionPackById(boxId?: string, packId?: string) {
  const [sessionPack, setSessionPack] =
    useState<Partial<SessionPackWithAllowed> | null>(null);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!boxId || !packId) return;

    setLoading(true);
    setError(null);

    try {
      // 🔹 Buscar pack
      const packRes = await supabase
        .from("Session_Pack")
        .select("*")
        .eq("id", packId)
        .eq("box_id", boxId)
        .single();

      if (packRes.error) throw packRes.error;
      const packData: Partial<SessionPackWithAllowed> = packRes.data;

      // 🔹 Buscar todos os ClassTypes ativos da box
      const classTypesRes = await supabase
        .from("Class_Type")
        .select("*")
        .eq("box_id", boxId)
        .eq("active", true);

      if (classTypesRes.error) throw classTypesRes.error;
      setClassTypes(classTypesRes.data || []);

      // 🔹 Buscar relações do pack
      const relationsRes = await supabase
        .from("SessionPack_ClassTypeRelations")
        .select("class_type_id")
        .eq("session_pack_id", packId);

      if (relationsRes.error) throw relationsRes.error;
      console.log(relationsRes);

      const allowedClassTypeIds = (relationsRes.data || []).map(
        (r: any) => r.class_type_id
      );

      // 🔹 Adicionar allowed_class_types ao pack
      packData.allowed_class_types = allowedClassTypeIds;

      setSessionPack(packData);
    } catch (e: any) {
      setError(e.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [boxId, packId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { sessionPack, classTypes, loading, error, refetch: fetchData };
}
