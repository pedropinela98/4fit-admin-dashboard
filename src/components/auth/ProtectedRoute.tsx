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

  // Enquanto ainda não verificamos a sessão, mostramos loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se não há utilizador logado, redireciona para login
  if (!userDetailId) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // Se é necessário ser super admin e não é, redireciona para home
  if (requireSuperAdmin && !roles.includes("super_admin")) {
    return <Navigate to="/" replace />;
  }

  // Se não tem box selecionada e não estamos a ignorar verificação, redireciona
  if (!skipBoxCheck && !boxId) {
    return <Navigate to="/" replace />;
  }

  // Caso contrário, renderiza o conteúdo protegido
  return <>{children}</>;
}
