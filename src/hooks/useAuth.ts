import { useQuery } from '@tanstack/react-query';
import { authService } from '@/features/auth/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect, useRef } from 'react';

// Set to true to skip API auth check (for dev without backend)
const SKIP_API_AUTH_CHECK = false

export const useAuth = () => {
  const { setUser, clearUser, user, isAuthenticated } = useAuthStore();
  // Track whether user existed in store at the time the query was enabled
  const userAtQueryStart = useRef(user);

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
    // Only skip if user already in store (persist from localStorage)
    enabled: !SKIP_API_AUTH_CHECK && !user,
  });

  // Keep ref updated whenever the query is re-enabled (user becomes null)
  useEffect(() => {
    if (!user) {
      userAtQueryStart.current = null;
    }
  }, [user]);

  useEffect(() => {
    if (SKIP_API_AUTH_CHECK) {
      return;
    }
    // Sync fresh query data → store
    if (data) {
      setUser(data);
      return;
    }
    // Only clear store if the user was already in the store before this query ran.
    // If user is null (pre-hydration race), do NOT clear — it would wipe a valid session.
    if (isError && user && userAtQueryStart.current !== null) {
      clearUser();
    }
  }, [data, isError, setUser, clearUser, user]);

  return {
    user,
    isAuthenticated,
    // Return false for loading when skipping API or user already in store
    isLoading: SKIP_API_AUTH_CHECK || !!user ? false : isLoading,
    refetch,
  };
};
