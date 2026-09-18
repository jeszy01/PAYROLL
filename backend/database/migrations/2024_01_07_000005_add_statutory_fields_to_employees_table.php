<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('sss_number')->nullable()->after('employee_number');
            $table->string('philhealth_number')->nullable()->after('sss_number');
            $table->string('pagibig_number')->nullable()->after('philhealth_number');
            $table->string('tin_number')->nullable()->after('pagibig_number');
            $table->string('employment_type')->default('regular')->after('employment_status'); // regular, probationary, contractual
            $table->string('civil_status')->default('single')->after('employment_type'); // single, married, widowed, separated
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'sss_number', 'philhealth_number', 'pagibig_number', 'tin_number',
                'employment_type', 'civil_status',
            ]);
        });
    }
};
