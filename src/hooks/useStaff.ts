// src/hooks/useStaff.ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export type Staff = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bank_account?: string;
  role: string[];
  active: boolean;
  created_at: string;
  start_date?: string;
  end_date?: string;
};

export function useStaff(boxId: string) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch inicial
  useEffect(() => {
    async function fetchStaff() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc("get_staff_by_box_id", {
          p_box_id: boxId,
        });

        if (error) throw error;

        // mapeia os campos para o tipo Staff
        const mapped: Staff[] = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone_number,
          bank_account: s.bank_account,
          role: s.role,
          active: s.active,
          created_at: s.created_at,
          // se quiseres podes puxar start_date / end_date de Box_Staff
        }));

        setStaff(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (boxId) {
      fetchStaff();
    }
  }, [boxId]);

  // refetch manual
  async function refetch() {
    if (!boxId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_staff_by_box_id", {
        p_box_id: boxId,
      });
      if (error) throw error;
      setStaff(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // adicionar staff
  function addStaff(newStaff: Omit<Staff, "id" | "created_at">) {
    const staffMember: Staff = {
      ...newStaff,
      id: Date.now().toString(), // id único simples
      created_at: new Date().toISOString(),
    };
    setStaff((prev) => [...prev, staffMember]);
  }

  // atualizar staff
  function updateStaff(id: string, updated: Partial<Staff>) {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...updated, updated_at: new Date().toISOString() }
          : s
      )
    );
  }

  // remover staff
  function deleteStaff(id: string) {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }

  return { staff, loading, error, refetch, addStaff, updateStaff, deleteStaff };
}
