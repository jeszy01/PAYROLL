import { apiClient, AUTH_TOKEN_KEY } from './apiClient';
import type { CurrentUser } from '../hooks/useCurrentUser';

interface LoginResponse {
  token: string;
  user: CurrentUser;
}

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/login', { email, password }),

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },

  saveToken: (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  hasToken: () => Boolean(localStorage.getItem(AUTH_TOKEN_KEY)),
};