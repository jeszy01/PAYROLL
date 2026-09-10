<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_anomalies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payroll_run_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('employee_id')->constrained()->cascadeOnDelete();
            $table->string('employee_name');
            $table->string('anomaly_type');
            $table->string('severity'); // low | medium | critical
            $table->text('description');
            $table->text('suggested_action');
            // The actual numbers compared (e.g. {"overtimeHours":52,"thresholdHours":40})
            // so every flag can show its work instead of a black-box score.
            $table->json('metrics')->nullable();
            $table->string('status')->default('unresolved'); // unresolved | dismissed | needs_correction
            $table->timestamps();

            // One row per (run, employee, anomaly type) — re-scanning updates
            // the numbers on this row instead of duplicating it, so a status
            // an HR reviewer already set (dismissed / needs_correction)
            // survives a recompute/rescan.
            $table->unique(['payroll_run_id', 'employee_id', 'anomaly_type'], 'payroll_anomalies_unique_flag');
            $table->index(['payroll_run_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_anomalies');
    }
};
