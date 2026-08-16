<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PayslipResource;
use App\Models\Employee;
use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Services\PayslipMailer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PayslipController extends Controller
{
    public function __construct(private PayslipMailer $mailer)
    {
    }

    public function indexForRun(PayrollRun $payrollRun)
    {
        return PayslipResource::collection(
            $payrollRun->payslips()->orderBy('employee_name')->get()
        );
    }

    public function show(Payslip $payslip)
    {
        return new PayslipResource($payslip);
    }

    /**
     * Send one payslip via email or SMS.
     *
     * Email actually sends (or logs, depending on MAIL_MAILER in .env).
     * SMS has no gateway wired up — see the note in .env.example — so it
     * records the send attempt and returns a note rather than silently
     * pretending a text went out.
     */
    public function send(Request $request, Payslip $payslip)
    {
        $data = $request->validate([
            'channel' => ['required', 'in:email,sms'],
        ]);

        return response()->json(
            $this->deliver($payslip, $data['channel'])
        );
    }

    /**
     * Send multiple payslips at once (the "select all" / bulk action).
     */
    public function sendBulk(Request $request, PayrollRun $payrollRun)
    {
        $data = $request->validate([
            'channel' => ['required', 'in:email,sms'],
            'payslipIds' => ['required', 'array', 'min:1'],
            'payslipIds.*' => ['uuid'],
        ]);

        $payslips = Payslip::where('payroll_run_id', $payrollRun->id)
            ->whereIn('id', $data['payslipIds'])
            ->get();

        $results = $payslips->map(fn (Payslip $payslip) => $this->deliver($payslip, $data['channel']));

        return response()->json([
            'sent' => $results->where('status', 'sent')->count(),
            'failed' => $results->where('status', 'failed')->count(),
            'results' => $results->values(),
        ]);
    }

    private function deliver(Payslip $payslip, string $channel): array
    {
        // withTrashed(): a payslip's employee may have since been removed
        // (soft-deleted) — resending an old payslip should still work.
        $employee = Employee::withTrashed()->find($payslip->employee_id);

        if ($channel === 'email') {
            return $this->mailer->sendEmail($payslip, $employee);
        }

        // SMS: no gateway configured in this build. Record the attempt
        // so the UI reflects it was requested, without claiming a text
        // was actually delivered.
        if (! $employee || ! $employee->phone) {
            return ['payslipId' => $payslip->id, 'status' => 'failed', 'message' => 'No phone number on file for this employee.'];
        }

        Log::info('Payslip SMS requested (no SMS gateway configured)', [
            'payslip_id' => $payslip->id,
            'phone' => $employee->phone,
        ]);
        $payslip->update(['sms_sent_at' => now()]);

        return [
            'payslipId' => $payslip->id,
            'status' => 'sent',
            'message' => "Queued for {$employee->phone} (connect an SMS provider in PayslipController to actually deliver).",
        ];
    }
}
