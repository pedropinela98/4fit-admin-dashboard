// src/pages/staff/StaffCreate.tsx
import PageMeta from "../../components/common/PageMeta";
import StaffForm from "../../components/staff/StaffForm";
import { useNavigate } from "react-router";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function StaffCreate() {
  const navigate = useNavigate();

  function handleCreate(data: any) {
    console.log("Novo staff criado:", data);
    // aqui faria POST para API
    navigate("/staff"); // redireciona de volta à lista
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Criar Staff" description="" />

      {/* Botão de voltar */}
      <button
        onClick={() => navigate("/staff")}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar ao staff
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Criar Novo Staff
      </h1>

      <StaffForm mode="create" onSubmit={handleCreate} />
    </div>
  );
}
