import { useQuery } from '@tanstack/react-query';
import { authService } from '@/features/auth/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';

// Set to true to skip API auth check (for dev without backend)
const SKIP_API_AUTH_CHECK = false

export const useAuth = () => {
  const { setUser, clearUser, user, isAuthenticated } = useAuthStore();

  // Zustand persist rehydrates auth state async on first mount.
  // If we don't gate by hydration, `isAuthenticated` is temporarily false and
  // protected routes may redirect / call profile API causing 401.
  const isHydrated =
    // zustand/middleware `persist` provides `hasHydrated()` on the store hook
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuthStore as any).persist?.hasHydrated?.() ?? true

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Skip API call if SKIP_API_AUTH_CHECK is true
    // Only fetch profile when we don't already have an authenticated user in the store.
    // This avoids clearing the user on transient 401s (e.g. cookie not ready yet),
    // while still enforcing auth on first load / refresh.
    enabled: !SKIP_API_AUTH_CHECK && isHydrated && !isAuthenticated,
  });

  useEffect(() => {
    if (SKIP_API_AUTH_CHECK) {
      return;
    }
    if (!isHydrated) {
      return;
    }
    // Sync query data → store. Only clear when no user in store (avoid race after login).
    if (data) {
      setUser(data);
    } else if (isError && !user) {
      clearUser();
    }
  }, [data, isError, setUser, clearUser, user]);

  return {
    user,
    isAuthenticated,
    // Return false for loading when skipping API
    isLoading: SKIP_API_AUTH_CHECK ? false : isLoading || !isHydrated,
    refetch,
  };
};
