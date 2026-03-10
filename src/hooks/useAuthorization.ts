import { useAuth } from './useAuth';
import { hasPermission, getDefaultRouteForRole } from '@/lib/authorization';
import { UserRole } from '@/types/user';

export function useAuthorization() {
  const { user, isAuthenticated } = useAuth();

  const userRole: UserRole | 'guest' = user?.role || 'guest';

  return {
    userRole,
    hasPermission: (path: string) => hasPermission(userRole, path),
    getDefaultRoute: () => getDefaultRouteForRole(userRole),
    isAdmin: userRole === 'admin',
    isStudent: userRole === 'student',
    isGuest: !isAuthenticated,
  };
}
