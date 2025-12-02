// src/hooks/useUserDetail.ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export type AthleteType = "Rx" | "Scaled" | null;

export type UserDetail = {
  athlete_type: string;
  auth_user_id: string | null;
  bank_account: string | null;
  birth_date: string | null;
  created_at: string;
  deleted_at: string | null;
  email: string;
  email_confirmed_at: string | null;
  gender: string;
  height: number | null;
  id: string;
  last_sign_in_at: string | null;
  name: string;
  notification_token: string | null;
  phone: string | null;
  public_results: boolean;
  updated_at: string;
  userphotoUrl: string | null;
};

export function useUserDetail(userDetailId: string | null) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------
  // FETCH user_detail by ID
  // ---------------------------------------------------
  const fetchUserDetail = async () => {
    if (!userDetailId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("User_detail")
      .select("*")
      .eq("id", userDetailId)
      .maybeSingle();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDetail(data as UserDetail);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserDetail();
  }, [userDetailId]);

  return {
    detail,
    loading,
    error,
    refetch: fetchUserDetail,
  };
}
