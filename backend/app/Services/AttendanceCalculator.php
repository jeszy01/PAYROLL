<?php

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSummary;
use App\Models\Employee;
use App\Models\PayrollRun;
use Illuminate\Support\Collection;
use App\Models\AttendanceCutoff;
use App\Models\AttendanceCutoffEntry;

/**
 * Derives attendance data for payroll from saved AttendanceRecord rows
 * that fall within the payroll run's cutoff dates. Saved attendance is
 * final (no edit or delete endpoint exists), so what is read here is
 * always the recorded truth.
 *
 * A day with no saved record counts as present. Only a saved "absent"
 * record reduces pay, so a forgotten entry never costs an employee
 * their salary.
 *
 * Nothing here is persisted: every call recomputes live from
 * AttendanceRecord.
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

        $recordsByEmployee = AttendanceRecord::whereBetween('date', [
                $payrollRun->pay_period_start->toDateString(),
                $payrollRun->pay_period_end->toDateString(),
            ])
            ->get()
            ->groupBy('employee_id');

        return Employee::where('employment_status', 'active')
            ->orderBy('last_name')
            ->get()
            ->keyBy('id')
            ->map(fn (Employee $employee) => $this->forEmployee(
                $payrollRun,
                $employee,
                $fullAttendanceDays,
                $recordsByEmployee->get($employee->id)
            ));
    }

        /**
     * One (unsaved) AttendanceSummary per employee in a saved attendance
     * cutoff, keyed by employee_id. Only employees who are still active
     * are included.
     *
     * @return Collection<string, AttendanceSummary>
     */
    public function forCutoff(AttendanceCutoff $cutoff): Collection
    {
        $activeIds = Employee::where('employment_status', 'active')->pluck('id')->all();

        return $cutoff->entries()
            ->get()
            ->filter(fn (AttendanceCutoffEntry $e) => in_array($e->employee_id, $activeIds, true))
            ->keyBy('employee_id')
            ->map(fn (AttendanceCutoffEntry $e) => new AttendanceSummary([
                'employee_id' => $e->employee_id,
                'employee_name' => $e->employee_name,
                'days_present' => $e->days_present,
                'late_minutes' => $e->late_minutes,
                'overtime_hours' => $e->overtime_hours,
                'unpaid_absence_days' => $e->unpaid_absence_days,
                'cash_advance' => 0,
                'sl_cash_conversion' => 0,
            ]));
    }

    private function forEmployee(PayrollRun $payrollRun, Employee $employee, int $fullAttendanceDays, ?Collection $records): AttendanceSummary
    {
        $availableDays = $employee->date_hired && $employee->date_hired->gt($payrollRun->pay_period_start)
            ? $payrollRun->workingDaysFrom($employee->date_hired)
            : $fullAttendanceDays;

        $records = $records ?? collect();

        $unpaidAbsenceDays = $records->where('status', 'absent')->count();
        $daysPresent = max($availableDays - $unpaidAbsenceDays, 0);

        return new AttendanceSummary([
            'payroll_run_id' => $payrollRun->id,
            'employee_id' => $employee->id,
            'employee_name' => "{$employee->first_name} {$employee->last_name}",
            'days_present' => $daysPresent,
            'late_minutes' => (int) $records->sum('minutes_late'),
            'overtime_hours' => round($records->sum('overtime_minutes') / 60, 2),
            'unpaid_absence_days' => $unpaidAbsenceDays,
            'cash_advance' => 0,
            'sl_cash_conversion' => 0,
        ]);
    }
}