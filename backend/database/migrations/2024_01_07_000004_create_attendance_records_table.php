<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('date');
            $table->dateTime('timestamp_in')->nullable();
            $table->dateTime('timestamp_out')->nullable();
            $table->string('status_in')->nullable(); // on_time, late
            $table->string('status_out')->nullable(); // on_time, overtime
            $table->unsignedInteger('minutes_late')->default(0);
            $table->unsignedInteger('overtime_minutes')->default(0);
            $table->string('holiday_type')->nullable(); // regular, special_non_working
            $table->timestamps();

            $table->unique(['employee_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
