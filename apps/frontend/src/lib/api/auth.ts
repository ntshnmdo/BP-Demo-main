import apiClient from './client';
import { AuthUser } from '@/lib/store/authStore';

export interface LoginResponse {
  user: AuthUser;
  token: string;
  expiresIn: number;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
  role?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  // Try real API first, fall back to demo credentials
  try {
    const { data } = await apiClient.post<any>('/api/auth/login', {
      email,
      password,
    });
    // NestJS response interceptor wraps responses in { data, message }
    const responseData = data.data || data;
    return {
      user: {
        id: responseData.user.id,
        name: responseData.user.name,
        email: responseData.user.email,
        role: responseData.user.role,
        organizationName: responseData.user.organization,
      },
      token: responseData.accessToken || responseData.token,
      expiresIn: 86400,
    };
  } catch (error) {
    if (error instanceof Error && error.message !== 'Network Error') {
      throw error;
    }
    // Demo mode fallback
    if (email === 'admin@batterypassport.eu' && password === 'Password123!') {
      return {
        user: {
          id: 'demo-user-001',
          name: 'Admin User',
          email: 'admin@batterypassport.eu',
          role: 'ADMIN',
          organizationId: 'org-001',
          organizationName: 'Demo Organization',
        },
        token: 'demo-jwt-token-' + Date.now(),
        expiresIn: 86400,
      };
    }
    throw new Error('Invalid email or password.');
  }
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/api/auth/me');
  return data;
}

export async function register(registerData: RegisterData): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/register', registerData);
  return data;
}

export async function refreshToken(): Promise<{ token: string }> {
  const { data } = await apiClient.post<{ token: string }>('/api/auth/refresh');
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/api/auth/logout');
  } catch {
    // Ignore errors on logout
  }
}
