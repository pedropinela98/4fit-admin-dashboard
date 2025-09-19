// src/hooks/useStaff.ts
import { useState, useEffect } from "react";

export type Staff = {
  id: string;
  box_id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  role: ("admin" | "coach" | "rececionista")[];
  active: boolean;
  start_date: string;
  end_date?: string;
  created_at: string;
};

// mock data estática
const initialStaff: Staff[] = [
  {
    id: "1",
    box_id: "box-1",
    user_id: "user-1",
    name: "João Silva",
    email: "joao.silva@example.com",
    phone: "+351 912 345 678",
    role: ["admin"], // agora é array
    active: true,
    start_date: "2024-01-10",
    created_at: "2024-01-10T09:00:00Z",
  },
  {
    id: "2",
    box_id: "box-1",
    user_id: "user-2",
    name: "Maria Ferreira",
    email: "maria.ferreira@example.com",
    phone: "+351 934 567 890",
    role: ["coach"], // também array
    active: true,
    start_date: "2024-02-01",
    created_at: "2024-02-01T09:00:00Z",
  },
  {
    id: "3",
    box_id: "box-1",
    user_id: "user-3",
    name: "Pedro Costa",
    email: "pedro.costa@example.com",
    phone: "+351 967 111 222",
    role: ["rececionista", "coach"], // múltiplos roles
    active: false,
    start_date: "2023-11-15",
    end_date: "2024-06-30",
    created_at: "2023-11-15T09:00:00Z",
  },
];

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // simula fetch inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setStaff(initialStaff);
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
    setStaff(initialStaff);
  }

  // adicionar staff
  function addStaff(newStaff: Omit<Staff, "id" | "created_at">) {
    const staffMember: Staff = {
      ...newStaff,
      id: Date.now().toString(), // id único simples
      created_at: new Date().toISOString(),
    };
    setStaff((prev) => [...prev, staffMember]);
  }

  // atualizar staff
  function updateStaff(id: string, updated: Partial<Staff>) {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...updated, updated_at: new Date().toISOString() }
          : s
      )
    );
  }

  // remover staff
  function deleteStaff(id: string) {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }

  return { staff, loading, error, refetch, addStaff, updateStaff, deleteStaff };
}
