import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import StaffForm from "../../components/staff/StaffForm";
import { useStaff, Staff } from "../../hooks/useStaff";

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

  // aqui o TS já sabe que é um Staff
  const staffMember: Staff = maybeStaffMember;

  function handleEdit(data: Partial<Staff>) {
    updateStaff(staffMember.id, data);
    navigate("/staff");
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Editar Staff" description="" />
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Editar {staffMember.name}
      </h1>
      <StaffForm mode="edit" initialData={staffMember} onSubmit={handleEdit} />
    </div>
  );
}
