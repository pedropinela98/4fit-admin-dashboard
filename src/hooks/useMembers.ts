import { useState, useEffect, useCallback } from "react";
import { membersService } from "../services/members.service";
import type { Member } from "../services/members.service";

export function useMembers(boxId: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!boxId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await membersService.getMembersByBox(boxId);

      const mapped: Member[] = data.map((m) => ({
        id: m.id,
        box_id: m.box_id,
        user_id: m.User_detail.id,
        name: m.User_detail.name,
        email: m.User_detail.email,
        phone: m.User_detail.phone || "",
        photoUrl: "",
        membership_active: (m.User_detail.Membership ?? []).some(
          (p: any) => p.is_active
        ),
        membership_start:
          m.User_detail.Membership?.[0]?.start_date || undefined,
        membership_end: m.User_detail.Membership?.[0]?.end_date || undefined,
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
  }, [boxId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function getMemberByEmail(email: string) {
    try {
      const member = await membersService.getMemberByEmail(email);
      return member;
    } catch (err) {
      console.error("Erro ao buscar membro por email:", err);
      return null;
    }
  }

  return {
    members,
    loading,
    error,
    getMemberByEmail,
    refetch: fetchMembers,
  };
}
