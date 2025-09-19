// src/pages/sessionpacks/SessionPackCreate.tsx
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import SessionPackForm, {
  SessionPack,
} from "../../components/plans/SessionPackForm";
import { useSessionPacks } from "../../hooks/useSessionPacks";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Button from "../../components/ui/button/Button";

export default function SessionPackCreate() {
  const navigate = useNavigate();
  const { addSessionPack } = useSessionPacks();

  function handleCreate(
    data: Omit<SessionPack, "id" | "created_at" | "updated_at" | "box_id">
  ) {
    addSessionPack(data);
    navigate("/sessionpacks");
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Criar Plano de Senhas" description="" />

      {/* Botão de voltar */}
      <button
        onClick={() => navigate("/plans/sessionpacks")}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos planos de senhas
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Criar Novo Plano de Senhas
      </h1>

      <SessionPackForm mode="create" onSubmit={handleCreate} />
    </div>
  );
}
