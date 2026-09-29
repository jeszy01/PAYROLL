import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { LoadingState } from '../components/common/LoadError';
import { useApiResource } from '../hooks/useApiResource';
import { apiClient } from '../services/apiClient';
import { attendanceService, type AttendanceDemoDay } from '../services/attendance.service';
import { formatCurrency, formatMinutesDuration } from '../utils/format';

interface EmployeeOption {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

const PRESETS = [
  { label: 'Normal', timeIn: '08:00', timeOut: '17:00' },
  { label: 'Late 30 min', timeIn: '08:30', timeOut: '17:00' },
  { label: 'Late 1h10', timeIn: '09:10', timeOut: '17:00' },
  { label: 'Overtime', timeIn: '08:00', timeOut: '19:00' },
  { label: 'Late + OT', timeIn: '08:30', timeOut: '19:00' },
  { label: 'Undertime', timeIn: '08:00', timeOut: '16:00' },
];

const today = () => new Date().toISOString().slice(0, 10);

export function AttendanceDemo() {
  const { data: employees, loading } = useApiResource<EmployeeOption[]>(
    () => apiClient.get<EmployeeOption[]>('/employees'),
    []
  );
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(today());
  const [timeIn, setTimeIn] = useState('08:00');
  const [timeOut, setTimeOut] = useState('17:00');
  const [result, setResult] = useState<AttendanceDemoDay | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = employeeId !== '' && date !== '';

  async function run(action: () => Promise<AttendanceDemoDay | { ok: boolean }>, clear = false) {
    setBusy(true);
    setError(null);
    try {
      const res = await action();
      setResult(clear ? null : (res as AttendanceDemoDay));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  const nameOf = (e: EmployeeOption) => e.fullName ?? `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim();

  const inputCls = 'w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-teal-500';
  const btn = 'rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50';

  return (
    <Layout title="Attendance (Demo)" subtitle="Simulated Time In / Time Out. Computation is done by the backend.">
      {loading && <LoadingState label="Loading employees…" />}
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-line bg-surface p-5">
            <label className="block text-sm font-medium text-ink-900">
              Employee
              <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={`${inputCls} mt-1`}>
                <option value="">Select an employee…</option>
                {(employees ?? []).map((e) => (
                  <option key={e.id} value={e.id}>{nameOf(e)}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-ink-900">
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} mt-1`} />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-ink-900">
                Time In
                <input type="time" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} className={`${inputCls} mt-1`} />
              </label>
              <label className="block text-sm font-medium text-ink-900">
                Time Out
                <input type="time" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} className={`${inputCls} mt-1`} />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => { setTimeIn(p.timeIn); setTimeOut(p.timeOut); }}
                  className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink-500 hover:bg-sand-100"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {error && <p className="text-sm text-bad-600">{error}</p>}

            <div className="flex flex-wrap gap-2 pt-2">
              <button disabled={!ready || busy} className={`${btn} bg-navy-900 text-white hover:bg-navy-800`}
                onClick={() => run(() => attendanceService.saveDemoDay({ employeeId, date, timeIn, timeOut }))}>
                Save
              </button>
              <button disabled={!ready || busy} className={`${btn} border border-line text-ink-900 hover:bg-sand-100`}
                onClick={() => run(() => attendanceService.markDemoAbsent({ employeeId, date }))}>
                Mark Absent
              </button>
              <button disabled={!ready || busy} className={`${btn} text-ink-500 hover:bg-sand-100`}
                onClick={() => run(() => attendanceService.resetDemoDay({ employeeId, date }), true)}>
                Reset Day
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="text-sm font-semibold text-ink-900">Result for the day</p>
            {!result && <p className="mt-2 text-sm text-ink-500">Save a Time In / Time Out to see the computation.</p>}
            {result && (
              <dl className="mt-3 space-y-2 text-sm">
                {[
                  ['Status', result.status === 'absent' ? 'Absent' : 'Present'],
                  ['Worked', formatMinutesDuration(result.workedMinutes)],
                  ['Late', formatMinutesDuration(result.lateMinutes)],
                  ['Undertime', formatMinutesDuration(result.undertimeMinutes)],
                  ['Overtime (hrs)', String(result.overtimeHours)],
                  ['Regular pay', formatCurrency(result.regularPay)],
                  ['OT pay', formatCurrency(result.otPay)],
                  ['Late deduction', formatCurrency(result.lateDeduction)],
                  ['Undertime deduction', formatCurrency(result.undertimeDeduction)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-line pb-1">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="font-medium text-ink-900">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between pt-1 text-base font-bold text-ink-900">
                  <dt>Net pay</dt>
                  <dd>{formatCurrency(result.netPay)}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}