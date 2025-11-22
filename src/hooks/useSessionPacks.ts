// src/hooks/useSessionPacks.ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export type SessionPack = {
  id: string;
  name: string;
  description?: string;
  price: number;
  session_count: number;
  validity_days: number;
  pack_public: boolean;
  is_active: boolean;
  box_id: string;
  created_at: string;
  updated_at: string;
};

export function useSessionPacks(boxId?: string) {
  const [sessionPacks, setSessionPacks] = useState<SessionPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSessionPacks() {
    if (!boxId) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("Session_Pack")
      .select("*")
      .eq("box_id", boxId)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const mapped: SessionPack[] = (data || []).map((p: any) => ({
      id: p.id,
      box_id: p.box_id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      session_count: p.session_count,
      validity_days: p.validity_days,
      is_active: p.is_active,
      pack_public: p.pack_public,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    setSessionPacks(mapped);
    setLoading(false);
  }

  useEffect(() => {
    fetchSessionPacks();
  }, [boxId]);

  function addSessionPack(
    newPack: Omit<SessionPack, "id" | "created_at" | "updated_at" | "box_id">
  ) {
    const pack: SessionPack = {
      ...newPack,
      id: Date.now().toString(),
      box_id: "box-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSessionPacks((prev) => [...prev, pack]);
  }

  async function updateSessionPack(
    id: string,
    updated: Partial<SessionPack>,
    classTypeIds?: string[] // IDs das aulas em que o pack pode ser usado
  ) {
    console.log(updated);
    console.log(classTypeIds);
    // 🔹 Atualiza no Supabase o próprio SessionPack
    // 🔹 Extrair apenas os campos que realmente existem na tabela
    const {
      name,
      description,
      price,
      session_count,
      validity_days,
      is_active,
    } = updated;

    // 🔹 Atualiza no Supabase
    const { data: packData, error: packError } = await supabase
      .from("Session_Pack")
      .update({
        name,
        description,
        price,
        session_count,
        validity_days,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .single();

    if (packError) {
      console.error("Erro ao atualizar SessionPack:", packError);
      return { success: false, error: packError };
    }

    // 🔹 Atualiza os tipos de aulas (ligação many-to-many)
    if (classTypeIds) {
      // Primeiro remove os tipos antigos
      const { error: deleteError } = await supabase
        .from("SessionPack_ClassTypeRelations")
        .delete()
        .eq("session_pack_id", id);

      if (deleteError) {
        console.error("Erro ao remover tipos antigos:", deleteError);
        return { success: false, error: deleteError };
      }

      // Depois insere os novos
      const { error: insertError } = await supabase
        .from("SessionPack_ClassTypeRelations")
        .insert(
          classTypeIds.map((class_type_id) => ({
            session_pack_id: id,
            class_type_id: class_type_id,
          }))
        );

      if (insertError) {
        console.error("Erro ao adicionar novos tipos:", insertError);
        return { success: false, error: insertError };
      }
    }

    return { success: true, data: packData };
  }

  function deleteSessionPack(id: string) {
    setSessionPacks((prev) => prev.filter((p) => p.id !== id));
  }

  return {
    sessionPacks,
    loading,
    error,
    refetch: fetchSessionPacks,
    addSessionPack,
    updateSessionPack,
    deleteSessionPack,
  };
}
