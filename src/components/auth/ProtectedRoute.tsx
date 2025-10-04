import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireSuperAdmin,
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      setSession(currentSession);

      if (currentSession?.user) {
        const userId = currentSession.user.id;
        const cacheKey = `role_${userId}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          const parsed = JSON.parse(cached);
          const isExpired = Date.now() > parsed.expiry;
          if (!isExpired) {
            setIsSuperAdmin(parsed.role === "super_admin");
            setLoading(false);
            return;
          } else {
            localStorage.removeItem(cacheKey);
          }
        }

        // 🔹 Se não houver cache, consulta Supabase
        const { data: staffData, error } = await supabase
          .from("Box_Staff")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) console.error("Erro ao verificar role:", error);

        const isSuper = staffData?.role === "super_admin";
        setIsSuperAdmin(isSuper);

        // 🕒 Cache válido por 10 minutos
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            role: staffData?.role,
            expiry: Date.now() + 10 * 60 * 1000,
          })
        );
      }

      setLoading(false);
    };

    checkAccess();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          localStorage.clear();
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <p className="text-center text-gray-500">🔄 A verificar sessão...</p>
    );
  }

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
