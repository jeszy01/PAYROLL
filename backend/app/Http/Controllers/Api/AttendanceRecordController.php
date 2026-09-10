<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ResolvesOwnEmployee;
use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceRecordResource;
use App\Models\AttendanceRecord;
use App\Models\Holiday;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AttendanceRecordController extends Controller
{
    use ResolvesOwnEmployee;

    private const TIMEZONE = 'Asia/Manila';
    private const GRACE_MINUTES = 15;

    public function today(Request $request)
    {
        $employee = $this->ownEmployee($request);
        $today = Carbon::now(self::TIMEZONE)->toDateString();

        $record = AttendanceRecord::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        return response()->json([
            'record' => $record ? new AttendanceRecordResource($record) : null,
            'shiftStart' => $employee->shift_start,
            'shiftEnd' => $employee->shift_end,
            'holiday' => $this->holidayFor($today),
        ]);
    }

    public function clockIn(Request $request)
    {
        $employee = $this->ownEmployee($request);
        $today = Carbon::now(self::TIMEZONE)->toDateString();
        // Stored/compared as the app's default timezone (UTC) — Eloquent's
        // datetime cast round-trips through a naive string using
        // config('app.timezone'), so a Carbon instance tagged Asia/Manila
        // would come back mislabeled (same wall-clock digits, wrong
        // offset) after a save+reload. $shiftStart below is still parsed
        // in Asia/Manila for the correct absolute instant, and comparisons
        // between Carbon instances are timezone-label-independent.
        $now = Carbon::now();

        $record = AttendanceRecord::firstOrNew([
            'employee_id' => $employee->id,
            'date' => $today,
        ]);

        if ($record->exists && $record->timestamp_in) {
            return response()->json(['message' => 'You have already clocked in today.'], 422);
        }

        $shiftStart = Carbon::parse("{$today} {$employee->shift_start}", self::TIMEZONE);
        $graceDeadline = $shiftStart->copy()->addMinutes(self::GRACE_MINUTES);

        if ($now->lte($graceDeadline)) {
            $record->status_in = 'on_time';
            $record->minutes_late = 0;
        } else {
            $record->status_in = 'late';
            $record->minutes_late = (int) round($shiftStart->diffInMinutes($now));
        }

        $record->timestamp_in = $now;

        $holiday = $this->holidayFor($today);
        if ($holiday) {
            $record->holiday_type = $holiday['type'];
        }

        $record->save();

        return new AttendanceRecordResource($record);
    }

    public function clockOut(Request $request)
    {
        $employee = $this->ownEmployee($request);
        $today = Carbon::now(self::TIMEZONE)->toDateString();
        $now = Carbon::now(); // see comment in clockIn() re: storage timezone

        $record = AttendanceRecord::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        if (! $record || ! $record->timestamp_in) {
            return response()->json(['message' => 'Clock in before clocking out.'], 422);
        }

        if ($record->timestamp_out) {
            return response()->json(['message' => 'You have already clocked out today.'], 422);
        }

        $shiftEnd = Carbon::parse("{$today} {$employee->shift_end}", self::TIMEZONE);

        if ($now->lte($shiftEnd)) {
            $record->status_out = 'on_time';
            $record->overtime_minutes = 0;
        } else {
            $record->status_out = 'overtime';
            $record->overtime_minutes = (int) round($shiftEnd->diffInMinutes($now));
        }

        $record->timestamp_out = $now;
        $record->save();

        return new AttendanceRecordResource($record);
    }

    public function history(Request $request)
    {
        $employee = $this->ownEmployee($request);

        return AttendanceRecordResource::collection(
            AttendanceRecord::where('employee_id', $employee->id)
                ->orderByDesc('date')
                ->limit(60)
                ->get()
        );
    }

    private function holidayFor(string $date): ?array
    {
        $holiday = Holiday::whereDate('date', $date)->first();

        if (! $holiday) {
            return null;
        }

        return ['name' => $holiday->name, 'type' => $holiday->type];
    }
}
