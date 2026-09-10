import { useApiResource } from './useApiResource';
import { apiClient } from '../services/apiClient';
import type { UserRole } from '../types';

export interface CurrentUser {
  id: string;
  fullName: string;
  role: UserRole;
}

export function useCurrentUser() {
  return useApiResource<CurrentUser>(() => apiClient.get<CurrentUser>('/auth/me'), []);
}
