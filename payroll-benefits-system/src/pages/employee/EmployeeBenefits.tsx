import { HeartPulse } from 'lucide-react';
import { EmployeeLayout } from '../../components/layout/EmployeeLayout';
import { LoadingState, ErrorState } from '../../components/common/LoadError';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApiResource } from '../../hooks/useApiResource';
import { benefitsService } from '../../services/benefits.service';
import { formatDate } from '../../utils/format';

export function EmployeeBenefits() {
  const { data, loading, error, refetch } = useApiResource(() => benefitsService.listMyEnrollments(), []);

  return (
    <EmployeeLayout title="My Benefits" subtitle="Your HMO and benefit plan enrollment">
      {loading && <LoadingState label="Loading your benefits…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState
          icon={HeartPulse}
          title="No benefit enrollment on file"
          description="Once HR enrolls you in a benefit plan, it will show up here."
        />
      )}
      {!loading && !error && data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((enrollment) => (
            <div key={enrollment.id} className="rounded-xl border border-line bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-900">{enrollment.planName}</h3>
                <StatusBadge status={enrollment.status} />
              </div>
              <p className="mt-1 text-xs text-ink-500">Enrolled since {formatDate(enrollment.enrollmentDate)}</p>

              {enrollment.dependents.length > 0 && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Dependents</p>
                  <ul className="space-y-1">
                    {enrollment.dependents.map((dep) => (
                      <li key={dep.id} className="text-sm text-ink-900">
                        {dep.fullName} <span className="text-ink-500">— {dep.relationship}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </EmployeeLayout>
  );
}
