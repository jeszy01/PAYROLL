<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payslip extends Model
{
    use HasUuids;

    protected $fillable = [
        'payroll_run_id', 'employee_id', 'employee_name', 'department',
        'basic_pay', 'overtime_pay', 'allowances', 'gross_pay',
        'sss_contribution', 'philhealth_contribution', 'pagibig_contribution',
        'withholding_tax', 'other_deductions', 'total_deductions', 'net_pay', 'status',
        'email_sent_at', 'sms_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'basic_pay' => 'decimal:2',
            'overtime_pay' => 'decimal:2',
            'allowances' => 'decimal:2',
            'gross_pay' => 'decimal:2',
            'sss_contribution' => 'decimal:2',
            'philhealth_contribution' => 'decimal:2',
            'pagibig_contribution' => 'decimal:2',
            'withholding_tax' => 'decimal:2',
            'other_deductions' => 'decimal:2',
            'total_deductions' => 'decimal:2',
            'net_pay' => 'decimal:2',
            'email_sent_at' => 'datetime',
            'sms_sent_at' => 'datetime',
        ];
    }

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
