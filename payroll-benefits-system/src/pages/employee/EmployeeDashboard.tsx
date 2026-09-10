import { Link } from 'react-router-dom';
import { Clock, Receipt, HeartPulse, Banknote } from 'lucide-react';
import { EmployeeLayout } from '../../components/layout/EmployeeLayout';
import { StatCard } from '../../components/common/StatCard';
import { LoadingState, ErrorState } from '../../components/common/LoadError';
import { useApiResource } from '../../hooks/useApiResource';
import { employeeService } from '../../services/employee.service';
import { attendanceService } from '../../services/attendance.service';
import { claimsService } from '../../services/claims.service';
import { benefitsService } from '../../services/benefits.service';
import { payrollService } from '../../services/payroll.service';
import { formatCurrency, formatTimeOfDay } from '../../utils/format';

const IN_STATUS_LABEL = { on_time: 'On Time', late: 'Late' } as const;

export function EmployeeDashboard() {
  const { data: employee, loading: employeeLoading, error: employeeError } = useApiResource(
    () => employeeService.getMe(),
    []
  );
  const { data: today, loading: todayLoading, error: todayError } = useApiResource(
    () => attendanceService.getToday(),
    []
  );
  const { data: claims, loading: claimsLoading, error: claimsError } = useApiResource(
    () => claimsService.listMyClaims(),
    []
  );
  const { data: enrollments } = useApiResource(() => benefitsService.listMyEnrollments(), []);
  const { data: payslips } = useApiResource(() => payrollService.listMyPayslips(), []);

  const loading = employeeLoading || todayLoading || claimsLoading;
  const error = employeeError || todayError || claimsError;

  if (loading) {
    return (
      <EmployeeLayout title="Dashboard" subtitle="Overview">
        <LoadingState label="Loading your dashboard…" />
      </EmployeeLayout>
    );
  }
  if (error) {
    return (
      <EmployeeLayout title="Dashboard" subtitle="Overview">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </EmployeeLayout>
    );
  }

  const record = today?.record ?? null;
  const pendingClaims = (claims ?? []).filter((c) => c.status === 'submitted' || c.status === 'under_review');
  const activeEnrollment = (enrollments ?? []).find((e) => e.status === 'enrolled');
  const latestPayslip = (payslips ?? [])[0];

  let attendanceValue = 'Not clocked in';
  let attendanceHint: string | undefined;
  if (record?.timestampIn) {
    attendanceValue = formatTimeOfDay(record.timestampIn);
    attendanceHint = record.statusIn ? IN_STATUS_LABEL[record.statusIn] : undefined;
    if (record.timestampOut) {
      attendanceHint = `${attendanceHint} · Timed out ${formatTimeOfDay(record.timestampOut)}`;
    }
  }

  return (
    <EmployeeLayout title="Dashboard" subtitle="Overview">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">
            Welcome back{employee?.firstName ? `, ${employee.firstName}` : ''}
          </h2>
          <p className="mt-1 text-sm text-ink-500">Here's your attendance, payslips, and benefits at a glance.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Today's Attendance" value={attendanceValue} hint={attendanceHint} />
          <StatCard
            label="Pending Claims"
            value={String(pendingClaims.length)}
            hint={pendingClaims.length > 0 ? `${formatCurrency(pendingClaims.reduce((s, c) => s + c.amount, 0))} in review` : 'Nothing pending'}
          />
          <StatCard
            label="Benefits"
            value={activeEnrollment ? activeEnrollment.planName : 'Not enrolled'}
            hint={activeEnrollment ? 'Active enrollment' : 'Contact HR to enroll'}
          />
          <StatCard
            label="Latest Payslip"
            value={latestPayslip ? formatCurrency(latestPayslip.totalRemittance) : '—'}
            hint={latestPayslip ? 'Net pay' : 'No payslips yet'}
          />
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-ink-900">Quick Actions</h3>
          <p className="mb-4 text-xs text-ink-500">Common tasks</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link
              to="/ess/attendance"
              className="flex flex-col items-center gap-2 rounded-lg border border-line bg-sand-50 px-3 py-4 text-center text-xs font-semibold text-ink-900 transition hover:bg-sand-100"
            >
              <Clock size={18} className="text-primary-600" strokeWidth={1.75} />
              Time In / Out
            </Link>
            <Link
              to="/ess/claims"
              className="flex flex-col items-center gap-2 rounded-lg border border-line bg-sand-50 px-3 py-4 text-center text-xs font-semibold text-ink-900 transition hover:bg-sand-100"
            >
              <Receipt size={18} className="text-primary-600" strokeWidth={1.75} />
              Submit Claim
            </Link>
            <Link
              to="/ess/payslips"
              className="flex flex-col items-center gap-2 rounded-lg border border-line bg-sand-50 px-3 py-4 text-center text-xs font-semibold text-ink-900 transition hover:bg-sand-100"
            >
              <Banknote size={18} className="text-primary-600" strokeWidth={1.75} />
              View Payslips
            </Link>
            <Link
              to="/ess/benefits"
              className="flex flex-col items-center gap-2 rounded-lg border border-line bg-sand-50 px-3 py-4 text-center text-xs font-semibold text-ink-900 transition hover:bg-sand-100"
            >
              <HeartPulse size={18} className="text-primary-600" strokeWidth={1.75} />
              View Benefits
            </Link>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
