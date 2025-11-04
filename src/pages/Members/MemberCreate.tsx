// src/pages/members/MemberCreate.tsx
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import MemberAssociate from "../../components/members/MemberAssociate";
import { useMembers } from "../../hooks/useMembers";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function MemberCreate() {
  const { boxId } = useParams<{ boxId: string }>();
  if (!boxId) {
    return <p>Box não encontrada.</p>;
  }
  const navigate = useNavigate();
  /*  const { addMember } = useMembers(); */

  function handleCreate(data: any) {
    console.log("Novo membro:", data);
    addMember({
      ...data,
      membership_active: false, // por default
      insurance_state: "expired", // default
    });
    navigate(`/box/${boxId}/members`);
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Criar Membro" description="" />

      {/* Botão de voltar */}
      <button
        onClick={() => navigate(`/box/${boxId}/members`)}
        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Voltar aos membros
      </button>

      <MemberAssociate
        boxId={boxId}
        boxName="CrossFit Gaia"
        adminName="Pedro Lopes"
      />
    </div>
  );
}
