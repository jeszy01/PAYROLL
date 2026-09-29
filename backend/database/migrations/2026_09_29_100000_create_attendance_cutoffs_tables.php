<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Attendance is a summary per cutoff (period), not tied to a payroll run.
     * A cutoff and its entries are saved together and are final (locked).
     */
    public function up(): void
    {
        Schema::create('attendance_cutoffs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('label');
            $table->date('period_start');
            $table->date('period_end');
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();

            $table->unique(['period_start', 'period_end']);
        });

        Schema::create('attendance_cutoff_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('attendance_cutoff_id')->constrained('attendance_cutoffs')->cascadeOnDelete();
            $table->uuid('employee_id')->index();
            $table->string('employee_name');
            $table->decimal('days_present', 5, 2)->default(0);
            $table->decimal('unpaid_absence_days', 5, 2)->default(0);
            $table->unsignedInteger('late_minutes')->default(0);
            $table->decimal('overtime_hours', 5, 2)->default(0);
            $table->timestamps();

            $table->unique(['attendance_cutoff_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_cutoff_entries');
        Schema::dropIfExists('attendance_cutoffs');
    }
};