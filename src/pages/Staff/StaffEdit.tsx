// src/pages/staff/StaffEdit.tsx
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import StaffForm from "../../components/staff/StaffForm";
import { useStaff, Staff } from "../../hooks/useStaff";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function StaffEdit() {
  const { id } = useParams<{ id: string }>();
  const { staff, loading, updateStaff } = useStaff();
  const navigate = useNavigate();

  if (loading) {
    return <p>A carregar staff...</p>;
  }

  // tentar encontrar o membro
  const maybeStaffMember: Staff | undefined = staff.find((s) => s.id === id);

  if (!maybeStaffMember) {
    return <p className="text-red-500">Staff não encontrado</p>;
  }

  const staffMember: Staff = maybeStaffMember;

  function handleEdit(data: Partial<Staff>) {
    updateStaff(staffMember.id, data);
    navigate("/staff");
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Editar Staff" description="" />

      {/* Botão de voltar */}
      <button
        onClick={() => navigate("/staff")}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar ao staff
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Editar {staffMember.name}
      </h1>

      <StaffForm mode="edit" initialData={staffMember} onSubmit={handleEdit} />
    </div>
  );
}
