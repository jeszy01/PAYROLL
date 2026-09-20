import { apiClient } from './apiClient';
import type { AttendanceRecord, TodayAttendance } from '../types';

export const attendanceService = {
  getToday: () => apiClient.get<TodayAttendance>('/me/attendance/today'),
  clockIn: () => apiClient.post<AttendanceRecord>('/me/attendance/clock-in'),
  clockOut: () => apiClient.post<AttendanceRecord>('/me/attendance/clock-out'),
  getHistory: () => apiClient.get<AttendanceRecord[]>('/me/attendance/history'),
};
