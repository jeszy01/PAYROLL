<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'otp_code')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('otp_code')->nullable();
            });
        }

        if (! Schema::hasColumn('users', 'otp_expires_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('otp_expires_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        // Intentionally empty: the columns belong to
        // 2026_09_21_000001_add_otp_fields_to_users_table.
    }
};