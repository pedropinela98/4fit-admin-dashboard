import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import InsuranceForm from "../../components/plans/InsuranceForm";
import { useInsurances } from "../../hooks/useInsurances";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useToast } from "../../components/ui/Toast";
import type { Insurance } from "../../hooks/useInsurances";

export default function InsuranceCreate() {
  const { boxId = "" } = useParams<{ boxId: string }>();
  const navigate = useNavigate();
  const { addInsurance } = useInsurances(boxId); // 🔹 Função para criar
  const { addToast } = useToast();

  async function handleCreate(
    data: Omit<Insurance, "id" | "box_id" | "created_at">
  ) {
    try {
      const result = await addInsurance(data);

      if (!result) {
        addToast("Não foi possível criar o seguro", "error");
        return;
      }

      addToast("Seguro criado com sucesso!", "success");
      navigate(`/box/${boxId}/insurances`);
    } catch (err) {
      console.error(err);
      addToast("Erro inesperado ao criar o seguro", "error");
    }
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Criar Seguro" description="" />

      <button
        onClick={() => navigate(`/box/${boxId}/insurances`)}
        className="flex items-center text-sm text-gray-600 hover:text-blue-600"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos seguros
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Criar Novo Seguro
      </h1>

      <InsuranceForm mode="create" onSubmit={handleCreate} />
    </div>
  );
}
