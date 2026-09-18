<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Marks a specific Sanctum token (= this SPA's login session) as having
 * cleared the Employee Self-Service 2FA step-up challenge. Tied to the
 * token rather than the user so re-authenticating (a fresh login) always
 * requires the code again, matching a per-session step-up.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->timestamp('ess_verified_at')->nullable()->after('abilities');
        });
    }

    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropColumn('ess_verified_at');
        });
    }
};
