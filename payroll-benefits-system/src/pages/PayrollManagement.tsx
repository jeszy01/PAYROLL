import { useState } from 'react';
import { Plus, Banknote, FileSpreadsheet, ClipboardList, Calculator, CheckCircle2, Send, Mail, MessageSquare, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { DataTable, type Column } from '../components/common/DataTable';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState, ErrorState } from '../components/common/LoadError';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { TextField } from '../components/common/FormField';
import { PayslipDocument } from '../components/payroll/PayslipDocument';
import { useApiResource } from '../hooks/useApiResource';
import { payrollService } from '../services/payroll.service';
import type { PayrollRun, Payslip, AttendanceSummary } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

function NewRunModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ payPeriodStart: '', payPeriodEnd: '', payDate: '', cutoffLabel: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await payrollService.createRun(form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the payroll run.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Start new payroll run" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField
          label="Cutoff label"
          placeholder="e.g. May 1–15, 2026"
          required
          value={form.cutoffLabel}
          onChange={(e) => setForm({ ...form, cutoffLabel: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Pay period start"
            type="date"
            required
            value={form.payPeriodStart}
            onChange={(e) => setForm({ ...form, payPeriodStart: e.target.value })}
          />
          <TextField
            label="Pay period end"
            type="date"
            required
            value={form.payPeriodEnd}
            onChange={(e) => setForm({ ...form, payPeriodEnd: e.target.value })}
          />
        </div>
        <TextField
          label="Pay date"
          type="date"
          required
          value={form.payDate}
          onChange={(e) => setForm({ ...form, payDate: e.target.value })}
        />
        {error && <p className="text-sm text-bad-600">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-ink-500 hover:bg-sand-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create run'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Attendance input step for a draft run. In a full HRIS this data would
 * come from a separate Time & Attendance / Workforce Management system —
 * here it's entered directly as a stand-in, since this subsystem only
 * needs the per-employee totals to compute payroll.
 */
function AttendancePanel({ run, onComputed }: { run: PayrollRun; onComputed: () => void }) {
  const { data, loading, error, refetch } = useApiResource<AttendanceSummary[]>(
    () => payrollService.listAttendance(run.id),
    [run.id]
  );
  const [rows, setRows] = useState<Record<string, AttendanceSummary>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  const [computeError, setComputeError] = useState<string | null>(null);

  const list = data ? data.map((r) => rows[r.employeeId] ?? r) : [];

  function updateField(row: AttendanceSummary, field: keyof AttendanceSummary, value: number) {
    setRows((prev) => ({ ...prev, [row.employeeId]: { ...row, ...prev[row.employeeId], [field]: value } }));
  }

  async function saveRow(row: AttendanceSummary) {
    setSavingId(row.employeeId);
    try {
      await payrollService.saveAttendance(run.id, {
        employeeId: row.employeeId,
        daysPresent: row.daysPresent,
        lateMinutes: row.lateMinutes,
        overtimeHours: row.overtimeHours,
        unpaidAbsenceDays: row.unpaidAbsenceDays,
      });
    } finally {
      setSavingId(null);
    }
  }

  async function handleCompute() {
    setComputing(true);
    setComputeError(null);
    try {
      await Promise.all(list.map((row) => saveRow(row)));
      await payrollService.computeRun(run.id);
      onComputed();
    } catch (err) {
      setComputeError(err instanceof Error ? err.message : 'Could not compute this payroll run.');
    } finally {
      setComputing(false);
    }
  }

  const columns: Column<AttendanceSummary>[] = [
    { header: 'Employee', render: (r) => <span className="font-medium">{r.employeeName}</span> },
    {
      header: 'Days present',
      render: (r) => (
        <input
          type="number"
          min={0}
          max={31}
          step={0.5}
          value={r.daysPresent}
          onChange={(e) => updateField(r, 'daysPresent', Number(e.target.value))}
          onBlur={() => saveRow(rows[r.employeeId] ?? r)}
          className="w-20 rounded-lg border border-navy-100 px-2 py-1 text-right text-sm outline-none focus:border-teal-500"
        />
      ),
      align: 'right',
    },
    {
      header: 'Late (min)',
      render: (r) => (
        <input
          type="number"
          min={0}
          value={r.lateMinutes}
          onChange={(e) => updateField(r, 'lateMinutes', Number(e.target.value))}
          onBlur={() => saveRow(rows[r.employeeId] ?? r)}
          className="w-20 rounded-lg border border-navy-100 px-2 py-1 text-right text-sm outline-none focus:border-teal-500"
        />
      ),
      align: 'right',
    },
    {
      header: 'Overtime (hrs)',
      render: (r) => (
        <input
          type="number"
          min={0}
          step={0.5}
          value={r.overtimeHours}
          onChange={(e) => updateField(r, 'overtimeHours', Number(e.target.value))}
          onBlur={() => saveRow(rows[r.employeeId] ?? r)}
          className="w-20 rounded-lg border border-navy-100 px-2 py-1 text-right text-sm outline-none focus:border-teal-500"
        />
      ),
      align: 'right',
    },
    {
      header: 'Unpaid absences',
      render: (r) => (
        <input
          type="number"
          min={0}
          max={31}
          step={0.5}
          value={r.unpaidAbsenceDays}
          onChange={(e) => updateField(r, 'unpaidAbsenceDays', Number(e.target.value))}
          onBlur={() => saveRow(rows[r.employeeId] ?? r)}
          className="w-24 rounded-lg border border-navy-100 px-2 py-1 text-right text-sm outline-none focus:border-teal-500"
        />
      ),
      align: 'right',
    },
    {
      header: '',
      render: (r) => (savingId === r.employeeId ? <span className="text-xs text-ink-300">Saving…</span> : null),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-navy-100 bg-teal-100/40 p-4 text-sm text-ink-900">
        <p className="font-semibold">Attendance summary for this cutoff</p>
        <p className="mt-1 text-ink-500">
          Enter each employee's totals for this pay period, then compute payroll. In a full system these
          numbers would sync in automatically from Time &amp; Attendance — here they're entered directly.
        </p>
      </div>

      {loading && <LoadingState label="Loading employees…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && list.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No active employees"
          description="Add active employees in the Employees module before computing this payroll run."
        />
      )}
      {!loading && !error && list.length > 0 && (
        <>
          <DataTable columns={columns} rows={list} rowKey={(r) => r.employeeId} />
          {computeError && <p className="text-sm text-bad-600">{computeError}</p>}
          <div className="flex justify-end">
            <button
              onClick={handleCompute}
              disabled={computing}
              className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-50"
            >
              <Calculator size={16} />
              {computing ? 'Computing…' : 'Compute payroll'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SendChannelMenu({
  onSend,
  disabled,
}: {
  onSend: (channel: 'email' | 'sms') => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-lg border border-navy-100 px-2.5 py-1.5 text-xs font-semibold text-ink-900 transition hover:bg-sand-100 disabled:opacity-50"
      >
        <Send size={13} />
        Send
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-lg border border-navy-100 bg-white shadow-lg">
          <button
            onClick={() => {
              onSend('email');
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-ink-900 hover:bg-sand-50"
          >
            <Mail size={13} /> Via Email
          </button>
          <button
            onClick={() => {
              onSend('sms');
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-ink-900 hover:bg-sand-50"
          >
            <MessageSquare size={13} /> Via SMS
          </button>
        </div>
      )}
    </div>
  );
}

function PayslipsPanel({ run, onRunUpdated }: { run: PayrollRun; onRunUpdated: () => void }) {
  const { data, loading, error, refetch } = useApiResource<Payslip[]>(
    () => payrollService.listPayslips(run.id),
    [run.id]
  );
  const [busy, setBusy] = useState(false);
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [sendNotice, setSendNotice] = useState<string | null>(null);

  const allSelected = !!data && data.length > 0 && selectedIds.size === data.length;

  function toggleAll() {
    if (!data) return;
    setSelectedIds(allSelected ? new Set() : new Set(data.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleApprove() {
    setBusy(true);
    try {
      await payrollService.approveRun(run.id);
      onRunUpdated();
    } finally {
      setBusy(false);
    }
  }

  async function handleRelease() {
    setBusy(true);
    try {
      await payrollService.releaseRun(run.id);
      onRunUpdated();
      refetch();
    } finally {
      setBusy(false);
    }
  }

  async function handleSendOne(payslip: Payslip, channel: 'email' | 'sms') {
    setSendingId(payslip.id);
    setSendNotice(null);
    try {
      const result = await payrollService.sendPayslip(payslip.id, channel);
      setSendNotice(result.message);
      refetch();
    } catch (err) {
      setSendNotice(err instanceof Error ? err.message : 'Could not send this payslip.');
    } finally {
      setSendingId(null);
    }
  }

  async function handleSendBulk(channel: 'email' | 'sms') {
    if (selectedIds.size === 0) return;
    setBulkSending(true);
    setSendNotice(null);
    try {
      const result = await payrollService.sendPayslipsBulk(run.id, Array.from(selectedIds), channel);
      setSendNotice(`Sent to ${result.sent} employee${result.sent === 1 ? '' : 's'}${result.failed ? `, ${result.failed} failed` : ''}.`);
      setSelectedIds(new Set());
      refetch();
    } catch (err) {
      setSendNotice(err instanceof Error ? err.message : 'Could not send the selected payslips.');
    } finally {
      setBulkSending(false);
    }
  }

  return (
    <div className="space-y-4">
      {loading && <LoadingState label="Loading payslips…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState
          icon={FileSpreadsheet}
          title="No payslips yet"
          description="Payslips will appear here once this payroll run has been computed."
        />
      )}
      {!loading && !error && data && data.length > 0 && (
        <>
          {sendNotice && (
            <div className="rounded-lg border border-navy-100 bg-teal-100/40 px-4 py-2.5 text-sm text-ink-900">
              {sendNotice}
            </div>
          )}

          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-navy-100 bg-sand-50 px-4 py-2.5">
              <span className="text-sm font-medium text-ink-900">{selectedIds.size} selected</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSendBulk('email')}
                  disabled={bulkSending}
                  className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-800 disabled:opacity-50"
                >
                  <Mail size={13} /> {bulkSending ? 'Sending…' : 'Send via Email'}
                </button>
                <button
                  onClick={() => handleSendBulk('sms')}
                  disabled={bulkSending}
                  className="flex items-center gap-1.5 rounded-lg border border-navy-100 px-3 py-1.5 text-xs font-semibold text-ink-900 transition hover:bg-sand-100 disabled:opacity-50"
                >
                  <MessageSquare size={13} /> {bulkSending ? 'Sending…' : 'Send via SMS'}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-sm">
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 bg-sand-50/70">
                  <th className="w-10 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all payslips"
                      className="h-4 w-4 rounded border-navy-100"
                    />
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Employee</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Department</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">Gross pay</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">Deductions</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">Net pay</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Sent</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} className="border-b border-navy-100 last:border-0 hover:bg-sand-50/60">
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleOne(r.id)}
                        aria-label={`Select ${r.employeeName}`}
                        className="h-4 w-4 rounded border-navy-100"
                      />
                    </td>
                    <td className="px-5 py-3.5 font-medium text-ink-900">{r.employeeName}</td>
                    <td className="px-5 py-3.5 text-ink-900">{r.department}</td>
                    <td className="px-5 py-3.5 text-right text-ink-900">{formatCurrency(r.grossPay)}</td>
                    <td className="px-5 py-3.5 text-right text-ink-900">{formatCurrency(r.totalDeductions)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-ink-900">{formatCurrency(r.netPay)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ink-500">
                      {r.emailSentAt && <div>✓ Emailed</div>}
                      {r.smsSentAt && <div>✓ Texted</div>}
                      {!r.emailSentAt && !r.smsSentAt && '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingPayslip(r)}
                          className="text-sm font-semibold text-teal-700 hover:underline"
                        >
                          View
                        </button>
                        <SendChannelMenu
                          disabled={sendingId === r.id}
                          onSend={(channel) => handleSendOne(r, channel)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3">
            {run.status === 'for_approval' && (
              <button
                onClick={handleApprove}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg bg-good-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                {busy ? 'Approving…' : 'Approve payroll run'}
              </button>
            )}
            {run.status === 'approved' && (
              <button
                onClick={handleRelease}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-50"
              >
                <Send size={16} />
                {busy ? 'Releasing…' : 'Release payslips'}
              </button>
            )}
          </div>
        </>
      )}

      {viewingPayslip && (
        <PayslipDocument payslip={viewingPayslip} run={run} onClose={() => setViewingPayslip(null)} />
      )}
    </div>
  );
}

export function PayrollManagement() {
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const { data, loading, error, refetch } = useApiResource(
    () => payrollService.listRuns(tab === 'archived'),
    [tab]
  );
  const [showNewRun, setShowNewRun] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const visibleRuns = data?.filter((r) => (tab === 'archived' ? r.isArchived : !r.isArchived)) ?? [];
  const selectedRun = data?.find((r) => r.id === selectedRunId) ?? null;

  async function handleArchive(run: PayrollRun) {
    setBusyId(run.id);
    try {
      await payrollService.archiveRun(run.id);
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnarchive(run: PayrollRun) {
    setBusyId(run.id);
    try {
      await payrollService.unarchiveRun(run.id);
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(run: PayrollRun) {
    if (!confirm(`Delete the draft payroll run "${run.cutoffLabel}"? This cannot be undone.`)) return;
    setBusyId(run.id);
    try {
      await payrollService.deleteRun(run.id);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete this payroll run.');
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<PayrollRun>[] = [
    { header: 'Cutoff', render: (r) => <span className="font-medium">{r.cutoffLabel}</span> },
    { header: 'Period', render: (r) => `${formatDate(r.payPeriodStart)} – ${formatDate(r.payPeriodEnd)}` },
    { header: 'Pay date', render: (r) => formatDate(r.payDate) },
    { header: 'Employees', render: (r) => r.totalEmployees, align: 'center' },
    { header: 'Gross total', render: (r) => formatCurrency(r.grossTotal), align: 'right' },
    { header: 'Net total', render: (r) => <span className="font-semibold">{formatCurrency(r.netTotal)}</span>, align: 'right' },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: '',
      render: (r) => (
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => setSelectedRunId(r.id)} className="text-sm font-semibold text-teal-700 hover:underline">
            {r.status === 'draft' ? 'Enter attendance' : 'View payslips'}
          </button>
          {tab === 'active' ? (
            <>
              <button
                onClick={() => handleArchive(r)}
                disabled={busyId === r.id}
                className="rounded-lg p-1.5 text-ink-500 transition hover:bg-sand-100 disabled:opacity-40"
                title="Archive"
                aria-label="Archive"
              >
                <Archive size={15} />
              </button>
              {r.status === 'draft' && (
                <button
                  onClick={() => handleDelete(r)}
                  disabled={busyId === r.id}
                  className="rounded-lg p-1.5 text-ink-500 transition hover:bg-bad-100 hover:text-bad-600 disabled:opacity-40"
                  title="Delete draft"
                  aria-label="Delete draft"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => handleUnarchive(r)}
              disabled={busyId === r.id}
              className="rounded-lg p-1.5 text-ink-500 transition hover:bg-sand-100 disabled:opacity-40"
              title="Unarchive"
              aria-label="Unarchive"
            >
              <ArchiveRestore size={15} />
            </button>
          )}
        </div>
      ),
      align: 'right',
    },
  ];

  return (
    <Layout title="Payroll Management" subtitle="Enter attendance, compute payroll, and review payslips">
      {selectedRun ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <button onClick={() => setSelectedRunId(null)} className="text-sm font-semibold text-teal-700 hover:underline">
                ← Back to payroll runs
              </button>
              <h3 className="mt-1 text-lg font-bold text-ink-900">{selectedRun.cutoffLabel}</h3>
              <p className="text-sm text-ink-500">
                {formatDate(selectedRun.payPeriodStart)} – {formatDate(selectedRun.payPeriodEnd)} · Pay date{' '}
                {formatDate(selectedRun.payDate)}
              </p>
            </div>
            <StatusBadge status={selectedRun.status} />
          </div>

          {selectedRun.status === 'draft' ? (
            <AttendancePanel run={selectedRun} onComputed={refetch} />
          ) : (
            <PayslipsPanel run={selectedRun} onRunUpdated={refetch} />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex w-fit rounded-lg border border-navy-100 bg-white p-1">
              {(
                [
                  { key: 'active', label: 'Active' },
                  { key: 'archived', label: 'Archived' },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                    tab === t.key ? 'bg-navy-900 text-white' : 'text-ink-500 hover:bg-sand-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {tab === 'active' && (
              <button
                onClick={() => setShowNewRun(true)}
                className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
              >
                <Plus size={16} /> New payroll run
              </button>
            )}
          </div>

          {loading && <LoadingState label="Loading payroll runs…" />}
          {!loading && error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && visibleRuns.length === 0 && tab === 'active' && (
            <EmptyState
              icon={Banknote}
              title="No payroll runs yet"
              description="Start a new payroll run to compute salaries, deductions, and net pay for a cutoff period."
              actionLabel="New payroll run"
              onAction={() => setShowNewRun(true)}
            />
          )}
          {!loading && !error && visibleRuns.length === 0 && tab === 'archived' && (
            <EmptyState
              icon={Archive}
              title="No archived payroll runs"
              description="Runs you archive from the Active tab will appear here, kept for records without cluttering the main list."
            />
          )}
          {!loading && !error && visibleRuns.length > 0 && (
            <DataTable columns={columns} rows={visibleRuns} rowKey={(r) => r.id} />
          )}
        </div>
      )}

      {showNewRun && <NewRunModal onClose={() => setShowNewRun(false)} onCreated={refetch} />}
    </Layout>
  );
}
