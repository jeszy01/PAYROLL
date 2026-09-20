import { apiClient } from './apiClient';

export interface EssTwoFactorStatus {
  verified: boolean;
}

// Step-up 2FA gate for the Employee Self-Service area — see EssTwoFactorGate.
export const essTwoFactorService = {
  status: () => apiClient.get<EssTwoFactorStatus>('/me/2fa/status'),
  send: () => apiClient.post<{ message: string; expiresInMinutes: number }>('/me/2fa/send'),
  verify: (code: string) => apiClient.post<{ verified: boolean }>('/me/2fa/verify', { code }),
};
