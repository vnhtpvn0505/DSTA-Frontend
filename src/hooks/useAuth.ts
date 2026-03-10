import { useQuery } from '@tanstack/react-query';
import { authService } from '@/features/auth/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';

// Set to true to skip API calls (for development/testing without backend)
const SKIP_API_AUTH_CHECK = true;

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
    enabled: !SKIP_API_AUTH_CHECK,
  });

  useEffect(() => {
    if (SKIP_API_AUTH_CHECK) {
      // When skipping API, rely on stored user from login
      // User will be set manually in LoginForm/RegisterForm
      return;
    }

    if (data) {
      setUser(data);
    } else if (isError) {
      clearUser();
    }
  }, [data, isError, setUser, clearUser]);

  return {
    user,
    isAuthenticated,
    // Return false for loading when skipping API
    isLoading: SKIP_API_AUTH_CHECK ? false : isLoading,
    refetch,
  };
};
