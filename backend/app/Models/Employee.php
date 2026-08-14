<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasUuids;

    protected $fillable = [
        'employee_number', 'first_name', 'last_name', 'email', 'phone',
        'department', 'position', 'employment_status', 'date_hired', 'base_salary',
    ];

    protected function casts(): array
    {
        return [
            'date_hired' => 'date',
            'base_salary' => 'decimal:2',
        ];
    }
}
