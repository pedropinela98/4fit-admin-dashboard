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

export function useStaff(boxId: string, userId?: string | null) {
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
          p_userdetail_id: userId ?? undefined,
        });

        if (error) throw error;

        const mapped: Staff[] = (data || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone_number,
          bank_account: s.bank_account,
          role: s.role,
          active: s.active,
          created_at: s.created_at,
          start_date: s.start_date,
          end_date: s.end_date,
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
  }, [boxId, userId]); // ✅ agora refaz o fetch se mudar o userId

  // refetch manual
  async function refetch() {
    if (!boxId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_staff_by_box_id", {
        p_box_id: boxId,
        p_userdetail_id: userId ?? undefined, // ✅ também aqui
      });
      if (error) throw error;
      setStaff(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function addStaff(newStaff: Omit<Staff, "id" | "created_at">) {
    const staffMember: Staff = {
      ...newStaff,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setStaff((prev) => [...prev, staffMember]);
  }

  function updateStaff(id: string, updated: Partial<Staff>) {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...updated, updated_at: new Date().toISOString() }
          : s
      )
    );
  }

  function deleteStaff(id: string) {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }

  return { staff, loading, error, refetch, addStaff, updateStaff, deleteStaff };
}
