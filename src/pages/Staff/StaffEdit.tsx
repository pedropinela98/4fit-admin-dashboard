// src/pages/staff/StaffEdit.tsx
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import StaffForm from "../../components/staff/StaffForm";
import { Staff, useStaff } from "../../hooks/useStaff";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useToast } from "../../components/ui/Toast";
import { supabase } from "../../lib/supabase";

export default function StaffEdit() {
  const { id, boxId } = useParams<{ id: string; boxId: string }>();
  const navigate = useNavigate();

  const { staff, loading, error } = useStaff(boxId!, id);
  const { addToast } = useToast();

  if (loading) return <p>A carregar staff...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!staff.length)
    return <p className="text-red-500">Staff não encontrado</p>;

  const staffMember: Staff = staff[0];

  async function handleEdit(data: any) {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user) {
        throw new Error("Não foi possível identificar o utilizador.");
      }

      const authUserId = userData.user.id;

      // 🔎 Buscar o user_detail_id correspondente ao utilizador autenticado
      const { data: userDetail, error: detailError } = await supabase
        .from("User_detail")
        .select("id, name")
        .eq("auth_user_id", authUserId)
        .single();

      if (detailError || !userDetail) {
        throw new Error("Não foi possível obter o user_detail_id.");
      }

      const invitedBy = userDetail.id;

      // Obter nome da box
      const { data: boxData } = await supabase
        .from("Box")
        .select("name")
        .eq("id", boxId!)
        .single();

      const boxName = boxData?.name || "";

      // Chamar a edge function
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "X-Client-Info": "crossfit-dashboard@1.0.0",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            box_id: boxId,
            box_name: boxName,
            roles: data.role,
            invited_by: invitedBy,
            admin_name: userDetail.name || userData.user.email,
            is_active: data.active,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok || result.error) {
        console.log(result.error);
        throw new Error(result.error || "Erro ao atualizar staff");
      }

      addToast("Staff atualizado com sucesso!", "success");
      navigate(`/box/${boxId}/staff`);
    } catch (err: any) {
      addToast("Não foi possível atualizar o staff", "error");
    }
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Editar Staff" description="" />

      <button
        onClick={() => navigate(`/box/${boxId}/staff`)}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar ao staff
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Editar {staffMember.name}
      </h1>

      <StaffForm mode="edit" initialData={staffMember} onSubmit={handleEdit} />
    </div>
  );
}
