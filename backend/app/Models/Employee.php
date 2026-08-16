<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'employee_number', 'first_name', 'last_name', 'email', 'phone',
        'department', 'position', 'employment_status', 'date_hired',
        'base_salary', 'loan_deduction_per_cutoff',
        'transportation_allowance', 'rice_subsidy_allowance',
        'sss_loan_per_cutoff', 'hdmf_loan_per_cutoff',
    ];

    protected function casts(): array
    {
        return [
            'date_hired' => 'date',
            'base_salary' => 'decimal:2',
            'loan_deduction_per_cutoff' => 'decimal:2',
            'transportation_allowance' => 'decimal:2',
            'rice_subsidy_allowance' => 'decimal:2',
            'sss_loan_per_cutoff' => 'decimal:2',
            'hdmf_loan_per_cutoff' => 'decimal:2',
        ];
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }
}
