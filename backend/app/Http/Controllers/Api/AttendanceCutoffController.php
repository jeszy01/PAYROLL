<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceCutoff;
use App\Models\AttendanceCutoffEntry;
use App\Models\Employee;
use App\Services\AuditLogger;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PayrollRun;

class AttendanceCutoffController extends Controller
{
    /** All saved cutoffs, newest period first. */
  public function index()
{
    $cutoffs = AttendanceCutoff::withCount('entries')
        ->orderByDesc('period_start')
        ->get();

    // magkaibang database, kaya hiwalay na query
    $runIds = PayrollRun::whereIn('attendance_cutoff_id', $cutoffs->pluck('id'))
        ->pluck('id', 'attendance_cutoff_id');

    return response()->json(
        $cutoffs->map(fn ($c) => $this->present($c, $runIds[$c->id] ?? null))->values()
    );
}

    /** One cutoff with its per-employee totals. */
    public function show(AttendanceCutoff $attendanceCutoff)
    {
        $entries = $attendanceCutoff->entries()->orderBy('employee_name')->get();

        return response()->json(array_merge($this->present($attendanceCutoff), [
            'entries' => $entries->map(fn ($e) => $this->presentEntry($e))->values(),
        ]));
    }

    /**
     * Starting rows for the Create attendance form: every active employee
     * with full attendance for the period (weekdays only, prorated from
     * the hire date for mid-period hires). Nothing is saved here.
     */
    public function template(Request $request)
    {
        $data = $request->validate([
            'periodStart' => ['required', 'date_format:Y-m-d'],
            'periodEnd' => ['required', 'date_format:Y-m-d', 'after_or_equal:periodStart'],
        ]);

        $start = Carbon::parse($data['periodStart']);
        $end = Carbon::parse($data['periodEnd']);

        $rows = Employee::where('employment_status', 'active')
            ->orderBy('last_name')
            ->get()
            ->map(function (Employee $employee) use ($start, $end) {
                $from = $employee->date_hired && $employee->date_hired->gt($start)
                    ? Carbon::parse($employee->date_hired)
                    : $start;

                return [
                    'employeeId' => $employee->id,
                    'employeeName' => "{$employee->first_name} {$employee->last_name}",
                    'daysPresent' => $this->weekdays($from, $end),
                    'unpaidAbsenceDays' => 0,
                    'lateMinutes' => 0,
                    'overtimeHours' => 0,
                ];
            })
            ->values();

        return response()->json($rows);
    }

    /**
     * Create a cutoff and all its entries in one go. It is locked
     * immediately: there is no update or delete endpoint.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'periodStart' => ['required', 'date_format:Y-m-d'],
            'periodEnd' => ['required', 'date_format:Y-m-d', 'after_or_equal:periodStart'],
            'entries' => ['required', 'array', 'min:1'],
            'entries.*.employeeId' => ['required', 'uuid', 'distinct'],
            'entries.*.daysPresent' => ['required', 'numeric', 'min:0', 'max:31'],
            'entries.*.unpaidAbsenceDays' => ['required', 'numeric', 'min:0', 'max:31'],
            'entries.*.lateMinutes' => ['required', 'integer', 'min:0', 'max:44640'],
            'entries.*.overtimeHours' => ['required', 'numeric', 'min:0', 'max:744'],
        ]);

      

        $employees = Employee::where('employment_status', 'active')->get()->keyBy('id');

        foreach ($data['entries'] as $entry) {
            if (! $employees->has($entry['employeeId'])) {
                return response()->json([
                    'message' => 'One of the employees is not an active employee.',
                ], 422);
            }
        }

        $cutoff = DB::connection('attendance')->transaction(function () use ($data, $employees) {
            $cutoff = AttendanceCutoff::create([
                'label' => $data['label'],
                'period_start' => $data['periodStart'],
                'period_end' => $data['periodEnd'],
                'locked_at' => now(),
            ]);

            foreach ($data['entries'] as $entry) {
                $employee = $employees->get($entry['employeeId']);

                AttendanceCutoffEntry::create([
                    'attendance_cutoff_id' => $cutoff->id,
                    'employee_id' => $employee->id,
                    'employee_name' => "{$employee->first_name} {$employee->last_name}",
                    'days_present' => $entry['daysPresent'],
                    'unpaid_absence_days' => $entry['unpaidAbsenceDays'],
                    'late_minutes' => $entry['lateMinutes'],
                    'overtime_hours' => $entry['overtimeHours'],
                ]);
            }

            return $cutoff;
        });

        AuditLogger::log('create', 'attendance', "Saved attendance cutoff {$cutoff->label} (" . count($data['entries']) . ' employees)');

        $entries = $cutoff->entries()->orderBy('employee_name')->get();

        return response()->json(array_merge($this->present($cutoff), [
            'entries' => $entries->map(fn ($e) => $this->presentEntry($e))->values(),
        ]), 201);
    }

    private function weekdays(Carbon $from, Carbon $to): int
    {
        $count = 0;
        for ($d = $from->copy(); $d->lte($to); $d->addDay()) {
            if (! $d->isWeekend()) {
                $count++;
            }
        }

        return $count;
    }

   private function present(AttendanceCutoff $c, ?string $payrollRunId = null): array
{
    return [
        'id' => $c->id,
        'label' => $c->label,
        'periodStart' => $c->period_start->toDateString(),
        'periodEnd' => $c->period_end->toDateString(),
        'isLocked' => $c->locked_at !== null,
        'entryCount' => $c->entries_count ?? null,
        'payrollRunId' => $payrollRunId,
    ];
}

    private function presentEntry(AttendanceCutoffEntry $e): array
    {
        return [
            'employeeId' => $e->employee_id,
            'employeeName' => $e->employee_name,
            'daysPresent' => (float) $e->days_present,
            'unpaidAbsenceDays' => (float) $e->unpaid_absence_days,
            'lateMinutes' => (int) $e->late_minutes,
            'overtimeHours' => (float) $e->overtime_hours,
        ];
    }
}