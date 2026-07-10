'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { login as apiLogin, logout as apiLogout } from '@/lib/api/auth';

export function useAuth() {
  const router = useRouter();
  const { user, token, setAuth, clearAuth, isLoading } = useAuthStore();

  const isAuthenticated = !!token && !!user;

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin(email, password);
      setAuth(response.user, response.token);
      return response;
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      clearAuth();
      router.replace('/login');
    }
  }, [clearAuth, router]);

  const hasRole = useCallback(
    (...roles: string[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const canApprove = hasRole('ADMIN', 'MANAGER', 'REGULATOR');
  const canPublish = hasRole('ADMIN', 'REGULATOR');
  const canCreate = hasRole('ADMIN', 'MANAGER', 'MANUFACTURER');
  const canViewAudit = hasRole('ADMIN', 'AUDITOR', 'REGULATOR');

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    canApprove,
    canPublish,
    canCreate,
    canViewAudit,
  };
}
