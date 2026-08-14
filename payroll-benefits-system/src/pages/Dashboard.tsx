import { Banknote, Users, Receipt, HeartPulse } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState, ErrorState } from '../components/common/LoadError';
import { useApiResource } from '../hooks/useApiResource';
import { analyticsService } from '../services/analytics.service';
import { formatCurrency, formatPercent } from '../utils/format';
import { LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { data, loading, error, refetch } = useApiResource(() => analyticsService.getSummary(), []);

  return (
    <Layout title="Dashboard" subtitle="Payroll and benefits at a glance">
      {loading && <LoadingState label="Loading dashboard summary…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Banknote}
              label="Payroll cost this period"
              value={data ? formatCurrency(data.totalPayrollCostThisPeriod) : formatCurrency(0)}
              tone="clay"
            />
            <StatCard
              icon={Users}
              label="Active employees"
              value={String(data?.totalActiveEmployees ?? 0)}
              tone="navy"
            />
            <StatCard
              icon={Receipt}
              label="Pending claims"
              value={String(data?.pendingClaimsCount ?? 0)}
              tone="teal"
            />
            <StatCard
              icon={HeartPulse}
              label="Benefits enrollment rate"
              value={formatPercent(data?.benefitsEnrollmentRate ?? 0)}
              tone="navy"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-ink-900">Payroll cost trend</h3>
              {!data || data.payrollCostTrend.length === 0 ? (
                <EmptyState
                  icon={LineChart}
                  title="No payroll history yet"
                  description="Once payroll runs are processed, cost trends will appear here."
                />
              ) : (
                <p className="text-sm text-ink-500">See the HR Analytics module for the full chart.</p>
              )}
            </div>

            <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-ink-900">Quick access</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { to: '/payroll', label: 'Run Payroll' },
                  { to: '/claims', label: 'Review Claims' },
                  { to: '/benefits', label: 'Manage Benefits' },
                  { to: '/analytics', label: 'View Reports' },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-lg border border-navy-100 bg-sand-50 px-3 py-4 text-center text-xs font-semibold text-ink-900 transition hover:bg-sand-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
