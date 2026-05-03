import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = (user?.rol_nombre || '').trim().toLowerCase();
    const canAccess = allowedRoles.map((role) => role.toLowerCase()).includes(currentRole);

    if (!canAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
