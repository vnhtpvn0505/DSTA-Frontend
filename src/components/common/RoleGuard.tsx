'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Loading from './Loading';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'admin')[];
  requireAuth?: boolean;
}

export default function RoleGuard({
  children,
  allowedRoles,
  requireAuth = true,
}: RoleGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { hasPermission, getDefaultRoute } = useAuthorization();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push('/');
      return;
    }

    // If specific roles are required, check if user has the right role
    if (allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to user's default route
        const defaultRoute = getDefaultRoute();
        router.push(defaultRoute);
        return;
      }
    }

    // Check if user has permission to access current path
    if (isAuthenticated && !hasPermission(pathname)) {
      const defaultRoute = getDefaultRoute();
      router.push(defaultRoute);
    }
  }, [
    isLoading,
    isAuthenticated,
    requireAuth,
    allowedRoles,
    user,
    pathname,
    router,
    hasPermission,
    getDefaultRoute,
  ]);

  if (isLoading) {
    return <Loading />;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
