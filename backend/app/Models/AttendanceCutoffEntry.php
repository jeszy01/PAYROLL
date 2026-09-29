<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceCutoffEntry extends Model
{
    use HasUuids;
    protected $connection = 'attendance';

    protected $fillable = [
        'attendance_cutoff_id', 'employee_id', 'employee_name',
        'days_present', 'unpaid_absence_days', 'late_minutes', 'overtime_hours',
    ];

    protected function casts(): array
    {
        return [
            'days_present' => 'decimal:2',
            'unpaid_absence_days' => 'decimal:2',
            'overtime_hours' => 'decimal:2',
        ];
    }

    public function cutoff(): BelongsTo
    {
        return $this->belongsTo(AttendanceCutoff::class, 'attendance_cutoff_id');
    }
}