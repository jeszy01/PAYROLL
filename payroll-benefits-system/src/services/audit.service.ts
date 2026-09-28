import { apiClient } from './apiClient';

export interface AuditLogEntry {
  id: number;
  userName: string | null;
  userRole: string | null;
  action: string;
  module: string;
  description: string;
  ipAddress: string | null;
  createdAt: string | null;
}

export interface AuditLogPage {
  data: AuditLogEntry[];
  meta: { page: number; lastPage: number; total: number };
}

export interface AuditLogFilters {
  module?: string;
  action?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export const auditService = {
  list: (f: AuditLogFilters = {}) => {
    const params = new URLSearchParams();
    if (f.module) params.set('module', f.module);
    if (f.action) params.set('action', f.action);
    if (f.from) params.set('from', f.from);
    if (f.to) params.set('to', f.to);
    if (f.search) params.set('search', f.search);
    if (f.page) params.set('page', String(f.page));
    params.set('per_page', String(f.perPage ?? 25));
    return apiClient.get<AuditLogPage>(`/audit-logs?${params.toString()}`);
  },
};