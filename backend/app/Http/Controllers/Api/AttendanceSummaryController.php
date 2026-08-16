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
     * row per active employee.
     *
     * There's no real Time & Attendance system feeding this yet, so an
     * employee without an entry defaults to full attendance for the
     * cutoff (present every working day, no lates/overtime/absences)
     * rather than zero — HR only needs to edit the exceptions, not type
     * in every number for every employee.
     */
    public function indexForRun(PayrollRun $payrollRun)
    {
        $existing = AttendanceSummary::where('payroll_run_id', $payrollRun->id)
            ->get()
            ->keyBy('employee_id');

        $fullAttendanceDays = $payrollRun->workingDays();

        $rows = Employee::where('employment_status', 'active')
            ->orderBy('last_name')
            ->get()
            ->map(function (Employee $employee) use ($payrollRun, $existing, $fullAttendanceDays) {
                if ($existing->has($employee->id)) {
                    return $existing->get($employee->id);
                }

                return new AttendanceSummary([
                    'payroll_run_id' => $payrollRun->id,
                    'employee_id' => $employee->id,
                    'employee_name' => "{$employee->first_name} {$employee->last_name}",
                    'days_present' => $fullAttendanceDays,
                    'late_minutes' => 0,
                    'overtime_hours' => 0,
                    'unpaid_absence_days' => 0,
                    'cash_advance' => 0,
                    'tax_refund' => 0,
                    'sl_cash_conversion' => 0,
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
            'cashAdvance' => ['nullable', 'numeric', 'min:0'],
            'taxRefund' => ['nullable', 'numeric', 'min:0'],
            'slCashConversion' => ['nullable', 'numeric', 'min:0'],
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
                'cash_advance' => $data['cashAdvance'] ?? 0,
                'tax_refund' => $data['taxRefund'] ?? 0,
                'sl_cash_conversion' => $data['slCashConversion'] ?? 0,
            ]
        );

        return new AttendanceSummaryResource($summary);
    }
}
