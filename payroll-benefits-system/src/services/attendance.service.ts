import { apiClient } from './apiClient';
import type { AttendanceSummary } from '../types';

export const attendanceService = {
  getSummary: (payrollRunId: string) =>
    apiClient.get<AttendanceSummary[]>(`/payroll/runs/${payrollRunId}/attendance-summary`),

  saveEntry: (
    payrollRunId: string,
    entry: {
      employeeId: string;
      daysPresent: number;
      lateMinutes: number;
      overtimeHours: number;
      unpaidAbsenceDays: number;
      cashAdvance: number;
      slCashConversion: number;
    }
  ) => apiClient.post<AttendanceSummary>(`/payroll/runs/${payrollRunId}/attendance-summary`, entry),
};