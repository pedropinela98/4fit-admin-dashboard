// src/pages/sessionpacks/SessionPackCreate.tsx
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import SessionPackForm, {
  ClassType,
} from "../../components/plans/SessionPackForm";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/ui/Toast";
import { useState, useEffect } from "react";
import { SessionPack } from "../../hooks/useSessionPacks";

export default function SessionPackCreate() {
  const navigate = useNavigate();
  const { boxId = "" } = useParams<{ boxId: string }>();
  const { addToast } = useToast();

  const [classTypes, setClassTypes] = useState<ClassType[]>([]);

  // 🔹 Buscar class types da box
  useEffect(() => {
    async function fetchClassTypes() {
      const { data, error } = await supabase
        .from("Class_Type")
        .select("*")
        .eq("box_id", boxId)
        .eq("active", true);

      if (!error && data) setClassTypes(data);
    }

    fetchClassTypes();
  }, [boxId]);

  // 🔹 Criar Session Pack
  async function handleCreate(
    data: Omit<SessionPack, "id" | "created_at" | "updated_at" | "box_id"> & {
      allowed_class_types?: string[];
    }
  ) {
    try {
      // 1️⃣ Inserir o session pack
      const { data: inserted, error } = await supabase
        .from("Session_Pack")
        .insert([
          {
            box_id: boxId,
            name: data.name,
            description: data.description,
            price: data.price,
            session_count: data.session_count,
            validity_days: data.validity_days,
            is_active: data.is_active,
          },
        ])
        .select()
        .single();

      if (error || !inserted) throw error;

      // 2️⃣ Inserir allowed class types (se houver)
      if (data.allowed_class_types?.length) {
        const inserts = data.allowed_class_types.map((ctId) => ({
          session_pack_id: inserted.id,
          class_type_id: ctId,
        }));

        const { error: allowedErr } = await supabase
          .from("SessionPack_ClassTypeRelations")
          .insert(inserts);

        if (allowedErr) throw allowedErr;
      }

      // 3️⃣ Toast
      addToast("Plano de sessões criado com sucesso!", "success");

      // 4️⃣ Navegar de volta
      navigate(`/box/${boxId}/sessionpacks`);
    } catch (err) {
      addToast("Não foi possível criar o plano de sessões", "error");
    }
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Criar Plano de Senhas" description="" />

      {/* Botão de voltar */}
      <button
        onClick={() => navigate(`/box/${boxId}/sessionpacks`)}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos planos de senhas
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Criar Novo Planos de Senhas
      </h1>

      <SessionPackForm
        mode="create"
        classTypes={classTypes}
        onSubmit={handleCreate}
      />
    </div>
  );
}
