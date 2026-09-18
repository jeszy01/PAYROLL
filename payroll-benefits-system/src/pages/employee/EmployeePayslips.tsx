import { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { EmployeeLayout } from '../../components/layout/EmployeeLayout';
import { LoadingState, ErrorState } from '../../components/common/LoadError';
import { EmptyState } from '../../components/common/EmptyState';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PayslipDocument } from '../../components/payroll/PayslipDocument';
import { useApiResource } from '../../hooks/useApiResource';
import { payrollService } from '../../services/payroll.service';
import type { Payslip, PayrollRun } from '../../types';
import { formatCurrency } from '../../utils/format';

export function EmployeePayslips() {
  const { data, loading, error, refetch } = useApiResource(() => payrollService.listMyPayslips(), []);
  const [viewing, setViewing] = useState<{ payslip: Payslip; run: PayrollRun } | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  async function handleView(payslip: Payslip) {
    setOpeningId(payslip.id);
    setOpenError(null);
    try {
      const run = await payrollService.getRun(payslip.payrollRunId);
      setViewing({ payslip, run });
    } catch (err) {
      setOpenError(err instanceof Error ? err.message : 'Could not open this payslip.');
    } finally {
      setOpeningId(null);
    }
  }

  const columns: Column<Payslip>[] = [
    { header: 'Department', render: (r) => r.department },
    { header: 'Total salary', render: (r) => formatCurrency(r.totalSalary), align: 'right' },
    { header: 'Deductions', render: (r) => formatCurrency(r.totalSalary - r.netSalary), align: 'right' },
    { header: 'Total remittance', render: (r) => <span className="font-semibold">{formatCurrency(r.totalRemittance)}</span>, align: 'right' },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: '',
      render: (r) => (
        <button
          onClick={() => handleView(r)}
          disabled={openingId === r.id}
          className="text-sm font-semibold text-teal-700 hover:underline disabled:opacity-50"
        >
          {openingId === r.id ? 'Opening…' : 'View'}
        </button>
      ),
      align: 'right',
    },
  ];

  return (
    <EmployeeLayout title="My Payslips" subtitle="Your payslips from past payroll runs">
      {loading && <LoadingState label="Loading your payslips…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState icon={FileSpreadsheet} title="No payslips yet" description="Your payslips will appear here once payroll has been released." />
      )}
      {!loading && !error && data && data.length > 0 && (
        <>
          {openError && <p className="mb-4 text-sm text-bad-600">{openError}</p>}
          <DataTable columns={columns} rows={data} rowKey={(r) => r.id} />
        </>
      )}

      {viewing && (
        <PayslipDocument payslip={viewing.payslip} run={viewing.run} onClose={() => setViewing(null)} />
      )}
    </EmployeeLayout>
  );
}
