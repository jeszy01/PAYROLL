<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceSummaryResource;
use App\Models\AttendanceSummary;
use App\Models\Employee;
use App\Models\PayrollRun;
use Illuminate\Http\Request;

class AttendanceSummaryController extends Controller
{
    /**
     * List attendance summaries entered for a payroll run. Includes one
     * row per active employee — employees without an entry yet default
     * to zero, so the frontend can render an editable row for everyone.
     */
    public function indexForRun(PayrollRun $payrollRun)
    {
        $existing = AttendanceSummary::where('payroll_run_id', $payrollRun->id)
            ->get()
            ->keyBy('employee_id');

        $rows = Employee::where('employment_status', 'active')
            ->orderBy('last_name')
            ->get()
            ->map(function (Employee $employee) use ($payrollRun, $existing) {
                if ($existing->has($employee->id)) {
                    return $existing->get($employee->id);
                }

                return new AttendanceSummary([
                    'payroll_run_id' => $payrollRun->id,
                    'employee_id' => $employee->id,
                    'employee_name' => "{$employee->first_name} {$employee->last_name}",
                    'days_present' => 0,
                    'late_minutes' => 0,
                    'overtime_hours' => 0,
                    'unpaid_absence_days' => 0,
                ]);
            });

        return AttendanceSummaryResource::collection($rows);
    }

    /**
     * Create or update one employee's attendance summary for a run.
     */
    public function upsert(Request $request, PayrollRun $payrollRun)
    {
        $data = $request->validate([
            'employeeId' => ['required', 'uuid', 'exists:employees,id'],
            'daysPresent' => ['required', 'numeric', 'min:0', 'max:31'],
            'lateMinutes' => ['required', 'integer', 'min:0'],
            'overtimeHours' => ['required', 'numeric', 'min:0'],
            'unpaidAbsenceDays' => ['required', 'numeric', 'min:0', 'max:31'],
        ]);

        $employee = Employee::findOrFail($data['employeeId']);

        $summary = AttendanceSummary::updateOrCreate(
            ['payroll_run_id' => $payrollRun->id, 'employee_id' => $employee->id],
            [
                'employee_name' => "{$employee->first_name} {$employee->last_name}",
                'days_present' => $data['daysPresent'],
                'late_minutes' => $data['lateMinutes'],
                'overtime_hours' => $data['overtimeHours'],
                'unpaid_absence_days' => $data['unpaidAbsenceDays'],
            ]
        );

        return new AttendanceSummaryResource($summary);
    }
}
