import PageMeta from "../../components/common/PageMeta";
import StaffForm from "../../components/staff/StaffForm";
import { useNavigate } from "react-router";

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
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Criar Novo Staff
      </h1>
      <StaffForm mode="create" onSubmit={handleCreate} />
    </div>
  );
}
