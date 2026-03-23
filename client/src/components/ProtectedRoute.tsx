import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../../../shared/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Allowed roles. If empty, any authenticated user can access. */
  roles?: UserRole[];
  /** Where to redirect if not authenticated */
  redirectTo?: string;
}

/**
 * Route wrapper that enforces authentication and role-based access.
 * 
 * Usage:
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute roles={['landlord', 'broker', 'admin']}>
 *       <DashboardPage />
 *     </ProtectedRoute>
 *   } />
 */
export default function ProtectedRoute({
  children,
  roles = [],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role check (if roles specified)
  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
