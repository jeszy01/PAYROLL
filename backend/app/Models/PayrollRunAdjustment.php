<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PayrollRunAdjustment extends Model
{
    use HasUuids;
    protected $connection = 'payroll';
    protected $fillable = ['payroll_run_id', 'employee_id', 'sl_cash_conversion'];
}