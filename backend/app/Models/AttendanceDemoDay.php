<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AttendanceDemoDay extends Model
{
    use HasUuids;
    protected $connection = 'attendance';
    protected $fillable = ['employee_id', 'date', 'time_in', 'time_out', 'is_absent'];

    protected function casts(): array
    {
        return ['date' => 'date', 'is_absent' => 'boolean'];
    }
}