<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AttendanceSummary extends Model
{
    use HasUuids;

    protected $fillable = [
        'payroll_run_id', 'employee_id', 'employee_name',
        'days_present', 'late_minutes', 'overtime_hours', 'unpaid_absence_days',
    ];

    protected function casts(): array
    {
        return [
            'days_present' => 'decimal:2',
            'overtime_hours' => 'decimal:2',
            'unpaid_absence_days' => 'decimal:2',
        ];
    }
}
