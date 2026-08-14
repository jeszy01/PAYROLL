import { X, Printer } from 'lucide-react';
import type { Payslip, PayrollRun } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { amountToWords } from '../../utils/amountToWords';

interface PayslipDocumentProps {
  payslip: Payslip;
  run: PayrollRun;
  onClose: () => void;
}

const COMPANY_NAME = 'Payroll & Benefits Management System';
const COMPANY_ADDRESS = 'E-Commerce Marketplace Operations';

export function PayslipDocument({ payslip, run, onClose }: PayslipDocumentProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 px-4 py-8 print:static print:bg-white print:px-0 print:py-0">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:shadow-none">
        {/* Toolbar — hidden when printing */}
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4 print:hidden">
          <h2 className="text-base font-semibold text-ink-900">Payslip</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              <Printer size={15} />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-ink-500 transition hover:bg-sand-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable document */}
        <div id="payslip-print-area" className="overflow-y-auto px-8 py-8 print:overflow-visible print:px-10 print:py-6">
          <div className="rounded-lg border-2 border-navy-900 print:border">
            <div className="h-2 bg-navy-900" />

            <div className="p-6">
              {/* Letterhead */}
              <div className="flex items-start justify-between border-b border-navy-100 pb-4">
                <div>
                  <p className="text-lg font-bold text-ink-900">{COMPANY_NAME}</p>
                  <p className="text-sm text-ink-500">{COMPANY_ADDRESS}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Pay Date</p>
                  <p className="text-sm font-semibold text-ink-900">{formatDate(run.payDate)}</p>
                </div>
              </div>

              {/* Pay to / amount */}
              <div className="flex items-start justify-between border-b border-navy-100 py-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Pay to the order of</p>
                  <p className="text-lg font-bold text-ink-900">{payslip.employeeName}</p>
                  <p className="text-sm text-ink-500">{payslip.department}</p>
                </div>
                <div className="rounded-lg border border-navy-100 bg-sand-50 px-4 py-2 text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Net Pay</p>
                  <p className="text-xl font-bold text-ink-900">{formatCurrency(payslip.netPay)}</p>
                </div>
              </div>

              <p className="border-b border-navy-100 py-3 text-sm italic text-ink-500">
                {amountToWords(payslip.netPay)}
              </p>

              {/* Pay period */}
              <div className="grid grid-cols-2 gap-4 border-b border-navy-100 py-4 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Pay Period</p>
                  <p className="font-medium text-ink-900">
                    {formatDate(run.payPeriodStart)} – {formatDate(run.payPeriodEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Reference No.</p>
                  <p className="font-medium text-ink-900">{payslip.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>

              {/* Earnings & Deductions */}
              <div className="grid grid-cols-2 gap-6 py-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-good-600">Earnings</p>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-500">Basic Pay</dt>
                      <dd className="font-medium text-ink-900">{formatCurrency(payslip.basicPay)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-500">Overtime Pay</dt>
                      <dd className="font-medium text-ink-900">{formatCurrency(payslip.overtimePay)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-500">Allowances</dt>
                      <dd className="font-medium text-ink-900">{formatCurrency(payslip.allowances)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-navy-100 pt-1.5 font-semibold">
                      <dt className="text-ink-900">Gross Pay</dt>
                      <dd className="text-ink-900">{formatCurrency(payslip.grossPay)}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-bad-600">Deductions</p>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-500">SSS Contribution</dt>
                      <dd className="font-medium text-ink-900">{formatCurrency(payslip.sssContribution)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-500">PhilHealth</dt>
                      <dd className="font-medium text-ink-900">{formatCurrency(payslip.philHealthContribution)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-500">Pag-IBIG</dt>
                      <dd className="font-medium text-ink-900">{formatCurrency(payslip.pagIbigContribution)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-500">Withholding Tax</dt>
                      <dd className="font-medium text-ink-900">{formatCurrency(payslip.withholdingTax)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-500">Other Deductions</dt>
                      <dd className="font-medium text-ink-900">{formatCurrency(payslip.otherDeductions)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-navy-100 pt-1.5 font-semibold">
                      <dt className="text-ink-900">Total Deductions</dt>
                      <dd className="text-ink-900">{formatCurrency(payslip.totalDeductions)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Net pay highlight */}
              <div className="flex items-center justify-between rounded-lg bg-navy-900 px-4 py-3 print:bg-white print:border print:border-navy-900">
                <p className="text-sm font-semibold text-white print:text-ink-900">Net Pay</p>
                <p className="text-lg font-bold text-white print:text-ink-900">{formatCurrency(payslip.netPay)}</p>
              </div>

              {/* Signature */}
              <div className="mt-8 flex justify-end">
                <div className="text-center">
                  <div className="mb-1 h-10 border-b border-ink-300" style={{ width: '220px' }} />
                  <p className="text-xs text-ink-500">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-ink-300 print:hidden">
            This is a system-generated payslip for {run.cutoffLabel}.
          </p>
        </div>
      </div>

      <style>{`
        @page {
          size: 8.5in 5.5in;
          margin: 0.3in;
        }
        @media print {
          html, body { height: auto; }
          body * { visibility: hidden; }
          #payslip-print-area, #payslip-print-area * { visibility: visible; }
          #payslip-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
