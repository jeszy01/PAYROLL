<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollRunResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payPeriodStart' => $this->pay_period_start?->toDateString(),
            'payPeriodEnd' => $this->pay_period_end?->toDateString(),
            'payDate' => $this->pay_date?->toDateString(),
            'cutoffLabel' => $this->cutoff_label,
            'status' => $this->status,
            'isArchived' => $this->archived_at !== null,
            'totalEmployees' => $this->total_employees,
            'grossTotal' => (float) $this->gross_total,
            'deductionsTotal' => (float) $this->deductions_total,
            'netTotal' => (float) $this->net_total,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
