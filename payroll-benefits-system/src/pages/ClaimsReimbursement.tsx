import { useState } from 'react';
import { Plus, Receipt, Check, X as XIcon, Banknote } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { DataTable, type Column } from '../components/common/DataTable';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState, ErrorState } from '../components/common/LoadError';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { TextField, SelectField, TextAreaField } from '../components/common/FormField';
import { EmployeePicker } from '../components/common/EmployeePicker';
import { useApiResource } from '../hooks/useApiResource';
import { claimsService } from '../services/claims.service';
import type { Claim, ClaimType } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

const CLAIM_TYPE_LABEL: Record<ClaimType, string> = {
  transportation: 'Transportation',
  medical: 'Medical',
  meal: 'Meal',
  training: 'Training',
  equipment: 'Equipment',
  other: 'Other',
};

function NewClaimModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    claimType: 'transportation' as ClaimType,
    description: '',
    amount: '',
    dateIncurred: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await claimsService.submitClaim({
        employeeId: form.employeeId,
        employeeName: form.employeeName,
        department: form.department,
        claimType: form.claimType,
        description: form.description,
        amount: Number(form.amount),
        dateIncurred: form.dateIncurred,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the claim.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Submit reimbursement claim" onClose={onClose} width="lg">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <EmployeePicker
          required
          value={form.employeeId}
          onChange={(emp) =>
            setForm({
              ...form,
              employeeId: emp?.id ?? '',
              employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '',
              department: emp?.department ?? form.department,
            })
          }
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Department"
            required
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />
          <SelectField
            label="Claim type"
            required
            value={form.claimType}
            onChange={(e) => setForm({ ...form, claimType: e.target.value as ClaimType })}
          >
            {Object.entries(CLAIM_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Amount"
            type="number"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <TextField
            label="Date incurred"
            type="date"
            required
            value={form.dateIncurred}
            onChange={(e) => setForm({ ...form, dateIncurred: e.target.value })}
          />
        </div>
        <TextAreaField
          label="Description"
          required
          placeholder="What was this expense for?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
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
            {submitting ? 'Submitting…' : 'Submit claim'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ClaimsReimbursement() {
  const { data, loading, error, refetch } = useApiResource(() => claimsService.listClaims(), []);
  const [showNew, setShowNew] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function decide(id: string, status: 'approved' | 'rejected') {
    setBusyId(id);
    try {
      await claimsService.decideClaim(id, status);
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  async function reimburse(id: string) {
    setBusyId(id);
    try {
      await claimsService.markReimbursed(id);
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<Claim>[] = [
    { header: 'Employee', render: (r) => <span className="font-medium">{r.employeeName}</span> },
    { header: 'Department', render: (r) => r.department },
    { header: 'Type', render: (r) => CLAIM_TYPE_LABEL[r.claimType] },
    { header: 'Amount', render: (r) => formatCurrency(r.amount), align: 'right' },
    { header: 'Date incurred', render: (r) => formatDate(r.dateIncurred) },
    { header: 'Submitted', render: (r) => formatDate(r.dateSubmitted) },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: '',
      render: (r) => {
        if (r.status === 'submitted' || r.status === 'under_review') {
          return (
            <div className="flex justify-end gap-2">
              <button
                disabled={busyId === r.id}
                onClick={() => decide(r.id, 'approved')}
                className="rounded-lg bg-good-100 p-1.5 text-good-600 transition hover:bg-good-100/70 disabled:opacity-50"
                aria-label="Approve"
              >
                <Check size={16} />
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => decide(r.id, 'rejected')}
                className="rounded-lg bg-bad-100 p-1.5 text-bad-600 transition hover:bg-bad-100/70 disabled:opacity-50"
                aria-label="Reject"
              >
                <XIcon size={16} />
              </button>
            </div>
          );
        }
        if (r.status === 'approved') {
          return (
            <button
              disabled={busyId === r.id}
              onClick={() => reimburse(r.id)}
              className="flex items-center gap-1.5 rounded-lg bg-teal-100 px-2.5 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-100/70 disabled:opacity-50"
            >
              <Banknote size={14} /> Mark reimbursed
            </button>
          );
        }
        return null;
      },
      align: 'right',
    },
  ];

  return (
    <Layout title="Claims & Reimbursement" subtitle="Submit, review, and settle employee reimbursement claims">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
        >
          <Plus size={16} /> Submit claim
        </button>
      </div>

      {loading && <LoadingState label="Loading claims…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState
          icon={Receipt}
          title="No claims submitted yet"
          description="Reimbursement claims for transportation, medical, meals, and other expenses will appear here."
          actionLabel="Submit claim"
          onAction={() => setShowNew(true)}
        />
      )}
      {!loading && !error && data && data.length > 0 && (
        <DataTable columns={columns} rows={data} rowKey={(r) => r.id} />
      )}

      {showNew && <NewClaimModal onClose={() => setShowNew(false)} onCreated={refetch} />}
    </Layout>
  );
}
