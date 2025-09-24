// src/hooks/useSessionPacks.ts
import { useState, useEffect } from "react";

export type SessionPack = {
  id: string;
  name: string;
  description?: string;
  price: number;
  session_count: number;
  validity_days: number;
  pack_public: boolean;
  is_active: boolean;
  box_id: string;
  created_at: string;
  updated_at: string;
};

const initialPacks: SessionPack[] = [
  {
    id: "1",
    name: "10 Sessões",
    description: "Pack de 10 aulas com validade de 60 dias",
    price: 70,
    session_count: 10,
    validity_days: 60,
    pack_public: true,
    is_active: true,
    box_id: "box-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "5 Sessões",
    description: "Pack de 5 aulas válido por 30 dias",
    price: 40,
    session_count: 5,
    validity_days: 30,
    pack_public: true,
    is_active: true,
    box_id: "box-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useSessionPacks() {
  const [sessionPacks, setSessionPacks] = useState<SessionPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // simula fetch inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setSessionPacks(initialPacks);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  function refetch() {
    setSessionPacks(initialPacks);
  }

  function addSessionPack(
    newPack: Omit<SessionPack, "id" | "created_at" | "updated_at" | "box_id">
  ) {
    const pack: SessionPack = {
      ...newPack,
      id: Date.now().toString(),
      box_id: "box-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSessionPacks((prev) => [...prev, pack]);
  }

  function updateSessionPack(id: string, updated: Partial<SessionPack>) {
    setSessionPacks((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updated, updated_at: new Date().toISOString() }
          : p
      )
    );
  }

  function deleteSessionPack(id: string) {
    setSessionPacks((prev) => prev.filter((p) => p.id !== id));
  }

  return {
    sessionPacks,
    loading,
    error,
    refetch,
    addSessionPack,
    updateSessionPack,
    deleteSessionPack,
  };
}
