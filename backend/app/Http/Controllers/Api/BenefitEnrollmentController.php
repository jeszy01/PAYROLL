<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ResolvesOwnEmployee;
use App\Http\Controllers\Controller;
use App\Http\Resources\BenefitEnrollmentResource;
use App\Models\BenefitEnrollment;
use App\Models\BenefitPlan;
use Illuminate\Http\Request;

class BenefitEnrollmentController extends Controller
{
    use ResolvesOwnEmployee;

    public function mine(Request $request)
    {
        $employee = $this->ownEmployee($request);

        return BenefitEnrollmentResource::collection(
            BenefitEnrollment::with('dependents')->where('employee_id', $employee->id)->get()
        );
    }

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

     public function showViaInternalApi(BenefitEnrollment $benefitEnrollment)
    {
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'X-Internal-Api-Key' => config('services.internal_api_key'),
       ])->timeout(5)->retry(2, 200)->get(config('app.url').'/api/internal/employees/'.$benefitEnrollment->employee_id);

        if (! $response->successful()) {
            return response()->json([
                'message' => 'Employee service unavailable.',
                'status' => $response->status(),
            ], 502);
        }

        return response()->json([
            'enrollment' => new BenefitEnrollmentResource($benefitEnrollment->load('dependents')),
            'employee_via_internal_api' => $response->json(),
        ]);
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
