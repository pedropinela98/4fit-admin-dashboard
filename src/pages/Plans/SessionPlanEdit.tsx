// src/pages/sessionpacks/SessionPackEdit.tsx
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import SessionPackForm, {
  SessionPack,
} from "../../components/plans/SessionPackForm";
import { useSessionPacks } from "../../hooks/useSessionPacks";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function SessionPackEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sessionPacks, updateSessionPack, loading } = useSessionPacks();

  if (loading) {
    return <p className="text-gray-500">A carregar plano de senhas...</p>;
  }

  const maybePack: SessionPack | undefined = sessionPacks.find(
    (p) => p.id === id
  );

  if (!maybePack) {
    return <p className="text-red-500">Plano de senhas não encontrado</p>;
  }

  const sessionPack: SessionPack = maybePack;

  function handleEdit(
    data: Omit<SessionPack, "id" | "created_at" | "updated_at" | "box_id">
  ) {
    updateSessionPack(sessionPack.id, data);
    navigate("/plans/sessionpacks");
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Editar Plano de Senhas" description="" />

      {/* Botão de voltar */}
      <button
        onClick={() => navigate("/plans/sessionpacks")}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos planos de senhas
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Editar {sessionPack.name}
      </h1>

      <SessionPackForm
        mode="edit"
        initialData={sessionPack}
        onSubmit={handleEdit}
      />
    </div>
  );
}
