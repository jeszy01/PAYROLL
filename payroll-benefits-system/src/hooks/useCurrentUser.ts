import { useApiResource } from './useApiResource';
import { apiClient } from '../services/apiClient';

export interface CurrentUser {
  id: string;
  fullName: string;
  role: string;
}

export function useCurrentUser() {
  return useApiResource<CurrentUser>(() => apiClient.get<CurrentUser>('/auth/me'), []);
}
