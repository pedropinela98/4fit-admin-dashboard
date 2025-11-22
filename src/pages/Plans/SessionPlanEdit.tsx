// src/pages/sessionpacks/SessionPackEdit.tsx
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import SessionPackForm from "../../components/plans/SessionPackForm";
import { useSessionPackById } from "../../hooks/useSessionPackById";
import { useSessionPacks } from "../../hooks/useSessionPacks";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { SessionPackWithAllowed } from "../../hooks/useSessionPackById";
import { SessionPack } from "../../hooks/useSessionPacks";

export default function SessionPackEdit() {
  const { id = "" } = useParams<{ id: string }>();
  const { boxId = "" } = useParams<{ boxId?: string }>();
  const navigate = useNavigate();
  const { updateSessionPack } = useSessionPacks();

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
        {error || "Pack de sessões não encontrado"}
      </p>
    );
  }

  console.log(sessionPack);

  function handleEdit(
    data: Omit<
      Partial<SessionPackWithAllowed>,
      "id" | "created_at" | "updated_at" | "box_id"
    > & { allowed_class_types?: string[] }
  ) {
    if (!sessionPack?.id) {
      console.error("ID do session pack não definido");
      return;
    }

    // Converte null para undefined
    const cleanedData: Partial<SessionPack> = {
      ...data,
      description: data.description ?? undefined,
    };

    updateSessionPack(sessionPack.id, cleanedData, data.allowed_class_types);
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Editar Pack de Sessões" description="" />
      {/* Botão de voltar */}
      <button
        onClick={() => navigate("/plans/sessionpacks")}
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
