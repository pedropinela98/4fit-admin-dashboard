import { useState, useEffect } from "react";

export type Member = {
  id: string;
  box_id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;

  // Identificação bancária/fiscal
  nif?: string;
  iban?: string;

  // Plano atual
  plan_id?: string; // id do plano atribuído
  plan_name?: string; // nome do plano (ex: "Mensal", "Trimestral")
  membership_active: boolean; // se o plano está ativo
  membership_start?: string; // data de início
  membership_end?: string; // data de fim
  membership_price?: number; // preço base do plano
  membership_discount?: number; // desconto aplicado (%)
  membership_final_price?: number; // valor final após desconto
  membership_paid?: boolean; // estado do pagamento

  // Seguro
  insurance_state: "valid" | "expiring_soon" | "expired";
  insurance_end?: string;
  insurance_name?: string;

  // Timestamps
  created_at: string;
  updated_at?: string;
};

// Mock inicial de membros
const initialMembers: Member[] = [
  {
    id: "1",
    box_id: "box-1",
    user_id: "user-1",
    name: "João Silva",
    email: "joao@example.com",
    phone: "+351 912 345 678",
    photoUrl: "/images/user/user-01.jpg",
    nif: "123456789",
    iban: "PT50000201231234567890154",
    plan_id: "plan-1",
    plan_name: "Plano Mensal Ilimitado",
    membership_active: true,
    membership_start: "2025-10-20",
    membership_end: "2025-11-20",
    membership_price: 40,
    membership_discount: 0,
    membership_final_price: 40,
    membership_paid: true,
    insurance_state: "valid",
    insurance_end: "2025-12-31",
    insurance_name: "Seguro Anual",
    created_at: "2025-01-10T09:00:00Z",
  },
  {
    id: "2",
    box_id: "box-1",
    user_id: "user-2",
    name: "Maria Santos",
    email: "maria@example.com",
    phone: "+351 934 567 890",
    photoUrl: "/images/user/user-02.jpg",
    nif: "987654321",
    iban: "PT50000201239876543210987",
    plan_id: "plan-2",
    plan_name: "Plano 10 Aulas",
    membership_active: false,
    membership_price: 100,
    membership_discount: 10,
    membership_final_price: 90,
    membership_paid: false,
    insurance_state: "expired",
    insurance_end: "2025-01-15",
    insurance_name: "Seguro Mensal",
    created_at: "2025-02-01T09:00:00Z",
  },
  {
    id: "3",
    box_id: "box-1",
    user_id: "user-3",
    name: "Pedro Costa",
    email: "pedro@example.com",
    phone: "+351 967 111 222",
    photoUrl: "/images/user/user-03.jpg",
    nif: "112233445",
    iban: "PT50000201231122334455667",
    plan_id: "plan-3",
    plan_name: "Plano Trimestral",
    membership_active: true,
    membership_start: "2025-07-15",
    membership_end: "2025-10-15",
    membership_price: 100,
    membership_discount: 0,
    membership_final_price: 100,
    membership_paid: true,
    insurance_state: "expiring_soon",
    insurance_end: "2025-09-30",
    insurance_name: "Seguro Trimestral",
    created_at: "2025-03-01T09:00:00Z",
  },
];

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // simula fetch inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setMembers(initialMembers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // refetch (simula reload)
  function refetch() {
    setMembers(initialMembers);
  }

  // adicionar membro
  function addMember(newMember: Omit<Member, "id" | "created_at">) {
    const member: Member = {
      ...newMember,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, member]);
  }

  // atualizar membro
  function updateMember(id: string, updated: Partial<Member>) {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, ...updated, updated_at: new Date().toISOString() }
          : m
      )
    );
  }

  // remover membro
  function deleteMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return {
    members,
    loading,
    error,
    refetch,
    addMember,
    updateMember,
    deleteMember,
  };
}
