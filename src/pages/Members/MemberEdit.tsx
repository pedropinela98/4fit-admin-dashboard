// src/pages/members/MemberEdit.tsx
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import MemberForm from "../../components/members/MembersForm";
import { Member, useMembers } from "../../hooks/useMembers";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function MemberEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, updateMember, loading } = useMembers();
  // 👆 assumir que o hook devolve um estado de loading (podes adicionar se ainda não tiveres)

  const member = members.find((m) => m.id === id);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        A carregar dados do membro...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-center text-gray-500">
        Membro não encontrado.
      </div>
    );
  }

  function handleUpdate(id: string, data: Partial<Member>) {
    updateMember(id, data);
    navigate(`/members/${id}`);
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Editar Membro" description="" />

      <button
        onClick={() => navigate(`/members`)}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos membros
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Editar Membro
      </h1>

      <MemberForm
        mode="edit"
        initialData={member}
        onSubmit={(data) => handleUpdate(member.id, data)}
      />
    </div>
  );
}
