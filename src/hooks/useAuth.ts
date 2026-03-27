import { useQuery } from '@tanstack/react-query';
import { authService } from '@/features/auth/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';

// Set to true to skip API auth check (for dev without backend)
const SKIP_API_AUTH_CHECK = false

export const useAuth = () => {
  const { setUser, clearUser, user, isAuthenticated } = useAuthStore();

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

  useEffect(() => {
    if (SKIP_API_AUTH_CHECK) {
      return;
    }
    // Sync fresh query data → store
    if (data) {
      setUser(data);
      return;
    }
    // If query error and data exists, token expired → clear store
    if (isError && user && data === undefined) {
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
