import { useState, useEffect } from "react";
import { membersService } from "../services/members.service"; // importa o service
import type { Member } from "../services/members.service";

export function useMembers(boxId: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch inicial
  useEffect(() => {
    if (!boxId) return;

    async function fetchMembers() {
      setLoading(true);
      try {
        const data = await membersService.getMembersByBox(boxId);

        // Mapear para o tipo Member
        const mapped: Member[] = data.map((m) => ({
          id: m.id,
          box_id: m.box_id,
          user_id: m.user_id,
          name: m.User_detail.name,
          email: m.User_detail.email,
          phone: m.User_detail.phone || "",
          photoUrl: "", // se não tiver foto, deixar vazio ou pegar de outro campo
          membership_active:
            m.User_detail.Membership?.some((p) => p.is_active) || false,
          membership_start:
            m.User_detail.Membership?.[0]?.start_date || undefined,
          membership_end: m.User_detail.Membership?.[0]?.end_date || undefined,
          membership_price: undefined,
          membership_discount: undefined,
          membership_final_price: undefined,
          membership_paid: undefined,
          plan_id: m.User_detail.Membership?.[0]?.plan_id || undefined,
          plan_name: m.User_detail.Membership?.[0]?.Plan?.name || undefined,
          insurance_state: m.seguro_validade
            ? new Date(m.seguro_validade) > new Date()
              ? "valid"
              : "expired"
            : "expired",
          insurance_end: m.seguro_validade || undefined,
          insurance_name: m.notes || undefined,
          created_at: m.created_at,
          updated_at: m.updated_at || undefined,
        }));

        setMembers(mapped);
      } catch (err: any) {
        setError(err.message || "Erro ao buscar membros");
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [boxId]);

  // Buscar membro por email
  async function getMemberByEmail(email: string) {
    try {
      const member = await membersService.getMemberByEmail(email);
      return member;
    } catch (err) {
      console.error("Erro ao buscar membro por email:", err);
      return null;
    }
  }

  // CRUD
  /* async function addMember(newMember: Omit<Member, "id" | "created_at">) {
    try {
      const created = await membersService.createMember(newMember);
      setMembers((prev) => [...prev, created]);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateMember(id: string, updates: Partial<Member>) {
    try {
      const updated = await membersService.updateMember({ id, ...updates });
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteMember(id: string) {
    try {
      await membersService.deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  } */

  return {
    members,
    loading,
    error,
    getMemberByEmail, // expõe a função para ser chamada no form
    /* addMember,
    updateMember,
    deleteMember, */
  };
}
