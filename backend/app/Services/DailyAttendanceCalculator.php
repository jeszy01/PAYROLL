<?php

namespace App\Services;

/**
 * Pure computation for one day of simulated attendance.
 * No database access: give it Time In / Time Out, get numbers back.
 */
class DailyAttendanceCalculator
{
    public const CONFIG = [
        'scheduleStart' => '08:00',
        'scheduleEnd' => '17:00',
        'breakMinutes' => 60,
        'lateBlockMinutes' => 60,       // round up per whole hour
        'undertimeBlockMinutes' => 60,  // round up per whole hour
        'graceMinutes' => 0,
        'otMultiplier' => 1.25,         // placeholder
        'regularHours' => 8,
    ];

    /** @param string|null $timeIn "HH:MM", null when absent */
    public function compute(?string $timeIn, ?string $timeOut, bool $absent = false): array
    {
        $c = self::CONFIG;

        if ($absent || $timeIn === null || $timeOut === null) {
            return [
                'status' => 'absent',
                'workedMinutes' => 0,
                'lateMinutes' => 0, 'lateBlocks' => 0,
                'undertimeMinutes' => 0, 'undertimeBlocks' => 0,
                'overtimeMinutes' => 0, 'overtimeHours' => 0.0,
            ];
        }

        $in = $this->toMinutes($timeIn);
        $out = $this->toMinutes($timeOut);
        $start = $this->toMinutes($c['scheduleStart']);
        $end = $this->toMinutes($c['scheduleEnd']);

        $lateMinutes = max(0, $in - $start - $c['graceMinutes']);
        $undertimeMinutes = max(0, $end - $out);
        $overtimeMinutes = max(0, $out - $end);
        $workedMinutes = max(0, ($out - $in) - $c['breakMinutes']);

        return [
            'status' => 'present',
            'workedMinutes' => $workedMinutes,
            'lateMinutes' => $lateMinutes,
            'lateBlocks' => (int) ceil($lateMinutes / $c['lateBlockMinutes']),
            'undertimeMinutes' => $undertimeMinutes,
            'undertimeBlocks' => (int) ceil($undertimeMinutes / $c['undertimeBlockMinutes']),
            'overtimeMinutes' => $overtimeMinutes,
            'overtimeHours' => round($overtimeMinutes / 60, 2),
        ];
    }

    /** Peso amounts for one day, given an hourly rate. */
    public function pay(array $day, float $hourlyRate): array
    {
        $c = self::CONFIG;

        if ($day['status'] === 'absent') {
            return ['regular' => 0.0, 'otPay' => 0.0, 'lateDeduction' => 0.0, 'undertimeDeduction' => 0.0, 'net' => 0.0];
        }

        $regular = round($hourlyRate * $c['regularHours'], 2);
        $otPay = round($hourlyRate * $c['otMultiplier'] * $day['overtimeHours'], 2);
        $late = round($hourlyRate * $day['lateBlocks'], 2);
        $under = round($hourlyRate * $day['undertimeBlocks'], 2);

        return [
            'regular' => $regular,
            'otPay' => $otPay,
            'lateDeduction' => $late,
            'undertimeDeduction' => $under,
            'net' => round($regular + $otPay - $late - $under, 2),
        ];
    }

    private function toMinutes(string $hhmm): int
    {
        [$h, $m] = array_map('intval', explode(':', $hhmm));
        return $h * 60 + $m;
    }
}