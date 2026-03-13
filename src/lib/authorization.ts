import { UserRole } from '@/types/user';

// Define routes that each role can access
export const ROLE_PERMISSIONS: Record<UserRole | 'guest', string[]> = {
  student: ['/dashboard', '/exam', '/certificate'],
  admin: ['/dashboard', '/student', '/exams', '/reports', '/certificate', '/settings'],
  guest: ['/', '/verify'],
};

// Check if a user role has permission to access a route
export function hasPermission(
  userRole: UserRole | 'guest' | null,
  path: string
): boolean {
  if (!userRole) {
    userRole = 'guest';
  }

  const allowedPaths = ROLE_PERMISSIONS[userRole];

  // Check if the path matches any allowed paths
  return allowedPaths.some((allowedPath) => {
    if (allowedPath === '/') {
      return path === '/';
    }
    return path.startsWith(allowedPath);
  });
}

// Get redirect path based on role
export function getDefaultRouteForRole(role: UserRole | 'guest'): string {
  switch (role) {
    case 'student':
      return '/dashboard';
    case 'admin':
      return '/dashboard';
    case 'guest':
    default:
      return '/';
  }
}

// Check if user can access admin routes
export function isAdmin(role: UserRole | null): boolean {
  return role === 'admin';
}

// Check if user is student
export function isStudent(role: UserRole | null): boolean {
  return role === 'student';
}
