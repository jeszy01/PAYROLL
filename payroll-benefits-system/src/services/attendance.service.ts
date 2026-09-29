import { apiClient } from './apiClient';
import type { AttendanceSummary, AttendanceSummaryRow } from '../types';

export interface AttendanceDayRow {
  employeeId: string;
  employeeName: string;
  isLocked: boolean;
  status: 'present' | 'absent';
  minutesLate: number;
  overtimeMinutes: number;
}

export interface AttendanceRecordRow {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  date: string;
  status: 'present' | 'absent';
  minutesLate: number;
  overtimeMinutes: number;
}

export interface AttendanceCutoff {
  id: string;
  label: string;
  periodStart: string;
  periodEnd: string;
  isLocked: boolean;
  entryCount: number | null;
  payrollRunId?: string | null;
}

export interface AttendanceCutoffEntry {
  employeeId: string;
  employeeName: string;
  daysPresent: number;
  unpaidAbsenceDays: number;
  lateMinutes: number;
  overtimeHours: number;
}

export interface AttendanceDemoDay {
  employeeId: string;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  status: 'present' | 'absent';
  workedMinutes: number;
  lateMinutes: number;
  undertimeMinutes: number;
  overtimeHours: number;
  regularPay: number;
  otPay: number;
  lateDeduction: number;
  undertimeDeduction: number;
  netPay: number;
}

export interface AttendanceCutoffDetail extends AttendanceCutoff {
  entries: AttendanceCutoffEntry[];
}

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
    getPeriodSummary: (start: string, end: string) =>
    apiClient.get<AttendanceSummaryRow[]>(`/attendance/summary?start=${start}&end=${end}`),
  getDay: (date: string) =>
    apiClient.get<{ date: string; rows: AttendanceDayRow[] }>(`/attendance/day?date=${date}`),
  saveDay: (payload: {
    date: string;
    entries: { employeeId: string; status: 'present' | 'absent'; minutesLate: number; overtimeMinutes: number }[];
  }) => apiClient.post<{ created: number; skipped: number }>('/attendance/day', payload),
  getRecords: (start: string, end: string) =>
    apiClient.get<AttendanceRecordRow[]>(`/attendance/records?start=${start}&end=${end}`),

    listCutoffs: () => apiClient.get<AttendanceCutoff[]>('/attendance/cutoffs'),
  getCutoff: (id: string) => apiClient.get<AttendanceCutoffDetail>(`/attendance/cutoffs/${id}`),
  getCutoffTemplate: (periodStart: string, periodEnd: string) =>
    apiClient.get<AttendanceCutoffEntry[]>(
      `/attendance/cutoffs/template?periodStart=${periodStart}&periodEnd=${periodEnd}`
    ),
      saveDemoDay: (p: { employeeId: string; date: string; timeIn: string; timeOut: string }) =>
    apiClient.post<AttendanceDemoDay>('/attendance/demo/day', p),
  markDemoAbsent: (p: { employeeId: string; date: string }) =>
    apiClient.post<AttendanceDemoDay>('/attendance/demo/absent', p),
  resetDemoDay: (p: { employeeId: string; date: string }) =>
    apiClient.post<{ ok: boolean }>('/attendance/demo/reset', p),
  saveCutoff: (payload: {
    label: string;
    periodStart: string;
    periodEnd: string;
    entries: AttendanceCutoffEntry[];
  }) => apiClient.post<AttendanceCutoffDetail>('/attendance/cutoffs', payload),
};

   export interface AttendanceDayRow {
     employeeId: string;
     employeeName: string;
     isLocked: boolean;
     status: 'present' | 'absent';
     minutesLate: number;
     overtimeMinutes: number;
   }

   export interface AttendanceRecordRow {
     id: string;
     employeeId: string;
     employeeNumber: string;
     employeeName: string;
     date: string;
     status: 'present' | 'absent';
     minutesLate: number;
     overtimeMinutes: number;
   }
   