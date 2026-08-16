<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cash Advance, Tax Refund, and SL-Cash Conversion (from the client's
     * payslip format) are one-off, per-cutoff adjustments rather than a
     * standing rate — they don't belong on the Employee record. They're
     * entered at the same per-run, per-employee step as attendance, so
     * they live on this table alongside days_present/late_minutes/etc.
     */
    public function up(): void
    {
        Schema::table('attendance_summaries', function (Blueprint $table) {
            $table->decimal('cash_advance', 10, 2)->default(0)->after('unpaid_absence_days');
            $table->decimal('tax_refund', 10, 2)->default(0)->after('cash_advance');
            $table->decimal('sl_cash_conversion', 10, 2)->default(0)->after('tax_refund');
        });
    }

    public function down(): void
    {
        Schema::table('attendance_summaries', function (Blueprint $table) {
            $table->dropColumn(['cash_advance', 'tax_refund', 'sl_cash_conversion']);
        });
    }
};
