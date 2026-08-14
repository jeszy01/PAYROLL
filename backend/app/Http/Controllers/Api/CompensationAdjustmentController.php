<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompensationAdjustmentResource;
use App\Models\CompensationAdjustment;
use Illuminate\Http\Request;

class CompensationAdjustmentController extends Controller
{
    public function index()
    {
        return CompensationAdjustmentResource::collection(
            CompensationAdjustment::orderByDesc('requested_at')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employeeId' => ['required', 'uuid', 'exists:employees,id'],
            'employeeName' => ['required', 'string', 'max:255'],
            'adjustmentType' => ['required', 'in:merit_increase,promotion,market_adjustment,annual_increment'],
            'currentSalary' => ['required', 'numeric', 'min:0'],
            'proposedSalary' => ['required', 'numeric', 'min:0'],
            'effectiveDate' => ['required', 'date'],
            'justification' => ['required', 'string'],
            'requestedBy' => ['required', 'string', 'max:255'],
        ]);

        $adjustment = CompensationAdjustment::create([
            'employee_id' => $data['employeeId'],
            'employee_name' => $data['employeeName'],
            'adjustment_type' => $data['adjustmentType'],
            'current_salary' => $data['currentSalary'],
            'proposed_salary' => $data['proposedSalary'],
            'effective_date' => $data['effectiveDate'],
            'justification' => $data['justification'],
            'requested_by' => $data['requestedBy'],
            'requested_at' => now(),
            'status' => 'pending',
        ]);

        return new CompensationAdjustmentResource($adjustment);
    }

    public function update(Request $request, CompensationAdjustment $compensationAdjustment)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected,implemented'],
        ]);

        $compensationAdjustment->update(['status' => $data['status']]);

        return new CompensationAdjustmentResource($compensationAdjustment);
    }
}
