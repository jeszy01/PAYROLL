import { useState } from 'react';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { DataTable, type Column } from '../components/common/DataTable';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState, ErrorState } from '../components/common/LoadError';
import { useApiResource } from '../hooks/useApiResource';
import { auditService, type AuditLogEntry } from '../services/audit.service';

const MODULES = [
  { value: '', label: 'All modules' },
  { value: 'auth', label: 'Sign-in' },
  { value: 'users', label: 'Users' },
];

const ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'login', label: 'Login' },
  { value: 'login_failed', label: 'Failed login' },
  { value: 'logout', label: 'Logout' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
];

const ACTION_STYLE: Record<string, string> = {
  login_failed: 'bg-bad-100 text-bad-600',
  delete: 'bg-bad-100 text-bad-600',
};

function actionLabel(a: string) {
  return ACTIONS.find((x) => x.value === a)?.label ?? a;
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const inputCls =
  'rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-teal-500';

export function AuditLogs() {
  const [moduleF, setModuleF] = useState('');
  const [actionF, setActionF] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading, error, refetch } = useApiResource(
    () =>
      auditService.list({
        module: moduleF,
        action: actionF,
        from,
        to,
        search,
        page,
      }),
    [moduleF, actionF, from, to, search, page]
  );

  function change<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  const columns: Column<AuditLogEntry>[] = [
    { header: 'When', render: (r) => <span className="whitespace-nowrap">{formatDateTime(r.createdAt)}</span> },
    {
      header: 'User',
      render: (r) => (
        <div>
          <p className="font-medium">{r.userName ?? 'Unknown'}</p>
          {r.userRole && <p className="text-xs text-ink-500">{r.userRole === 'hr_staff' ? 'HR Staff' : 'Admin'}</p>}
        </div>
      ),
    },
    {
      header: 'Action',
      render: (r) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            ACTION_STYLE[r.action] ?? 'bg-sand-100 text-ink-900'
          }`}
        >
          {actionLabel(r.action)}
        </span>
      ),
    },
    { header: 'Module', render: (r) => <span className="capitalize">{r.module}</span> },
    { header: 'Details', render: (r) => r.description },
    { header: 'IP', render: (r) => <span className="text-xs text-ink-500">{r.ipAddress ?? '—'}</span> },
  ];

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <Layout title="Logs & Audit" subtitle="Who did what in this system">
      <form
        className="mb-4 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput.trim());
          setPage(1);
        }}
      >
        <select className={inputCls} value={moduleF} onChange={(e) => change(setModuleF)(e.target.value)}>
          {MODULES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select className={inputCls} value={actionF} onChange={(e) => change(setActionF)(e.target.value)}>
          {ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <label className="text-xs text-ink-500">
          From
          <input type="date" className={`${inputCls} ml-2`} value={from} onChange={(e) => change(setFrom)(e.target.value)} />
        </label>
        <label className="text-xs text-ink-500">
          To
          <input type="date" className={`${inputCls} ml-2`} value={to} onChange={(e) => change(setTo)(e.target.value)} />
        </label>
        <input
          className={`${inputCls} min-w-[200px] flex-1`}
          placeholder="Search user or details…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
        >
          Search
        </button>
      </form>

      {loading && <LoadingState label="Loading logs…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState
          icon={ScrollText}
          title="No log entries found"
          description="Try changing the filters or date range."
        />
      )}
      {!loading && !error && rows.length > 0 && (
        <>
          <DataTable columns={columns} rows={rows} rowKey={(r) => String(r.id)} />
          {meta && (
            <div className="mt-4 flex items-center justify-between text-sm text-ink-500">
              <span>{meta.total} entries</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-navy-100 p-1.5 transition hover:bg-sand-100 disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  Page {meta.page} of {meta.lastPage}
                </span>
                <button
                  disabled={page >= meta.lastPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-navy-100 p-1.5 transition hover:bg-sand-100 disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}