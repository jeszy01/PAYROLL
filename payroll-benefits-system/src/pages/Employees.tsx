import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { DataTable, type Column } from '../components/common/DataTable';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState, ErrorState } from '../components/common/LoadError';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { TextField, SelectField } from '../components/common/FormField';
import { useApiResource } from '../hooks/useApiResource';
import { employeeService } from '../services/employee.service';
import type { Employee, EmploymentStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

const STATUS_LABEL: Record<EmploymentStatus, string> = {
  active: 'Active',
  on_leave: 'On Leave',
  suspended: 'Suspended',
  separated: 'Separated',
};

function NewEmployeeModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employmentStatus: 'active' as EmploymentStatus,
    dateHired: '',
    baseSalary: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await employeeService.create({
        employeeNumber: form.employeeNumber,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || null,
        department: form.department,
        position: form.position,
        employmentStatus: form.employmentStatus,
        dateHired: form.dateHired,
        baseSalary: Number(form.baseSalary),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the employee.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add employee" onClose={onClose} width="lg">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Employee number"
            placeholder="e.g. EMP-0001"
            required
            value={form.employeeNumber}
            onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Phone (for SMS)"
            type="tel"
            placeholder="e.g. +63 917 000 0000"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <div />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="First name"
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <TextField
            label="Last name"
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Department"
            required
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />
          <TextField
            label="Position"
            required
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <SelectField
            label="Employment status"
            required
            value={form.employmentStatus}
            onChange={(e) => setForm({ ...form, employmentStatus: e.target.value as EmploymentStatus })}
          >
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Date hired"
            type="date"
            required
            value={form.dateHired}
            onChange={(e) => setForm({ ...form, dateHired: e.target.value })}
          />
          <TextField
            label="Base salary"
            type="number"
            required
            value={form.baseSalary}
            onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
          />
        </div>
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
            {submitting ? 'Saving…' : 'Add employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function Employees() {
  const { data, loading, error, refetch } = useApiResource(() => employeeService.list(), []);
  const [showNew, setShowNew] = useState(false);

  const columns: Column<Employee>[] = [
    { header: 'Employee #', render: (r) => <span className="font-medium">{r.employeeNumber}</span> },
    { header: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
    { header: 'Email', render: (r) => r.email },
    { header: 'Phone', render: (r) => r.phone || '—' },
    { header: 'Department', render: (r) => r.department },
    { header: 'Position', render: (r) => r.position },
    { header: 'Date hired', render: (r) => formatDate(r.dateHired) },
    { header: 'Base salary', render: (r) => formatCurrency(r.baseSalary), align: 'right' },
    { header: 'Status', render: (r) => <StatusBadge status={r.employmentStatus} /> },
  ];

  return (
    <Layout title="Employees" subtitle="Employee records used across payroll, claims, and benefits">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
        >
          <Plus size={16} /> Add employee
        </button>
      </div>

      {loading && <LoadingState label="Loading employees…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState
          icon={Users}
          title="No employees yet"
          description="Add your first employee record — this is what payroll, claims, compensation, and benefits will reference."
          actionLabel="Add employee"
          onAction={() => setShowNew(true)}
        />
      )}
      {!loading && !error && data && data.length > 0 && (
        <DataTable columns={columns} rows={data} rowKey={(r) => r.id} />
      )}

      {showNew && <NewEmployeeModal onClose={() => setShowNew(false)} onCreated={refetch} />}
    </Layout>
  );
}
