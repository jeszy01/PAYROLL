<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceSummaryResource;
use App\Models\PayrollRun;
use App\Services\AttendanceCalculator;

class AttendanceSummaryController extends Controller
{
    /**
     * List attendance summaries for a payroll run — one row per active
     * employee, always computed live from real Employee Self-Service
     * (ESS) clock-in/out records for this pay period. There is no
     * manual attendance-entry step: HR reviews these numbers, they
     * don't edit them.
     */
    public function indexForRun(PayrollRun $payrollRun, AttendanceCalculator $calculator)
    {
        return AttendanceSummaryResource::collection($calculator->forPayrollRun($payrollRun)->values());
    }
}