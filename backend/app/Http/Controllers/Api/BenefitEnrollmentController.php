<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BenefitEnrollmentResource;
use App\Models\BenefitEnrollment;
use App\Models\BenefitPlan;
use Illuminate\Http\Request;

class BenefitEnrollmentController extends Controller
{
    public function index()
    {
        return BenefitEnrollmentResource::collection(
            BenefitEnrollment::with('dependents')->orderBy('employee_name')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employeeId' => ['required', 'uuid', 'exists:employees,id'],
            'employeeName' => ['required', 'string', 'max:255'],
            'planId' => ['required', 'uuid', 'exists:benefit_plans,id'],
        ]);

        $plan = BenefitPlan::findOrFail($data['planId']);

        $enrollment = BenefitEnrollment::create([
            'employee_id' => $data['employeeId'],
            'employee_name' => $data['employeeName'],
            'plan_id' => $plan->id,
            'plan_name' => $plan->plan_name,
            'status' => 'pending',
            'enrollment_date' => now()->toDateString(),
        ]);

        return new BenefitEnrollmentResource($enrollment->load('dependents'));
    }

    public function update(Request $request, BenefitEnrollment $benefitEnrollment)
    {
        $data = $request->validate([
            'status' => ['required', 'in:enrolled,pending,waived,terminated'],
        ]);

        $benefitEnrollment->update(['status' => $data['status']]);

        return new BenefitEnrollmentResource($benefitEnrollment->load('dependents'));
    }
}
