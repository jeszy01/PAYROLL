<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A plain UNIQUE constraint on employee_number/email would still
     * reject a new employee reusing a soft-deleted one's number or email
     * — the old row still physically occupies that value. Partial
     * indexes (scoped to deleted_at IS NULL) enforce uniqueness only
     * among active employees, so a deleted employee's number/email
     * become reusable, matching what the validation in
     * EmployeeController::store() now expects.
     */
    public function up(): void
    {
        Schema::table('employees', function ($table) {
            $table->dropUnique('employees_employee_number_unique');
            $table->dropUnique('employees_email_unique');
        });

        DB::statement('CREATE UNIQUE INDEX employees_employee_number_unique ON employees (employee_number) WHERE deleted_at IS NULL');
        DB::statement('CREATE UNIQUE INDEX employees_email_unique ON employees (email) WHERE deleted_at IS NULL');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS employees_employee_number_unique');
        DB::statement('DROP INDEX IF EXISTS employees_email_unique');

        Schema::table('employees', function ($table) {
            $table->unique('employee_number');
            $table->unique('email');
        });
    }
};
