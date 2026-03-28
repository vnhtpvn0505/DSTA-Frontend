import { useQuery } from '@tanstack/react-query';
import { authService } from '@/features/auth/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, _hasHydrated, setUser } = useAuthStore();

  // Fire getMe ONLY after Zustand has hydrated AND there is no user in store.
  // This covers the case where a valid session cookie exists but localStorage was cleared.
  const enabled = _hasHydrated && !user;

  const {
    data,
    isLoading: queryLoading,
    refetch,
  } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled,
  });

  // On success: sync server user into store
  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  // NOTE: we do NOT call clearUser() on query error here.
  // Rationale: expired/invalid sessions are detected by the Axios 401 interceptor
  // on real API calls, which clears the store and redirects. Clearing on getMe
  // error here creates race conditions with in-flight requests after login.

  return {
    user,
    isAuthenticated,
    // Loading while: (1) Zustand rehydrating from localStorage, OR
    //                (2) actively checking session via API (no user in store yet)
    isLoading: !_hasHydrated || (enabled && queryLoading),
    refetch,
  };
};

