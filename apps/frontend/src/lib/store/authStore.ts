import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'AUDITOR' | 'MANUFACTURER' | 'REGULATOR' | 'USER';
  organizationId?: string;
  organizationName?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setAuth: (user: AuthUser, token: string) => {
        // Also store in localStorage for middleware access
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
          // Write cookie for Next.js server-side middleware routing
          document.cookie = `auth-token=${token}; path=/; max-age=604800; SameSite=Lax`;
        }
        set({ user, token, isLoading: false });
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          // Clear cookie
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        set({ user: null, token: null, isLoading: false });
      },
      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'battery-passport-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
