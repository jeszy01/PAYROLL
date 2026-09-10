import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, LogIn, LogOut } from 'lucide-react';
import { EmployeeLayout } from '../../components/layout/EmployeeLayout';
import { EmptyState } from '../../components/common/EmptyState';
import { DataTable, type Column } from '../../components/common/DataTable';
import { useApiResource } from '../../hooks/useApiResource';
import { attendanceService } from '../../services/attendance.service';
import type { AttendanceRecord, ClockInStatus, ClockOutStatus } from '../../types';
import { formatDate, formatMinutesDuration, formatTimeOfDay } from '../../utils/format';

const IN_STATUS_LABEL: Record<ClockInStatus, string> = { on_time: 'On Time', late: 'Late' };
const OUT_STATUS_LABEL: Record<ClockOutStatus, string> = { on_time: 'On Time', overtime: 'Overtime' };
const HOLIDAY_LABEL = { regular: 'Regular Holiday', special_non_working: 'Special Non-Working Day' };

function StatusPill({ tone, children }: { tone: 'good' | 'warn'; children: React.ReactNode }) {
  const cls = tone === 'good' ? 'bg-good-100 text-good-600' : 'bg-warn-100 text-warn-600';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>;
}

function workedHours(record: AttendanceRecord): string {
  if (!record.timestampIn || !record.timestampOut) return '—';
  const minutes = Math.max(
    0,
    Math.round((new Date(record.timestampOut).getTime() - new Date(record.timestampIn).getTime()) / 60000)
  );
  return formatMinutesDuration(minutes);
}

export function EmployeeAttendance() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: today, loading, error, refetch } = useApiResource(() => attendanceService.getToday(), []);
  const { data: history, refetch: refetchHistory } = useApiResource(() => attendanceService.getHistory(), []);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleClockIn() {
    setBusy(true);
    setActionError(null);
    try {
      await attendanceService.clockIn();
      refetch();
      refetchHistory();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not clock in.');
    } finally {
      setBusy(false);
    }
  }

  async function handleClockOut() {
    setBusy(true);
    setActionError(null);
    try {
      await attendanceService.clockOut();
      refetch();
      refetchHistory();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not clock out.');
    } finally {
      setBusy(false);
    }
  }

  const record = today?.record ?? null;
  const canClockIn = !loading && !error && !record?.timestampIn;
  const canClockOut = !loading && !error && !!record?.timestampIn && !record?.timestampOut;

  const historyColumns: Column<AttendanceRecord>[] = [
    { header: 'Date', render: (r) => formatDate(r.date) },
    { header: 'Time In', render: (r) => (r.timestampIn ? formatTimeOfDay(r.timestampIn) : '—') },
    { header: 'Time Out', render: (r) => (r.timestampOut ? formatTimeOfDay(r.timestampOut) : '—') },
    {
      header: 'Status',
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {r.statusIn && <StatusPill tone={r.statusIn === 'on_time' ? 'good' : 'warn'}>{IN_STATUS_LABEL[r.statusIn]}</StatusPill>}
          {r.statusOut && <StatusPill tone={r.statusOut === 'on_time' ? 'good' : 'warn'}>{OUT_STATUS_LABEL[r.statusOut]}</StatusPill>}
        </div>
      ),
    },
    { header: 'Hours', render: (r) => workedHours(r) },
  ];

  return (
    <EmployeeLayout title="Attendance" subtitle="Time in and out for today">
      <div className="space-y-6">
        {today?.holiday && (
          <div className="flex items-center gap-3 rounded-xl border border-warn-100 bg-warn-100/40 px-5 py-4">
            <AlertTriangle size={20} className="shrink-0 text-warn-600" />
            <p className="text-sm font-semibold text-ink-900">
              Today is a {HOLIDAY_LABEL[today.holiday.type]}
              <span className="ml-1 font-normal text-ink-500">— {today.holiday.name}</span>
            </p>
          </div>
        )}

        <div className="rounded-xl border border-line bg-surface p-8 text-center shadow-sm">
          <p className="text-5xl font-bold tabular-nums text-ink-900">
            {new Intl.DateTimeFormat('en-PH', {
              timeZone: 'Asia/Manila',
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            }).format(now)}
          </p>
          <p className="mt-2 text-sm text-ink-500">
            {new Intl.DateTimeFormat('en-PH', {
              timeZone: 'Asia/Manila',
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(now)}{' '}
            · Asia/Manila
          </p>

          {loading && <p className="mt-6 text-sm text-ink-500">Loading today's status…</p>}
          {!loading && error && <p className="mt-6 text-sm text-bad-600">{error}</p>}
          {!loading && !error && (
            <div className="mt-6 flex justify-center gap-3">
              {canClockIn && (
                <button
                  onClick={handleClockIn}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                >
                  <LogIn size={16} /> {busy ? 'Recording…' : 'Time In'}
                </button>
              )}
              {canClockOut && (
                <button
                  onClick={handleClockOut}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-lg bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-50"
                >
                  <LogOut size={16} /> {busy ? 'Recording…' : 'Time Out'}
                </button>
              )}
              {!canClockIn && !canClockOut && record?.timestampOut && (
                <p className="text-sm font-medium text-ink-500">You've completed attendance for today.</p>
              )}
            </div>
          )}
          {actionError && <p className="mt-3 text-sm text-bad-600">{actionError}</p>}
        </div>

        {record && (
          <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-ink-900">Today's Summary</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Time In</p>
                <p className="mt-1 text-lg font-bold text-ink-900">
                  {record.timestampIn ? formatTimeOfDay(record.timestampIn) : '—'}
                </p>
                {record.statusIn && (
                  <div className="mt-1">
                    <StatusPill tone={record.statusIn === 'on_time' ? 'good' : 'warn'}>
                      {IN_STATUS_LABEL[record.statusIn]}
                      {record.statusIn === 'late' && ` · ${record.minutesLate}m late`}
                    </StatusPill>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Time Out</p>
                <p className="mt-1 text-lg font-bold text-ink-900">
                  {record.timestampOut ? formatTimeOfDay(record.timestampOut) : '—'}
                </p>
                {record.statusOut && (
                  <div className="mt-1">
                    <StatusPill tone={record.statusOut === 'on_time' ? 'good' : 'warn'}>
                      {OUT_STATUS_LABEL[record.statusOut]}
                      {record.statusOut === 'overtime' && ` · ${record.overtimeMinutes}m`}
                    </StatusPill>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Hours Rendered</p>
                <p className="mt-1 text-lg font-bold text-ink-900">{workedHours(record)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Holiday</p>
                <p className="mt-1 text-lg font-bold text-ink-900">
                  {record.holidayType ? HOLIDAY_LABEL[record.holidayType] : '—'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Attendance History</h3>
          {!history || history.length === 0 ? (
            <EmptyState icon={Clock} title="No attendance history yet" description="Your past time in/out records will show up here." />
          ) : (
            <DataTable columns={historyColumns} rows={history} rowKey={(r) => r.id} />
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}
