<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Str;

class AuditLogger
{
    /**
     * Never throws: a logging failure must not break the action being logged.
     */
    public static function log(string $action, string $module, string $description, ?User $user = null): void
    {
        try {
            $user ??= request()->user();

            AuditLog::create([
                'user_id' => $user?->id,
                'user_name' => $user?->name,
                'user_role' => $user?->role,
                'action' => $action,
                'module' => $module,
                'description' => Str::limit($description, 490),
                'ip_address' => request()->ip(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}