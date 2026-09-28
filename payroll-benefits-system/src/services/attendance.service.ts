import { apiClient } from './apiClient';
import type { AttendanceSummaryRow } from '../types';

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
  getSummary: (start: string, end: string) =>
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