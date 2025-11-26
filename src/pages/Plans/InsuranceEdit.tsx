import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import InsuranceForm from "../../components/plans/InsuranceForm";
import { useInsurances } from "../../hooks/useInsurances";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useToast } from "../../components/ui/Toast";
import { useEffect, useState } from "react";
import type { Insurance } from "../../hooks/useInsurances";

export default function InsuranceEdit() {
  const { id = "" } = useParams<{ id: string }>();
  const { boxId = "" } = useParams<{ boxId: string }>();
  const navigate = useNavigate();
  const { updateInsurance, getInsuranceById } = useInsurances(boxId);
  const { addToast } = useToast();

  const [insurance, setInsurance] = useState<Insurance | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Buscar insurance usando a nova função
  useEffect(() => {
    async function loadInsurance() {
      setLoading(true);
      const data = await getInsuranceById(id);
      setInsurance(data);
      setLoading(false);
    }

    if (id) loadInsurance();
  }, [id]);

  if (loading) {
    return <p className="text-gray-500">A carregar seguro...</p>;
  }

  if (!insurance) {
    return (
      <p className="text-red-500">
        Não é possível visualizar o seguro de momento
      </p>
    );
  }

  // 🔹 Handler de edição igual ao teu SessionPackEdit
  async function handleEdit(
    data: Omit<Insurance, "id" | "box_id" | "created_at">
  ) {
    try {
      if (!insurance) {
        return (
          <p className="text-red-500">
            Não é possível visualizar o seguro de momento
          </p>
        );
      }
      const result = await updateInsurance(insurance.id, data);

      if (!result) {
        addToast("Não foi possível atualizar o seguro", "error");
        return;
      }

      addToast("Seguro atualizado com sucesso!", "success");
      navigate(`/box/${boxId}/insurances`);
    } catch (err) {
      console.error(err);
      addToast("Erro inesperado ao atualizar o seguro", "error");
    }
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Editar Seguro" description="" />

      <button
        onClick={() => navigate(`/box/${boxId}/insurances`)}
        className="flex items-center text-sm text-gray-600 hover:text-blue-600"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos seguros
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Editar {insurance.name}
      </h1>

      <InsuranceForm
        mode="edit"
        initialData={insurance}
        onSubmit={handleEdit}
      />
    </div>
  );
}
