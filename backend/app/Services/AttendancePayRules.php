<?php

namespace App\Services;

/**
 * Iisang lugar ng computation para sa Late, Undertime, Overtime at
 * sahod ng isang araw (bago ang SSS, PhilHealth, HDMF, tax at loans).
 *
 * Ang Attendance ay input lang. Ang Payroll ang gumagamit ng class na ito.
 * Walang database access dito, kaya madaling i-test.
 *
 * Ilagay sa: backend/app/Services/AttendancePayRules.php
 */
class AttendancePayRules
{
    /**
     * Demo defaults. Palitan kapag nakumpirma na ang totoong policy.
     *
     * mode:          'per_minute' | 'block'
     * blockMinutes:  15 | 30 | 60 (para sa mode 'block')
     * rounding:      'up' | 'down' | 'nearest'
     * graceMinutes:  hanggang dito, walang bawas. Kapag lumampas,
     *                buong raw minutes ang bibilangin.
     */
    public static function defaultPolicy(): array
    {
        return [
            'scheduleStart' => '08:00',
            'scheduleEnd' => '17:00',
            'breakMinutes' => 60,
            'lateRule' => ['mode' => 'block', 'blockMinutes' => 60, 'rounding' => 'up', 'graceMinutes' => 0],
            'undertimeRule' => ['mode' => 'block', 'blockMinutes' => 60, 'rounding' => 'up', 'graceMinutes' => 0],
            'overtimeRule' => [
                'mode' => 'block', 'blockMinutes' => 60, 'rounding' => 'down', 'graceMinutes' => 0,
                'minimumMinutes' => 60, 'multiplier' => 1.25,
            ],
        ];
    }

    /** "HH:mm" o "HH:mm:ss" -> minuto mula hatinggabi. */
    public static function toMinutes(string $time): int
    {
        $parts = explode(':', $time);

        return ((int) $parts[0]) * 60 + (int) ($parts[1] ?? 0);
    }

    /** Ang iisang function para sa lahat ng rule: raw minutes -> billable minutes. */
    public static function billableMinutes(int $rawMinutes, array $rule): int
    {
        if ($rawMinutes <= 0) {
            return 0;
        }
        if ($rawMinutes <= (int) ($rule['graceMinutes'] ?? 0)) {
            return 0;
        }
        if (($rule['mode'] ?? 'per_minute') === 'per_minute') {
            return $rawMinutes;
        }

        $block = (int) ($rule['blockMinutes'] ?? 60);
        $ratio = $rawMinutes / $block;
        $rounding = $rule['rounding'] ?? 'up';

        $blocks = match ($rounding) {
            'down' => (int) floor($ratio),
            'nearest' => (int) round($ratio),
            default => (int) ceil($ratio),
        };

        return $blocks * $block;
    }

    /**
     * Sahod ng isang araw, laging kinokompyut mula sa buong record ng araw
     * (hindi add/subtract), kaya ligtas ang double-save at reset.
     *
     * @param  array  $policy      Tingnan ang defaultPolicy().
     * @param  float  $hourlyRate  Galing sa employee: (base_salary / 2 / workingDays) / 8.
     * @param  string $status      'present' | 'absent'
     * @param  string|null $timeIn   "HH:mm" o "HH:mm:ss"
     * @param  string|null $timeOut  Kung null, provisional (projected hanggang scheduleEnd).
     */
    public static function computeDay(
        array $policy,
        float $hourlyRate,
        string $status,
        ?string $timeIn,
        ?string $timeOut = null
    ): array {
        $zero = [
            'status' => 'absent', 'provisional' => false,
            'workedMinutes' => 0, 'lateMinutes' => 0, 'undertimeMinutes' => 0, 'overtimeMinutes' => 0,
            'regularPay' => 0.0, 'overtimePay' => 0.0, 'lateDeduction' => 0.0, 'undertimeDeduction' => 0.0,
            'netPay' => 0.0,
        ];

        if ($status === 'absent' || ! $timeIn) {
            return $zero;
        }

        $start = self::toMinutes($policy['scheduleStart']);
        $end = self::toMinutes($policy['scheduleEnd']);
        $breakMinutes = (int) $policy['breakMinutes'];

        $tin = self::toMinutes($timeIn);
        $provisional = ! $timeOut;
        $tout = $timeOut ? self::toMinutes($timeOut) : $end;

        $regularHours = ($end - $start - $breakMinutes) / 60;

        $lateRaw = max(0, $tin - $start);
        $undertimeRaw = max(0, $end - $tout);
        $otRaw = max(0, $tout - $end);

        $lateBilled = self::billableMinutes($lateRaw, $policy['lateRule']);
        $undertimeBilled = self::billableMinutes($undertimeRaw, $policy['undertimeRule']);

        $ot = $policy['overtimeRule'];
        $otBilled = $otRaw < (int) $ot['minimumMinutes'] ? 0 : self::billableMinutes($otRaw, $ot);

        $regularPay = round($regularHours * $hourlyRate, 2);
        $overtimePay = round(($otBilled / 60) * $hourlyRate * (float) $ot['multiplier'], 2);
        $lateDeduction = round(($lateBilled / 60) * $hourlyRate, 2);
        $undertimeDeduction = round(($undertimeBilled / 60) * $hourlyRate, 2);

        return [
            'status' => $provisional ? 'in_progress' : 'present',
            'provisional' => $provisional,
            'workedMinutes' => max(0, $tout - $tin - $breakMinutes),
            'lateMinutes' => $lateRaw,
            'undertimeMinutes' => $undertimeRaw,
            'overtimeMinutes' => $otRaw,
            'regularPay' => $regularPay,
            'overtimePay' => $overtimePay,
            'lateDeduction' => $lateDeduction,
            'undertimeDeduction' => $undertimeDeduction,
            'netPay' => round($regularPay + $overtimePay - $lateDeduction - $undertimeDeduction, 2),
        ];
    }

    /**
     * Kabuuan ng cutoff: pinagsasama ang resulta ng bawat araw.
     * Ang 'totalSalary' ay ang sahod mula sa attendance, bago ang
     * SSS, PhilHealth, HDMF, tax at loans.
     *
     * @param  array[]  $days  Listahan ng resulta ng computeDay().
     */
    public static function summarize(array $days): array
    {
        $sum = fn (string $key) => round(array_sum(array_column($days, $key)), 2);

        return [
            'presentDays' => count(array_filter($days, fn ($d) => $d['status'] === 'present' || $d['status'] === 'in_progress')),
            'absentDays' => count(array_filter($days, fn ($d) => $d['status'] === 'absent')),
            'regularPay' => $sum('regularPay'),
            'overtimePay' => $sum('overtimePay'),
            'lateDeduction' => $sum('lateDeduction'),
            'undertimeDeduction' => $sum('undertimeDeduction'),
            'totalSalary' => $sum('netPay'),
        ];
    }
}