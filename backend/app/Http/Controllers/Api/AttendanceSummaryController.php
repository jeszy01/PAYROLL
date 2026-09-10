<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceSummaryResource;
use App\Models\AttendanceRecord;
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
     * An employee without a saved entry gets a default built one of two
     * ways:
     *   - If they have Employee Self-Service clock-in/out records inside
     *     this run's pay period, the default is DERIVED from those real
     *     records (days_present/late_minutes/overtime_hours, plus any
     *     working day in the period with no clock-in at all counted as
     *     an unpaid absence) — so ESS attendance actually feeds payroll
     *     instead of silently being ignored.
     *   - Otherwise (no ESS usage this period — most employees don't
     *     have a linked login) it falls back to the original "full
     *     attendance" assumption (present every working day, no lates/
     *     overtime/absences) — HR only edits the exceptions by hand.
     *
     * For a mid-period hire, "full attendance" means every working day
     * from date_hired through the period end, not the whole cutoff —
     * otherwise a new hire's default basic pay would be charged at the
     * full-period rate for days before they were even employed.
     */
    public function indexForRun(PayrollRun $payrollRun)
    {
        $existing = AttendanceSummary::where('payroll_run_id', $payrollRun->id)
            ->get()
            ->keyBy('employee_id');

        $fullAttendanceDays = $payrollRun->workingDays();

        $recordsByEmployee = AttendanceRecord::whereBetween('date', [$payrollRun->pay_period_start, $payrollRun->pay_period_end])
            ->get()
            ->groupBy('employee_id');

        $rows = Employee::where('employment_status', 'active')
            ->orderBy('last_name')
            ->get()
            ->map(function (Employee $employee) use ($payrollRun, $existing, $fullAttendanceDays, $recordsByEmployee) {
                if ($existing->has($employee->id)) {
                    return $existing->get($employee->id);
                }

                $availableDays = $employee->date_hired && $employee->date_hired->gt($payrollRun->pay_period_start)
                    ? $payrollRun->workingDaysFrom($employee->date_hired)
                    : $fullAttendanceDays;

                $records = $recordsByEmployee->get($employee->id);

                if ($records && $records->isNotEmpty()) {
                    $daysPresent = $records->filter(fn ($r) => $r->timestamp_in !== null)->count();

                    return new AttendanceSummary([
                        'payroll_run_id' => $payrollRun->id,
                        'employee_id' => $employee->id,
                        'employee_name' => "{$employee->first_name} {$employee->last_name}",
                        'days_present' => $daysPresent,
                        'late_minutes' => $records->sum('minutes_late'),
                        'overtime_hours' => round($records->sum('overtime_minutes') / 60, 2),
                        'unpaid_absence_days' => max(0, $availableDays - $daysPresent),
                        'cash_advance' => 0,
                        'tax_refund' => 0,
                        'sl_cash_conversion' => 0,
                    ]);
                }

                return new AttendanceSummary([
                    'payroll_run_id' => $payrollRun->id,
                    'employee_id' => $employee->id,
                    'employee_name' => "{$employee->first_name} {$employee->last_name}",
                    'days_present' => $availableDays,
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
