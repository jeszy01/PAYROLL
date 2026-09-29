import { apiClient } from './apiClient';
import type { PayrollRun, Payslip, PayrollReviewRow } from '../types';

export const payrollService = {
  listRuns: (includeArchived = false) =>
    apiClient.get<PayrollRun[]>(`/payroll/runs${includeArchived ? '?includeArchived=1' : ''}`),
  getRun: (id: string) => apiClient.get<PayrollRun>(`/payroll/runs/${id}`),

  // BAGO: cutoff id + pay date na lang
  createRun: (payload: { attendanceCutoffId: string; payDate: string }) =>
    apiClient.post<PayrollRun>('/payroll/runs', payload),

  approveRun: (id: string) => apiClient.post<PayrollRun>(`/payroll/runs/${id}/approve`),
  releaseRun: (id: string) =>
    apiClient.post<PayrollRun & { emailSummary: { emailed: number; failed: number } }>(
      `/payroll/runs/${id}/release`
    ),
  archiveRun: (id: string) => apiClient.post<PayrollRun>(`/payroll/runs/${id}/archive`),
  unarchiveRun: (id: string) => apiClient.post<PayrollRun>(`/payroll/runs/${id}/unarchive`),
  deleteRun: (id: string) => apiClient.delete<void>(`/payroll/runs/${id}`),
  computeRun: (payrollRunId: string) => apiClient.post<PayrollRun>(`/payroll/runs/${payrollRunId}/compute`),

  // BAGO: para sa Review step
  getReview: (runId: string) =>
    apiClient.get<PayrollReviewRow[]>(`/payroll/runs/${runId}/review`),
  saveReviewAdjustment: (runId: string, payload: { employeeId: string; slCashConversion: number }) =>
    apiClient.post<PayrollReviewRow>(`/payroll/runs/${runId}/review/adjustments`, payload),

  listPayslips: (payrollRunId: string) =>
    apiClient.get<Payslip[]>(`/payroll/runs/${payrollRunId}/payslips`),
  getPayslip: (id: string) => apiClient.get<Payslip>(`/payroll/payslips/${id}`),
  listMyPayslips: () => apiClient.get<Payslip[]>('/me/payslips'),
  sendPayslip: (id: string, channel: 'email' | 'sms') =>
    apiClient.post<{ payslipId: string; status: 'sent' | 'failed'; message: string }>(
      `/payroll/payslips/${id}/send`,
      { channel }
    ),
  sendPayslipsBulk: (payrollRunId: string, payslipIds: string[], channel: 'email' | 'sms') =>
    apiClient.post<{ sent: number; failed: number; results: { payslipId: string; status: string; message: string }[] }>(
      `/payroll/runs/${payrollRunId}/payslips/send-bulk`,
      { payslipIds, channel }
    ),
};