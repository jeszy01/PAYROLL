import { apiClient } from './apiClient';
import type { CurrentUser } from '../hooks/useCurrentUser';

const TOKEN_KEY = 'pbms_auth_token';

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
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  saveToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  hasToken: () => Boolean(localStorage.getItem(TOKEN_KEY)),
};