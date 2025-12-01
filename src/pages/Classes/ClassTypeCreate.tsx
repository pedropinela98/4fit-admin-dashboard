import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import ClassTypeForm, { ClassTypeFormData } from "../../components/classes/ClassTypeForm";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/ui/Toast";

export default function ClassTypeCreate() {
  const navigate = useNavigate();
  const { boxId = "" } = useParams<{ boxId: string }>();
  const { addToast } = useToast();

  async function handleCreate(data: ClassTypeFormData) {
    try {
      const { data: insertedClassType, error } = await supabase
        .from("Class_Type")
        .insert([
          {
            box_id: boxId,
            name: data.name,
            description: data.description,
            color: data.color,
            duration_default: data.duration_default,
            capacity_default: data.capacity_default,
            waitlist_default: data.waitlist_default
          },
        ])
        .select()
        .single();

      if (error || !insertedClassType) throw error;

      addToast("Tipo de aula criado com sucesso!", "success");

      navigate(`/box/${boxId}/classes/types`);
    } catch (err) {
      console.error(err);
      addToast("Não foi possível criar o tipo de aula", "error");
    }
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Criar Tipo de Aula" description="" />

      {/* Botão de voltar */}
      <button
        onClick={() => navigate(`/box/${boxId}/classes/types`)}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos tipos de aula
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Criar Novo Tipo de Aula
      </h1>

      {/* Formulário */}
      <ClassTypeForm mode="create" onSubmit={handleCreate}/>
    </div>
  );
}
