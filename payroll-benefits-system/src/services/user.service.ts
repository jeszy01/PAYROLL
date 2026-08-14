import { apiClient } from './apiClient';
import type { SystemUser } from '../types';

export const userService = {
  list: () => apiClient.get<SystemUser[]>('/users'),
  create: (payload: { name: string; email: string; password: string; role: string }) =>
    apiClient.post<SystemUser>('/users', payload),
  update: (id: string, payload: Partial<{ name: string; email: string; role: string; password: string }>) =>
    apiClient.patch<SystemUser>(`/users/${id}`, payload),
  remove: (id: string) => apiClient.delete<void>(`/users/${id}`),
};
