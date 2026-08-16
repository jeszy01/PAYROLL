<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Rebuilds the payslip line items to match the client's actual
     * payslip format:
     *
     *   Basic Salary
     *   + Tax Refund, SL-Cash Conversion, Overtime Pay
     *   - Absent/Undertime/Lates deduction
     *   = Total Salary
     *   - SSS, PhilHealth, HDMF (Pag-IBIG)
     *   = Taxable Salary
     *   - Withholding Tax, Cash Advance, SSS Loan, HDMF Loan, Company Loan
     *   = Net Salary
     *   + Transportation Allowance, Rice Subsidy Allowance
     *   = Total Remittance
     *
     * Drops the old flatter gross/net-pay shape (allowances, gross_pay,
     * other_deductions, total_deductions, net_pay) — payslips are
     * recomputed from attendance every time compute() runs, so there's
     * no history in the old columns worth preserving on a draft/for-
     * approval run; only released runs would have a stale snapshot.
     */
    public function up(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->dropColumn(['allowances', 'gross_pay', 'other_deductions', 'total_deductions', 'net_pay']);

            $table->decimal('tax_refund', 12, 2)->default(0)->after('basic_pay');
            $table->decimal('sl_cash_conversion', 12, 2)->default(0)->after('tax_refund');
            $table->decimal('overtime_pay', 12, 2)->default(0)->change();
            $table->decimal('late_undertime_absence_deduction', 12, 2)->default(0)->after('overtime_pay');
            $table->decimal('total_salary', 12, 2)->default(0)->after('late_undertime_absence_deduction');

            $table->decimal('taxable_salary', 12, 2)->default(0)->after('pagibig_contribution');

            $table->decimal('cash_advance', 12, 2)->default(0)->after('withholding_tax');
            $table->decimal('sss_loan', 12, 2)->default(0)->after('cash_advance');
            $table->decimal('hdmf_loan', 12, 2)->default(0)->after('sss_loan');
            $table->decimal('company_loan_deduction', 12, 2)->default(0)->after('hdmf_loan');
            $table->decimal('net_salary', 12, 2)->default(0)->after('company_loan_deduction');

            $table->decimal('transportation_allowance', 12, 2)->default(0)->after('net_salary');
            $table->decimal('rice_subsidy_allowance', 12, 2)->default(0)->after('transportation_allowance');
            $table->decimal('total_remittance', 12, 2)->default(0)->after('rice_subsidy_allowance');
        });
    }

    public function down(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->dropColumn([
                'tax_refund', 'sl_cash_conversion', 'late_undertime_absence_deduction', 'total_salary',
                'taxable_salary', 'cash_advance', 'sss_loan', 'hdmf_loan', 'company_loan_deduction',
                'net_salary', 'transportation_allowance', 'rice_subsidy_allowance', 'total_remittance',
            ]);

            $table->decimal('allowances', 12, 2)->default(0);
            $table->decimal('gross_pay', 12, 2)->default(0);
            $table->decimal('other_deductions', 12, 2)->default(0);
            $table->decimal('total_deductions', 12, 2)->default(0);
            $table->decimal('net_pay', 12, 2)->default(0);
        });
    }
};
