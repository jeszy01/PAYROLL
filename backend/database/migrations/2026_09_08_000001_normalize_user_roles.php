<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * RBAC introduces exactly two staff roles: admin (full access, incl. user
 * management and destructive/approval actions) and hr_staff (day-to-day HR
 * operations). Collapse whatever free-text role values existing rows
 * have into one of those two, and lock the column default going
 * forward — new accounts default to the less-privileged "hr_staff" role.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->get(['id', 'role'])->each(function ($user) {
            $role = strtolower((string) $user->role);
            $isEmployee = $role === User::ROLE_EMPLOYEE;
            $isAdmin = $role === User::ROLE_ADMIN
                || (str_contains($role, 'admin') && ! str_contains($role, 'hr'));

            DB::table('users')->where('id', $user->id)->update([
                'role' => $isEmployee
                    ? User::ROLE_EMPLOYEE
                    : ($isAdmin ? User::ROLE_ADMIN : User::ROLE_HR_STAFF),
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default(User::ROLE_HR_STAFF)->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('hr_administrator')->change();
        });
    }
};
