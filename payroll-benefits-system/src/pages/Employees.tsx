import { useMemo, useState } from 'react';
import { Plus, Users, Eye, Pencil, Trash2, Download, Search, RotateCcw } from 'lucide-react';
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

const AVATAR_COLORS = ['#2f5fdb', '#7c5cf5', '#1e7a4c', '#c97b5a', '#2f6b82', '#b3781a'];

function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function exportEmployeesCsv(rows: Employee[]) {
  const header = ['Employee #', 'First name', 'Last name', 'Email', 'Department', 'Position', 'Status', 'Date hired', 'Base salary'];
  const lines = rows.map((r) =>
    [r.employeeNumber, r.firstName, r.lastName, r.email, r.department, r.position, STATUS_LABEL[r.employmentStatus], r.dateHired, r.baseSalary]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function EmployeeFormModal({
  title,
  initial,
  onClose,
  onSubmit,
}: {
  title: string;
  initial?: Employee;
  onClose: () => void;
  onSubmit: (payload: Omit<Employee, 'id'>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    employeeNumber: initial?.employeeNumber ?? '',
    firstName: initial?.firstName ?? '',
    lastName: initial?.lastName ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    department: initial?.department ?? '',
    position: initial?.position ?? '',
    employmentStatus: initial?.employmentStatus ?? ('active' as EmploymentStatus),
    dateHired: initial?.dateHired ?? '',
    baseSalary: initial ? String(initial.baseSalary) : '',
    loanDeductionPerCutoff: initial ? String(initial.loanDeductionPerCutoff) : '',
    transportationAllowance: initial ? String(initial.transportationAllowance) : '',
    riceSubsidyAllowance: initial ? String(initial.riceSubsidyAllowance) : '',
    sssLoanPerCutoff: initial ? String(initial.sssLoanPerCutoff) : '',
    hdmfLoanPerCutoff: initial ? String(initial.hdmfLoanPerCutoff) : '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
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
        loanDeductionPerCutoff: Number(form.loanDeductionPerCutoff) || 0,
        transportationAllowance: Number(form.transportationAllowance) || 0,
        riceSubsidyAllowance: Number(form.riceSubsidyAllowance) || 0,
        sssLoanPerCutoff: Number(form.sssLoanPerCutoff) || 0,
        hdmfLoanPerCutoff: Number(form.hdmfLoanPerCutoff) || 0,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this employee.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose} width="lg">
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
        <div className="border-t border-navy-100 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Recurring per-cutoff amounts
          </p>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Transportation allowance"
              type="number"
              placeholder="0 if none"
              value={form.transportationAllowance}
              onChange={(e) => setForm({ ...form, transportationAllowance: e.target.value })}
            />
            <TextField
              label="Rice subsidy allowance"
              type="number"
              placeholder="0 if none"
              value={form.riceSubsidyAllowance}
              onChange={(e) => setForm({ ...form, riceSubsidyAllowance: e.target.value })}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <TextField
              label="Company loan deduction"
              type="number"
              placeholder="0 if none"
              value={form.loanDeductionPerCutoff}
              onChange={(e) => setForm({ ...form, loanDeductionPerCutoff: e.target.value })}
            />
            <TextField
              label="SSS loan deduction"
              type="number"
              placeholder="0 if none"
              value={form.sssLoanPerCutoff}
              onChange={(e) => setForm({ ...form, sssLoanPerCutoff: e.target.value })}
            />
            <TextField
              label="HDMF loan deduction"
              type="number"
              placeholder="0 if none"
              value={form.hdmfLoanPerCutoff}
              onChange={(e) => setForm({ ...form, hdmfLoanPerCutoff: e.target.value })}
            />
          </div>
        </div>
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
            {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ViewEmployeeModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const rows: [string, React.ReactNode][] = [
    ['Employee #', employee.employeeNumber],
    ['Name', `${employee.firstName} ${employee.lastName}`],
    ['Email', employee.email],
    ['Phone', employee.phone || '—'],
    ['Department', employee.department],
    ['Position', employee.position],
    ['Status', <StatusBadge status={employee.employmentStatus} />],
    ['Date hired', formatDate(employee.dateHired)],
    ['Base salary', formatCurrency(employee.baseSalary)],
    [
      'Transportation allowance',
      employee.transportationAllowance > 0 ? formatCurrency(employee.transportationAllowance) : '—',
    ],
    [
      'Rice subsidy allowance',
      employee.riceSubsidyAllowance > 0 ? formatCurrency(employee.riceSubsidyAllowance) : '—',
    ],
    [
      'Company loan deduction (per cutoff)',
      employee.loanDeductionPerCutoff > 0 ? formatCurrency(employee.loanDeductionPerCutoff) : '—',
    ],
    [
      'SSS loan deduction (per cutoff)',
      employee.sssLoanPerCutoff > 0 ? formatCurrency(employee.sssLoanPerCutoff) : '—',
    ],
    [
      'HDMF loan deduction (per cutoff)',
      employee.hdmfLoanPerCutoff > 0 ? formatCurrency(employee.hdmfLoanPerCutoff) : '—',
    ],
  ];

  return (
    <Modal title={`${employee.firstName} ${employee.lastName}`} onClose={onClose}>
      <dl className="divide-y divide-navy-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <dt className="text-ink-500">{label}</dt>
            <dd className="font-medium text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex justify-end pt-4">
        <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-ink-500 hover:bg-sand-100">
          Close
        </button>
      </div>
    </Modal>
  );
}

export function Employees() {
  const { data, loading, error, refetch } = useApiResource(() => employeeService.list(), []);
  const [showNew, setShowNew] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const departments = useMemo(
    () => [...new Set((data ?? []).map((e) => e.department))].sort(),
    [data]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((e) => {
      if (departmentFilter && e.department !== departmentFilter) return false;
      if (statusFilter && e.employmentStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        e.employeeNumber.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q)
      );
    });
  }, [data, search, departmentFilter, statusFilter]);

  function resetFilters() {
    setSearch('');
    setDepartmentFilter('');
    setStatusFilter('');
  }

  async function handleDelete(employee: Employee) {
    if (!confirm(`Remove ${employee.firstName} ${employee.lastName} from employee records? This cannot be undone.`)) {
      return;
    }
    setBusyId(employee.id);
    try {
      await employeeService.remove(employee.id);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not remove this employee.');
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<Employee>[] = [
    {
      header: 'Employee',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: avatarColor(r.employeeNumber) }}
          >
            {initials(r.firstName, r.lastName)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink-900">
              {r.firstName} {r.lastName}
            </p>
            <p className="truncate text-xs text-ink-500">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Position / Dept',
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-ink-900">{r.position}</p>
          <p className="truncate text-xs text-ink-500">{r.department}</p>
        </div>
      ),
    },
    { header: 'Employee #', render: (r) => r.employeeNumber },
    { header: 'Date hired', render: (r) => formatDate(r.dateHired) },
    { header: 'Base salary', render: (r) => formatCurrency(r.baseSalary), align: 'right' },
    {
      header: 'Loan deduction',
      render: (r) => (r.loanDeductionPerCutoff > 0 ? formatCurrency(r.loanDeductionPerCutoff) : '—'),
      align: 'right',
    },
    { header: 'Status', render: (r) => <StatusBadge status={r.employmentStatus} /> },
    {
      header: '',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setViewingEmployee(r)}
            className="rounded-lg p-1.5 text-ink-500 transition hover:bg-sand-100"
            aria-label="View"
            title="View details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => setEditingEmployee(r)}
            className="rounded-lg p-1.5 text-ink-500 transition hover:bg-sand-100"
            aria-label="Edit"
            title="Edit employee"
          >
            <Pencil size={16} />
          </button>
          <button
            disabled={busyId === r.id}
            onClick={() => handleDelete(r)}
            className="rounded-lg p-1.5 text-ink-500 transition hover:bg-bad-100 hover:text-bad-600 disabled:opacity-30"
            aria-label="Delete"
            title="Delete employee"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      align: 'right',
    },
  ];

  return (
    <Layout title="Employees" subtitle="Directory &amp; profiles">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Employee Management</h2>
          <p className="mt-1 text-sm text-ink-500">
            {data ? `${data.length} employees across ${departments.length} departments` : 'Loading…'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportEmployeesCsv(filtered)}
            disabled={!data || data.length === 0}
            className="flex items-center gap-2 rounded-lg border border-navy-100 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-sand-100 disabled:opacity-50"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-ink-900">Employee Directory</h3>
        <p className="mb-4 text-xs text-ink-500">Manage workforce records</p>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-navy-100 bg-sand-50 px-3 py-2 text-sm">
            <Search size={16} className="shrink-0 text-ink-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID, email…"
              className="w-full bg-transparent text-ink-900 outline-none placeholder:text-ink-500"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-teal-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-teal-500"
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-lg border border-navy-100 px-3 py-2 text-sm font-medium text-ink-500 transition hover:bg-sand-100"
          >
            <RotateCcw size={14} /> Reset
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
        {!loading && !error && data && data.length > 0 && filtered.length === 0 && (
          <EmptyState
            icon={Search}
            title="No matching employees"
            description="Try adjusting your search or filters."
          />
        )}
        {!loading && !error && filtered.length > 0 && (
          <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} />
        )}
      </div>

      {showNew && (
        <EmployeeFormModal
          title="Add employee"
          onClose={() => setShowNew(false)}
          onSubmit={async (payload) => {
            await employeeService.create(payload);
            refetch();
          }}
        />
      )}

      {editingEmployee && (
        <EmployeeFormModal
          title={`Edit ${editingEmployee.firstName} ${editingEmployee.lastName}`}
          initial={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSubmit={async (payload) => {
            await employeeService.update(editingEmployee.id, payload);
            refetch();
          }}
        />
      )}

      {viewingEmployee && (
        <ViewEmployeeModal employee={viewingEmployee} onClose={() => setViewingEmployee(null)} />
      )}
    </Layout>
  );
}
