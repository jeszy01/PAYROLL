<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Snapshot the employee_number shown on the Employees list (e.g.
     * "EMP-001") onto each payslip, same as employee_name already is —
     * the payslip template was falling back to slicing the employee's
     * UUID for display, which doesn't match the Employees module.
     */
    public function up(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->string('employee_number')->nullable()->after('employee_id');
        });

        DB::statement('
            UPDATE payslips
            SET employee_number = employees.employee_number
            FROM employees
            WHERE employees.id = payslips.employee_id
        ');
    }

    public function down(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->dropColumn('employee_number');
        });
    }
};
