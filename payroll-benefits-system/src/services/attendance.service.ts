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
   