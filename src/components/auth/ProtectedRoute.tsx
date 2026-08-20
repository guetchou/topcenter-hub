import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  requireMasterAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
  requireMasterAdmin = false
}: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireMasterAdmin && user.role !== 'master_admin') {
    return <Navigate to="/" replace />;
  }

  if (requireSuperAdmin && !['master_admin', 'super_admin'].includes(user.role || '')) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !['master_admin', 'super_admin', 'admin'].includes(user.role || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
