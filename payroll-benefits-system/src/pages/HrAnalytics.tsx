import { BarChart3, Banknote, Users, Receipt, HeartPulse } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Layout } from '../components/layout/Layout';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState, ErrorState } from '../components/common/LoadError';
import { useApiResource } from '../hooks/useApiResource';
import { analyticsService } from '../services/analytics.service';
import { formatCurrency, formatPercent } from '../utils/format';

export function HrAnalytics() {
  const { data, loading, error, refetch } = useApiResource(() => analyticsService.getSummary(), []);

  return (
    <Layout title="HR Analytics Dashboard" subtitle="Payroll cost, claims, and benefits utilization insights">
      {loading && <LoadingState label="Loading analytics…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Banknote}
              label="Payroll cost this period"
              value={formatCurrency(data?.totalPayrollCostThisPeriod ?? 0)}
              tone="clay"
            />
            <StatCard icon={Users} label="Active employees" value={String(data?.totalActiveEmployees ?? 0)} />
            <StatCard icon={Receipt} label="Pending claims" value={String(data?.pendingClaimsCount ?? 0)} tone="teal" />
            <StatCard
              icon={HeartPulse}
              label="Benefits enrollment rate"
              value={formatPercent(data?.benefitsEnrollmentRate ?? 0)}
            />
          </div>

          <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-ink-900">Payroll cost trend</h3>
            {!data || data.payrollCostTrend.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No payroll cost history"
                description="This chart will populate once payroll runs have been processed over time."
              />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.payrollCostTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7eaf3" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#a4abbd" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#a4abbd" />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="grossCost" name="Gross" stroke="#16234f" strokeWidth={2} />
                  <Line type="monotone" dataKey="netCost" name="Net" stroke="#2f6b82" strokeWidth={2} />
                  <Line type="monotone" dataKey="deductions" name="Deductions" stroke="#c97b5a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-ink-900">Claims by type</h3>
              {!data || data.claimsByType.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No claims data"
                  description="Claim totals by category will show up here once claims are filed."
                />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.claimsByType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7eaf3" />
                    <XAxis dataKey="claimType" tick={{ fontSize: 12 }} stroke="#a4abbd" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#a4abbd" />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="totalAmount" name="Total amount" fill="#c97b5a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-ink-900">Benefits utilization</h3>
              {!data || data.benefitsUtilization.length === 0 ? (
                <EmptyState
                  icon={HeartPulse}
                  title="No benefits utilization data"
                  description="Enrollment vs. plan capacity will appear here once benefit plans are active."
                />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.benefitsUtilization}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7eaf3" />
                    <XAxis dataKey="planName" tick={{ fontSize: 12 }} stroke="#a4abbd" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#a4abbd" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enrolled" name="Enrolled" fill="#1f4759" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="capacity" name="Capacity" fill="#e7eaf3" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
