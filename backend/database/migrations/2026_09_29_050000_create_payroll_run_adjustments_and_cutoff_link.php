<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'payroll';

    public function up(): void
    {
        Schema::connection('payroll')->table('payroll_runs', function (Blueprint $table) {
            $table->uuid('attendance_cutoff_id')->nullable()->unique();
        });

        Schema::connection('payroll')->create('payroll_run_adjustments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payroll_run_id')->constrained('payroll_runs')->cascadeOnDelete();
            $table->uuid('employee_id');
            $table->decimal('sl_cash_conversion', 12, 2)->default(0);
            $table->timestamps();
            $table->unique(['payroll_run_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::connection('payroll')->dropIfExists('payroll_run_adjustments');

        Schema::connection('payroll')->table('payroll_runs', function (Blueprint $table) {
            $table->dropColumn('attendance_cutoff_id');
        });
    }
};