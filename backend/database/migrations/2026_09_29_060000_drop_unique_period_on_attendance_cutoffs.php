<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'attendance';

    public function up(): void
    {
        Schema::connection('attendance')->table('attendance_cutoffs', function (Blueprint $table) {
            $table->dropUnique('attendance_cutoffs_period_start_period_end_unique');
        });
    }

    public function down(): void
    {
        Schema::connection('attendance')->table('attendance_cutoffs', function (Blueprint $table) {
            $table->unique(['period_start', 'period_end']);
        });
    }
};