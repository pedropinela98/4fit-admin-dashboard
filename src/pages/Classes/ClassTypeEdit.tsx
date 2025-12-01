import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import ClassTypeForm, { ClassTypeFormData } from "../../components/classes/ClassTypeForm";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useClassTypeById } from "../../hooks/useClassTypeById";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/ui/Toast";

export default function ClassTypeEdit() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { boxId = "" } = useParams<{ boxId: string }>();
  const { addToast } = useToast();

  const { classType, loading, error, refetch } = useClassTypeById(
    id!
  );

  async function handleEdit(data: ClassTypeFormData) {
    try {
      // Atualiza o tipo de aula
      await supabase
        .from("Class_Type")
        .update({
          name: data.name,
          description: data.description,
          color: data.color,
          duration_default: data.duration_default,
          capacity_default: data.capacity_default,
          waitlist_default: data.waitlist_default
        })
        .eq("id", id);

      refetch();
      addToast("Tipo de aula atualizado com sucesso!", "success");
    } catch (err) {
      addToast("Não foi possível processar o pedido", "error");
    }
  }

  if (loading) return <p className="text-gray-500">A carregar o tipo de aula...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!classType) return <p className="text-red-500">Tipo de aula não encontrado.</p>;

  const initialData: ClassTypeFormData = {
    name: classType.name,
    description: classType.description || "",
    color: classType.color,
    duration_default: classType.duration_default,
    capacity_default: classType.capacity_default,
    waitlist_default: classType.waitlist_default
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Editar Tipo de Aula" description="" />
      <button
        onClick={() => navigate(`/box/${boxId}/classes/types`)}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos tipos de aulas
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Editar {classType.name}
      </h1>

      <ClassTypeForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleEdit}
      />
    </div>
  );
}
