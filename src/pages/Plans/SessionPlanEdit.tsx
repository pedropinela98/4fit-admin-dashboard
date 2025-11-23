// src/pages/sessionpacks/SessionPackEdit.tsx
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import SessionPackForm from "../../components/plans/SessionPackForm";
import { useSessionPackById } from "../../hooks/useSessionPackById";
import { useSessionPacks } from "../../hooks/useSessionPacks";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { SessionPackWithAllowed } from "../../hooks/useSessionPackById";
import { SessionPack } from "../../hooks/useSessionPacks";
import { useToast } from "../../components/ui/Toast";

export default function SessionPackEdit() {
  const { id = "" } = useParams<{ id: string }>();
  const { boxId = "" } = useParams<{ boxId?: string }>();
  const navigate = useNavigate();
  const { updateSessionPack } = useSessionPacks();
  const { addToast } = useToast();

  // 🔹 Usar o hook que busca pack + allowed_class_types + classTypes
  const { sessionPack, classTypes, loading, error } = useSessionPackById(
    boxId,
    id
  );

  if (loading) {
    return <p className="text-gray-500">A carregar pack de sessões...</p>;
  }

  if (error || !sessionPack) {
    return (
      <p className="text-red-500">
        {"Não é possivel visualizar o plano de momento"}
      </p>
    );
  }

  async function handleEdit(
    data: Omit<
      Partial<SessionPackWithAllowed>,
      "id" | "created_at" | "updated_at" | "box_id"
    > & { allowed_class_types?: string[] }
  ) {
    if (!sessionPack?.id) {
      addToast("ID do pack inválido", "error");
      return;
    }

    try {
      const cleanedData: Partial<SessionPack> = {
        ...data,
        description: data.description ?? undefined,
      };

      const result = await updateSessionPack(
        sessionPack.id,
        cleanedData,
        data.allowed_class_types
      );

      if (!result.success) {
        addToast("Não foi possível atualizar o pack", "error");
        return;
      }

      addToast("Pack atualizado com sucesso!", "success");
      navigate(`/box/${boxId}/sessionpacks`);
    } catch (err) {
      console.error(err);
      addToast("Ocorreu um erro inesperado ao atualizar o pack", "error");
    }
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Editar Pack de Sessões" description="" />
      {/* Botão de voltar */}
      <button
        onClick={() => navigate(`/box/${boxId}/sessionpacks`)}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos packs de sessões
      </button>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Editar {sessionPack.name}
      </h1>

      <SessionPackForm
        mode="edit"
        initialData={sessionPack}
        classTypes={classTypes}
        onSubmit={handleEdit}
      />
    </div>
  );
}
