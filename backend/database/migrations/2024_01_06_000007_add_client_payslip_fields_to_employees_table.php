<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fields from the client's actual payslip format that are recurring
     * per employee (apply every cutoff until changed) — as opposed to
     * Cash Advance / Tax Refund / SL-Cash Conversion, which are one-off
     * and entered per payroll run instead (see attendance_summaries).
     */
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->decimal('transportation_allowance', 10, 2)->default(0)->after('loan_deduction_per_cutoff');
            $table->decimal('rice_subsidy_allowance', 10, 2)->default(0)->after('transportation_allowance');
            $table->decimal('sss_loan_per_cutoff', 10, 2)->default(0)->after('rice_subsidy_allowance');
            $table->decimal('hdmf_loan_per_cutoff', 10, 2)->default(0)->after('sss_loan_per_cutoff');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['transportation_allowance', 'rice_subsidy_allowance', 'sss_loan_per_cutoff', 'hdmf_loan_per_cutoff']);
        });
    }
};
