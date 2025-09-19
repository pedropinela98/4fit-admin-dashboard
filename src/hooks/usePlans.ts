import { useState, useEffect } from "react";

export type Plan = {
  id: string;
  box_id: string;
  name: string;
  description?: string;
  price: number;
  maxSessionsPerWeek?: number; // null = ilimitado
  isActive: boolean;
  created_at: string;
};

const initialPlans: Plan[] = [
  {
    id: "1",
    box_id: "box-1",
    name: "Livre Trânsito",
    description: "Todas as aulas ilimitadas por semana + Open Box",
    price: 79,
    maxSessionsPerWeek: undefined,
    isActive: true,
    created_at: "2024-01-10T09:00:00Z",
  },
  {
    id: "2",
    box_id: "box-1",
    name: "3 Aulas / Semana",
    description: "Acesso a 3 aulas por semana + Open Box",
    price: 75,
    maxSessionsPerWeek: 3,
    isActive: true,
    created_at: "2024-02-01T09:00:00Z",
  },
  {
    id: "3",
    box_id: "box-1",
    name: "2 Aulas / Semana",
    description: "Acesso a 2 aulas por semana + Open Box",
    price: 69,
    maxSessionsPerWeek: 2,
    isActive: true,
    created_at: "2024-03-01T09:00:00Z",
  },
  {
    id: "4",
    box_id: "box-1",
    name: "1 Aula / Semana",
    description: "Acesso a 1 aula por semana + Open Box",
    price: 61,
    maxSessionsPerWeek: 1,
    isActive: false,
    created_at: "2024-04-01T09:00:00Z",
  },
];

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // simula fetch inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setPlans(initialPlans);
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
    setPlans(initialPlans);
  }

  // adicionar plano
  function addPlan(newPlan: Omit<Plan, "id" | "created_at">) {
    const plan: Plan = {
      ...newPlan,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setPlans((prev) => [...prev, plan]);
  }

  // atualizar plano
  function updatePlan(id: string, updated: Partial<Plan>) {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updated, updated_at: new Date().toISOString() }
          : p
      )
    );
  }

  // remover plano
  function deletePlan(id: string) {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }

  return { plans, loading, error, refetch, addPlan, updatePlan, deletePlan };
}
