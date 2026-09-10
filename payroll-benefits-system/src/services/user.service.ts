import { apiClient } from './apiClient';
import type { Role, SystemUser } from '../types';

export const userService = {
  list: () => apiClient.get<SystemUser[]>('/users'),
  create: (payload: { name: string; email: string; password: string; role: Role; employeeId?: string | null }) =>
    apiClient.post<SystemUser>('/users', payload),
  update: (
    id: string,
    payload: Partial<{ name: string; email: string; role: Role; password: string; employeeId: string | null }>
  ) => apiClient.patch<SystemUser>(`/users/${id}`, payload),
  remove: (id: string) => apiClient.delete<void>(`/users/${id}`),
};
