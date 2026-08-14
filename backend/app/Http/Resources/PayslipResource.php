<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayslipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payrollRunId' => $this->payroll_run_id,
            'employeeId' => $this->employee_id,
            'employeeName' => $this->employee_name,
            'department' => $this->department,
            'basicPay' => (float) $this->basic_pay,
            'overtimePay' => (float) $this->overtime_pay,
            'allowances' => (float) $this->allowances,
            'grossPay' => (float) $this->gross_pay,
            'sssContribution' => (float) $this->sss_contribution,
            'philHealthContribution' => (float) $this->philhealth_contribution,
            'pagIbigContribution' => (float) $this->pagibig_contribution,
            'withholdingTax' => (float) $this->withholding_tax,
            'otherDeductions' => (float) $this->other_deductions,
            'totalDeductions' => (float) $this->total_deductions,
            'netPay' => (float) $this->net_pay,
            'status' => $this->status,
            'emailSentAt' => $this->email_sent_at?->toIso8601String(),
            'smsSentAt' => $this->sms_sent_at?->toIso8601String(),
        ];
    }
}
