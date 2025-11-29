import { useState, useEffect, useCallback } from "react";
import { membersService } from "../services/members.service";
import { supabase } from "../lib/supabase";

export interface Member {
  user_id: string;
  box_id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;

  // Membership
  membership_id?: string;
  membership_plan_name?: string;
  membership_start?: string;
  membership_end?: string;
  membership_days_left?: number;
  membership_payment_state?: string;
  membership_active?: boolean;
  membership_future?: boolean; // NOVO
  membership_price_paid?: number;

  // Insurance
  user_insurance_id?: string;
  insurance_name?: string;
  insurance_start?: string;
  insurance_end?: string;
  insurance_days_left?: number;
  insurance_payment_state?: string;
  insurance_active?: boolean;
  insurance_future?: boolean; // NOVO
  insurance_price_paid?: number;

  // Session Pack
  user_session_pack_id?: string;
  session_pack_name?: string;
  session_pack_start?: string;
  session_pack_end?: string;
  sessions_left?: number;
  session_pack_payment_state?: string;
  session_pack_active?: boolean;
  session_pack_future?: boolean; // NOVO
  session_pack_price_paid?: number;

  // Access flag
  has_access: boolean;
}

export function useMembers(
  boxId: string,
  userId: string | null,
  futurePlan: boolean
) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!boxId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc("get_user_access", {
        p_user_id: userId,
        p_box_id: boxId,
        p_include_future: futurePlan,
      });

      if (error) throw error;

      const mapped: Member[] = (data ?? []).map((m: any) => ({
        user_id: m.user_id,
        box_id: m.box_id,
        name: m.name ?? "",
        email: m.email ?? "",
        phone: m.phone ?? "",
        photoUrl: m.photourl ?? "",

        // Membership
        membership_id: m.membership_id,
        membership_plan_name: m.membership_plan_name,
        membership_start: m.membership_start,
        membership_end: m.membership_end,
        membership_days_left: m.membership_days_left,
        membership_payment_state: m.membership_payment_state,
        membership_active: m.membership_active,
        membership_future: m.membership_future, // NOVO
        membership_price_paid: m.membership_price_paid,

        // Insurance
        user_insurance_id: m.user_insurance_id,
        insurance_name: m.insurance_name,
        insurance_start: m.insurance_start,
        insurance_end: m.insurance_end,
        insurance_days_left: m.insurance_days_left,
        insurance_payment_state: m.insurance_payment_state,
        insurance_active: m.insurance_active,
        insurance_future: m.insurance_future, // NOVO
        insurance_price_paid: m.insurance_price_paid,

        // Session Pack
        user_session_pack_id: m.user_session_pack_id,
        session_pack_name: m.session_pack_name,
        session_pack_start: m.session_pack_start,
        session_pack_end: m.session_pack_end,
        sessions_left: m.sessions_left,
        session_pack_payment_state: m.session_pack_payment_state,
        session_pack_active: m.session_pack_active,
        session_pack_future: m.session_pack_future, // NOVO
        session_pack_price_paid: m.session_pack_price_paid,

        // Access flag
        has_access: m.has_access,
      }));

      setMembers(mapped);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar membros");
    } finally {
      setLoading(false);
    }
  }, [boxId, userId]);

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
