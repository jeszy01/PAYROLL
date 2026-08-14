<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PayrollRunResource;
use App\Models\AttendanceSummary;
use App\Models\Employee;
use App\Models\PayrollRun;
use App\Models\Payslip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayrollRunController extends Controller
{
    public function index(Request $request)
    {
        $query = PayrollRun::orderByDesc('pay_period_start');

        if (! $request->boolean('includeArchived')) {
            $query->whereNull('archived_at');
        }

        return PayrollRunResource::collection($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'payPeriodStart' => ['required', 'date'],
            'payPeriodEnd' => ['required', 'date', 'after_or_equal:payPeriodStart'],
            'payDate' => ['required', 'date'],
            'cutoffLabel' => ['required', 'string', 'max:255'],
        ]);

        $run = PayrollRun::create([
            'pay_period_start' => $data['payPeriodStart'],
            'pay_period_end' => $data['payPeriodEnd'],
            'pay_date' => $data['payDate'],
            'cutoff_label' => $data['cutoffLabel'],
            'status' => 'draft',
        ]);

        return new PayrollRunResource($run);
    }

    public function show(PayrollRun $payrollRun)
    {
        return new PayrollRunResource($payrollRun);
    }

    /**
     * Compute payslips for every active employee based on the attendance
     * summaries entered for this run, then move the run to "for_approval".
     *
     * NOTE ON RATES: SSS / PhilHealth / Pag-IBIG / withholding tax below
     * use simplified flat percentages for demonstration purposes. They
     * are NOT the official, bracketed government contribution tables
     * (those change periodically and have income brackets/caps). Swap
     * the constants in this method for the actual current tables before
     * using this for real payroll.
     */
    public function compute(PayrollRun $payrollRun)
    {
        if ($payrollRun->status !== 'draft') {
            return response()->json([
                'message' => 'Only a draft payroll run can be computed. Create a new run instead.',
            ], 422);
        }

        // Simplified statutory rates — see NOTE above.
        $sssRate = 0.045;        // 4.5% of gross, employee share (simplified)
        $philhealthRate = 0.025; // 2.5% of gross, employee share (simplified)
        $pagibigRate = 0.02;     // 2% of gross, capped
        $pagibigCap = 100.0;
        $taxableThreshold = 20833.0; // simplified TRAIN-law-style monthly exemption
        $taxRate = 0.10;

        $workingDaysPerPeriod = 11; // simplified semi-monthly working-day baseline

        $summaries = AttendanceSummary::where('payroll_run_id', $payrollRun->id)->get();

        if ($summaries->isEmpty()) {
            return response()->json([
                'message' => 'Enter attendance summaries for at least one employee before computing.',
            ], 422);
        }

        DB::transaction(function () use ($payrollRun, $summaries, $workingDaysPerPeriod, $sssRate, $philhealthRate, $pagibigRate, $pagibigCap, $taxableThreshold, $taxRate) {
            // Clear any previously computed payslips for this run (recompute).
            Payslip::where('payroll_run_id', $payrollRun->id)->delete();

            $grossTotal = 0;
            $deductionsTotal = 0;
            $netTotal = 0;

            foreach ($summaries as $summary) {
                $employee = Employee::find($summary->employee_id);
                if (! $employee) {
                    continue;
                }

                $dailyRate = ((float) $employee->base_salary) / 2 / $workingDaysPerPeriod;
                $hourlyRate = $dailyRate / 8;

                $basicPay = round($dailyRate * (float) $summary->days_present, 2);
                $overtimePay = round($hourlyRate * 1.25 * (float) $summary->overtime_hours, 2);
                $lateDeduction = round(($hourlyRate / 60) * $summary->late_minutes, 2);
                $absenceDeduction = round($dailyRate * (float) $summary->unpaid_absence_days, 2);

                $grossPay = max(0, $basicPay + $overtimePay - $lateDeduction - $absenceDeduction);

                $sss = round($grossPay * $sssRate, 2);
                $philhealth = round($grossPay * $philhealthRate, 2);
                $pagibig = min(round($grossPay * $pagibigRate, 2), $pagibigCap);
                $taxableIncome = max(0, $grossPay - $taxableThreshold);
                $tax = round($taxableIncome * $taxRate, 2);

                $totalDeductions = round($sss + $philhealth + $pagibig + $tax, 2);
                $netPay = round($grossPay - $totalDeductions, 2);

                Payslip::create([
                    'payroll_run_id' => $payrollRun->id,
                    'employee_id' => $employee->id,
                    'employee_name' => "{$employee->first_name} {$employee->last_name}",
                    'department' => $employee->department,
                    'basic_pay' => $basicPay,
                    'overtime_pay' => $overtimePay,
                    'allowances' => 0,
                    'gross_pay' => $grossPay,
                    'sss_contribution' => $sss,
                    'philhealth_contribution' => $philhealth,
                    'pagibig_contribution' => $pagibig,
                    'withholding_tax' => $tax,
                    'other_deductions' => $lateDeduction + $absenceDeduction,
                    'total_deductions' => $totalDeductions,
                    'net_pay' => $netPay,
                    'status' => 'computed',
                ]);

                $grossTotal += $grossPay;
                $deductionsTotal += $totalDeductions;
                $netTotal += $netPay;
            }

            $payrollRun->update([
                'status' => 'for_approval',
                'total_employees' => $summaries->count(),
                'gross_total' => round($grossTotal, 2),
                'deductions_total' => round($deductionsTotal, 2),
                'net_total' => round($netTotal, 2),
            ]);
        });

        return new PayrollRunResource($payrollRun->fresh());
    }

    public function approve(PayrollRun $payrollRun)
    {
        $payrollRun->update(['status' => 'approved']);

        return new PayrollRunResource($payrollRun);
    }

    public function release(PayrollRun $payrollRun)
    {
        $payrollRun->update(['status' => 'released']);

        foreach ($payrollRun->payslips as $payslip) {
            $payslip->update(['status' => 'released']);
        }

        return new PayrollRunResource($payrollRun);
    }

    /**
     * Archive a run — hides it from the default list without deleting its
     * records, so payroll history stays intact for audit purposes.
     */
    public function archive(PayrollRun $payrollRun)
    {
        $payrollRun->update(['archived_at' => now()]);

        return new PayrollRunResource($payrollRun);
    }

    public function unarchive(PayrollRun $payrollRun)
    {
        $payrollRun->update(['archived_at' => null]);

        return new PayrollRunResource($payrollRun);
    }

    /**
     * Only draft runs can be deleted outright — nothing has been computed
     * or approved yet, so there's no financial record to preserve.
     * Anything past draft should be archived instead.
     */
    public function destroy(PayrollRun $payrollRun)
    {
        if ($payrollRun->status !== 'draft') {
            return response()->json([
                'message' => 'Only a draft payroll run can be deleted. Archive this run instead to keep its records.',
            ], 422);
        }

        $payrollRun->delete();

        return response()->json(null, 204);
    }
}
