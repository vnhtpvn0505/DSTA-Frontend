import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** True once the persist middleware has finished rehydrating from localStorage */
  _hasHydrated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  _setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
      _setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : undefined as never
      ),
      // Only persist user data, not internal flags
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    }
  )
);
