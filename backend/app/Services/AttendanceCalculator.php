<?php

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSummary;
use App\Models\Employee;
use App\Models\PayrollRun;
use Illuminate\Support\Collection;

/**
 * Derives attendance data for payroll purely from real Employee
 * Self-Service (ESS) clock-in/out records — there is no manual
 * attendance-entry step anymore. An employee with ESS clock-in/out
 * records this pay period gets real days_present/late_minutes/
 * overtime_hours computed from those records. An employee with no ESS
 * usage this period (no linked login, or simply didn't clock in) falls
 * back to the "full attendance" assumption (present every working day,
 * no lates/overtime) since there's no other source of truth for them.
 *
 * Nothing here is persisted — every call recomputes live from
 * AttendanceRecord, so results always reflect the latest clock-ins.
 */
class AttendanceCalculator
{
    /**
     * One (unsaved) AttendanceSummary per active employee, keyed by
     * employee_id.
     *
     * @return Collection<string, AttendanceSummary>
     */
    public function forPayrollRun(PayrollRun $payrollRun): Collection
    {
        $fullAttendanceDays = $payrollRun->workingDays();

        $recordsByEmployee = AttendanceRecord::whereBetween('date', [$payrollRun->pay_period_start, $payrollRun->pay_period_end])
            ->get()
            ->groupBy('employee_id');

        return Employee::where('employment_status', 'active')
            ->orderBy('last_name')
            ->get()
            ->keyBy('id')
            ->map(fn (Employee $employee) => $this->forEmployee($payrollRun, $employee, $fullAttendanceDays, $recordsByEmployee->get($employee->id)));
    }

    private function forEmployee(PayrollRun $payrollRun, Employee $employee, int $fullAttendanceDays, ?Collection $records): AttendanceSummary
    {
        $availableDays = $employee->date_hired && $employee->date_hired->gt($payrollRun->pay_period_start)
            ? $payrollRun->workingDaysFrom($employee->date_hired)
            : $fullAttendanceDays;

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
    }
}