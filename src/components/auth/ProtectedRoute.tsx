import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useUser } from "../../context/UserContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
  skipBoxCheck?: boolean;
}

export default function ProtectedRoute({
  children,
  requireSuperAdmin,
  skipBoxCheck = false,
}: ProtectedRouteProps) {
  const { userDetailId, boxId, roles, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <p className="text-center text-gray-500">🔄 A verificar sessão...</p>
    );
  }

  if (!userDetailId) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (requireSuperAdmin && !roles.includes("super_admin")) {
    return <Navigate to="/" replace />;
  }

  // Se não tiver box selecionada e houver mais de uma disponível
  if (!skipBoxCheck && !boxId) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
