<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceDemoDay;
use App\Services\DailyAttendanceCalculator;
use Illuminate\Http\Request;

class AttendanceDemoController extends Controller
{
    private const HOURLY_RATE = 100.0; // placeholder para sa demo

    public function __construct(private DailyAttendanceCalculator $calc)
    {
    }

    public function index(Request $request)
    {
        $d = $request->validate([
            'start' => ['required', 'date_format:Y-m-d'],
            'end' => ['required', 'date_format:Y-m-d', 'after_or_equal:start'],
            'employeeId' => ['nullable', 'uuid'],
        ]);

        $q = AttendanceDemoDay::whereBetween('date', [$d['start'], $d['end']])->orderBy('date');
        if (! empty($d['employeeId'])) {
            $q->where('employee_id', $d['employeeId']);
        }

        return response()->json($q->get()->map(fn ($x) => $this->present($x))->values());
    }

    public function save(Request $request)
    {
        $d = $request->validate([
            'employeeId' => ['required', 'uuid'],
            'date' => ['required', 'date_format:Y-m-d'],
            'timeIn' => ['required', 'date_format:H:i'],
            'timeOut' => ['required', 'date_format:H:i', 'after:timeIn'],
        ]);

        return response()->json($this->present($this->upsert($d, [
            'time_in' => $d['timeIn'], 'time_out' => $d['timeOut'], 'is_absent' => false,
        ])));
    }

    public function markAbsent(Request $request)
    {
        $d = $request->validate([
            'employeeId' => ['required', 'uuid'],
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        return response()->json($this->present($this->upsert($d, [
            'time_in' => null, 'time_out' => null, 'is_absent' => true,
        ])));
    }

    public function reset(Request $request)
    {
        $d = $request->validate([
            'employeeId' => ['required', 'uuid'],
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        AttendanceDemoDay::where('employee_id', $d['employeeId'])->whereDate('date', $d['date'])->delete();

        return response()->json(['ok' => true]);
    }

    private function upsert(array $d, array $values): AttendanceDemoDay
    {
        return AttendanceDemoDay::updateOrCreate(
            ['employee_id' => $d['employeeId'], 'date' => $d['date']],
            $values
        );
    }

    private function present(AttendanceDemoDay $x): array
    {
        $in = $x->time_in ? substr($x->time_in, 0, 5) : null;
        $out = $x->time_out ? substr($x->time_out, 0, 5) : null;
        $day = $this->calc->compute($in, $out, $x->is_absent);
        $pay = $this->calc->pay($day, self::HOURLY_RATE);

        return [
            'employeeId' => $x->employee_id,
            'date' => $x->date->toDateString(),
            'timeIn' => $in,
            'timeOut' => $out,
            'status' => $day['status'],
            'workedMinutes' => $day['workedMinutes'],
            'lateMinutes' => $day['lateMinutes'],
            'undertimeMinutes' => $day['undertimeMinutes'],
            'overtimeHours' => $day['overtimeHours'],
            'regularPay' => $pay['regular'],
            'otPay' => $pay['otPay'],
            'lateDeduction' => $pay['lateDeduction'],
            'undertimeDeduction' => $pay['undertimeDeduction'],
            'netPay' => $pay['net'],
        ];
    }
}