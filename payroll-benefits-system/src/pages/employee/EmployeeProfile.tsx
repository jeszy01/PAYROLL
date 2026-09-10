import { useEffect, useState } from 'react';
import { EmployeeLayout } from '../../components/layout/EmployeeLayout';
import { LoadingState, ErrorState } from '../../components/common/LoadError';
import { TextField } from '../../components/common/FormField';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApiResource } from '../../hooks/useApiResource';
import { employeeService } from '../../services/employee.service';
import type { EmploymentType, CivilStatus } from '../../types';
import { formatDate } from '../../utils/format';

const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  regular: 'Regular',
  probationary: 'Probationary',
  contractual: 'Contractual',
};

const CIVIL_STATUS_LABEL: Record<CivilStatus, string> = {
  single: 'Single',
  married: 'Married',
  widowed: 'Widowed',
  separated: 'Legally Separated',
};

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink-900">{value}</p>
    </div>
  );
}

export function EmployeeProfile() {
  const { data: employee, loading, error, refetch } = useApiResource(() => employeeService.getMe(), []);
  const [form, setForm] = useState({ phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({ phone: employee.phone ?? '', address: employee.address ?? '' });
    }
  }, [employee]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await employeeService.updateMe(form);
      refetch();
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <EmployeeLayout title="My Profile" subtitle="Your employee record on file">
      {loading && <LoadingState label="Loading your profile…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && employee && (
        <div className="space-y-6">
          <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-ink-900">Employment Details</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <ReadOnlyField label="Employee No." value={employee.employeeNumber} />
              <ReadOnlyField label="Full name" value={`${employee.firstName} ${employee.lastName}`} />
              <ReadOnlyField label="Email" value={employee.email} />
              <ReadOnlyField label="Department" value={employee.department} />
              <ReadOnlyField label="Position" value={employee.position} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Status</p>
                <div className="mt-1">
                  <StatusBadge status={employee.employmentStatus} />
                </div>
              </div>
              <ReadOnlyField label="Date hired" value={formatDate(employee.dateHired)} />
              <ReadOnlyField label="Shift" value={`${employee.shiftStart.slice(0, 5)} – ${employee.shiftEnd.slice(0, 5)}`} />
              <ReadOnlyField label="Employment type" value={EMPLOYMENT_TYPE_LABEL[employee.employmentType]} />
              <ReadOnlyField label="Civil status" value={CIVIL_STATUS_LABEL[employee.civilStatus]} />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h3 className="mb-1 text-sm font-semibold text-ink-900">Statutory &amp; Government IDs</h3>
            <p className="mb-4 text-xs text-ink-500">
              On file for BIR, SSS, PhilHealth, and Pag-IBIG remittance — contact HR to correct any of these.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ReadOnlyField label="SSS No." value={employee.sssNumber || '—'} />
              <ReadOnlyField label="PhilHealth No." value={employee.philhealthNumber || '—'} />
              <ReadOnlyField label="Pag-IBIG No." value={employee.pagibigNumber || '—'} />
              <ReadOnlyField label="TIN" value={employee.tinNumber || '—'} />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h3 className="mb-1 text-sm font-semibold text-ink-900">Contact Information</h3>
            <p className="mb-4 text-xs text-ink-500">You can update your own contact number and address.</p>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSave}>
              <TextField
                label="Contact number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <TextField
                label="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              {saveError && <p className="text-sm text-bad-600 sm:col-span-2">{saveError}</p>}
              {saved && <p className="text-sm text-good-600 sm:col-span-2">Saved.</p>}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </EmployeeLayout>
  );
}
