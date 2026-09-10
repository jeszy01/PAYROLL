import { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { EmployeeLayout } from '../../components/layout/EmployeeLayout';
import { LoadingState, ErrorState } from '../../components/common/LoadError';
import { EmptyState } from '../../components/common/EmptyState';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { SelectField, TextField, TextAreaField } from '../../components/common/FormField';
import { useApiResource } from '../../hooks/useApiResource';
import { claimsService } from '../../services/claims.service';
import { claimPolicyHint } from '../../config/claimPolicyLimits';
import type { Claim, ClaimType } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

const CLAIM_TYPE_LABEL: Record<ClaimType, string> = {
  transportation: 'Transportation',
  medical: 'Medical',
  meal: 'Meal',
  training: 'Training',
  equipment: 'Equipment',
  other: 'Other',
};

function NewMyClaimModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
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
      await claimsService.submitMyClaim({
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
        <div className="grid grid-cols-2 gap-4">
          <div>
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
            {claimPolicyHint(form.claimType, CLAIM_TYPE_LABEL[form.claimType]) && (
              <p className="mt-1.5 text-xs text-ink-500">
                {claimPolicyHint(form.claimType, CLAIM_TYPE_LABEL[form.claimType])}
              </p>
            )}
          </div>
          <TextField
            label="Date incurred"
            type="date"
            required
            value={form.dateIncurred}
            onChange={(e) => setForm({ ...form, dateIncurred: e.target.value })}
          />
        </div>
        <TextField
          label="Amount"
          type="number"
          required
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
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
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit claim'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function EmployeeClaims() {
  const { data, loading, error, refetch } = useApiResource(() => claimsService.listMyClaims(), []);
  const [showNew, setShowNew] = useState(false);

  const columns: Column<Claim>[] = [
    { header: 'Type', render: (r) => CLAIM_TYPE_LABEL[r.claimType] },
    { header: 'Description', render: (r) => <span className="line-clamp-1 max-w-xs">{r.description}</span> },
    { header: 'Amount', render: (r) => formatCurrency(r.amount), align: 'right' },
    { header: 'Date incurred', render: (r) => formatDate(r.dateIncurred) },
    { header: 'Submitted', render: (r) => formatDate(r.dateSubmitted) },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <EmployeeLayout title="My Claims" subtitle="Reimbursement claims you've filed">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          <Plus size={16} /> Submit claim
        </button>
      </div>

      {loading && <LoadingState label="Loading your claims…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState
          icon={Receipt}
          title="No claims yet"
          description="Claims you submit will appear here for you to track."
          actionLabel="Submit claim"
          onAction={() => setShowNew(true)}
        />
      )}
      {!loading && !error && data && data.length > 0 && <DataTable columns={columns} rows={data} rowKey={(r) => r.id} />}

      {showNew && <NewMyClaimModal onClose={() => setShowNew(false)} onCreated={refetch} />}
    </EmployeeLayout>
  );
}
