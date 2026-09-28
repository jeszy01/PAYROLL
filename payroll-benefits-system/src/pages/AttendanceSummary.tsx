import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState, ErrorState } from '../components/common/LoadError';
import { useApiResource } from '../hooks/useApiResource';
import { payrollService } from '../services/payroll.service';
import { attendanceService } from '../services/attendance.service';
import type { PayrollRun, AttendanceSummary } from '../types';
import { formatDate } from '../utils/format';
import { Layout } from '../components/layout/Layout';

function RunPicker({ runs, onPick }: { runs: PayrollRun[]; onPick: (id: string) => void }) {
  if (runs.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No draft payroll runs"
        description="Start a new payroll run from Payroll Management first."
      />
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {runs.map((r) => (
        <button
          key={r.id}
          onClick={() => onPick(r.id)}
          className="rounded-xl border border-line bg-surface p-4 text-left shadow-sm transition hover:border-teal-500"
        >
          <p className="font-semibold text-ink-900">{r.cutoffLabel}</p>
          <p className="mt-1 text-xs text-ink-500">
            {formatDate(r.payPeriodStart)} – {formatDate(r.payPeriodEnd)}
          </p>
        </button>
      ))}
    </div>
  );
}

type EditableField = 'daysPresent' | 'lateMinutes' | 'overtimeHours' | 'unpaidAbsenceDays';

const COLUMNS: { key: EditableField; label: string }[] = [
  { key: 'daysPresent', label: 'Days Present' },
  { key: 'unpaidAbsenceDays', label: 'Absences' },
  { key: 'lateMinutes', label: 'Late (min)' },
  { key: 'overtimeHours', label: 'Overtime (hrs)' },
];

function SummaryTable({ run }: { run: PayrollRun }) {
  const { data, loading, error, refetch } = useApiResource<AttendanceSummary[]>(
    () => attendanceService.getSummary(run.id),
    [run.id]
  );
  const [draft, setDraft] = useState<Record<string, Partial<Record<EditableField, number>>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  function field(row: AttendanceSummary, key: EditableField): number {
    return draft[row.employeeId]?.[key] ?? row[key] ?? 0;
  }

  function setField(employeeId: string, key: EditableField, value: number) {
    setDraft((d) => ({ ...d, [employeeId]: { ...d[employeeId], [key]: value } }));
  }

 async function saveRow(row: AttendanceSummary) {
  setSaving(row.employeeId);
  setRowError((e) => ({ ...e, [row.employeeId]: '' }));
  try {
    await attendanceService.saveEntry(run.id, {
      employeeId: row.employeeId,
      daysPresent: field(row, 'daysPresent'),
      unpaidAbsenceDays: field(row, 'unpaidAbsenceDays'),
      lateMinutes: field(row, 'lateMinutes'),
      overtimeHours: field(row, 'overtimeHours'),
      cashAdvance: 0,
      slCashConversion: 0,
    });
    refetch();
  } catch (err) {
    setRowError((e) => ({
      ...e,
      [row.employeeId]: err instanceof Error ? err.message : 'Could not save this entry.',
    }));
  } finally {
    setSaving(null);
  }
}

  if (loading) return <LoadingState label="Loading attendance summary…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No active employees"
        description="Add active employees in the Employees module first."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-clay-100/30 p-4 text-sm text-ink-900">
        Manual entry (simulates Workforce Management sync). Each row is final once saved — it cannot be edited or
        deleted afterward.
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-sm">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-sand-50/70">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Employee</th>
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-500">
                  {c.label}
                </th>
              ))}
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const locked = row.isLocked;
              return (
                <tr key={row.employeeId} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5 font-medium text-ink-900">{row.employeeName}</td>
                  {COLUMNS.map((c) => (
                    <td key={c.key} className="px-2 py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        value={field(row, c.key)}
                        disabled={locked}
                        onChange={(e) => setField(row.employeeId, c.key, Number(e.target.value))}
                        className="w-20 rounded-md border border-line px-2 py-1 text-center text-sm outline-none focus:border-teal-500 disabled:bg-sand-50 disabled:text-ink-500"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center align-top">
                    {!locked && (
                      <button
                        onClick={() => saveRow(row)}
                        disabled={saving === row.employeeId}
                        className="rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800 disabled:opacity-50"
                      >
                        {saving === row.employeeId ? 'Saving…' : 'Save & lock'}
                      </button>
                    )}
                    {rowError[row.employeeId] && (
                      <p className="mt-1 max-w-[10rem] text-[11px] text-bad-600">{rowError[row.employeeId]}</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AttendanceSummaryPage() {
  const { data: runs, loading, error, refetch } = useApiResource<PayrollRun[]>(() => payrollService.listRuns(), []);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const draftRuns = (runs ?? []).filter((r) => r.status === 'draft' && !r.isArchived);
  const selectedRun = runs?.find((r) => r.id === selectedRunId) ?? null;

  return (
    <div className="min-h-screen bg-sand-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink-900">Attendance Summary</h1>
          <p className="mt-1 text-sm text-ink-500">Enter attendance totals per cutoff. Each row locks once saved.</p>
        </div>

        {selectedRun ? (
          <div className="space-y-4">
            <button onClick={() => setSelectedRunId(null)} className="text-sm font-semibold text-teal-700 hover:underline">
              ← Back to payroll runs
            </button>
            <h3 className="mt-1 text-lg font-bold text-ink-900">{selectedRun.cutoffLabel}</h3>
            <p className="text-sm text-ink-500">
              {formatDate(selectedRun.payPeriodStart)} – {formatDate(selectedRun.payPeriodEnd)}
            </p>
            <SummaryTable run={selectedRun} />
          </div>
        ) : (
          <>
            {loading && <LoadingState label="Loading payroll runs…" />}
            {!loading && error && <ErrorState message={error} onRetry={refetch} />}
            {!loading && !error && <RunPicker runs={draftRuns} onPick={setSelectedRunId} />}
          </>
        )}
      </div>
    </div>
  );
}