<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BenefitPlanResource;
use App\Models\BenefitPlan;
use Illuminate\Http\Request;

class BenefitPlanController extends Controller
{
    public function index()
    {
        return BenefitPlanResource::collection(
            BenefitPlan::orderBy('plan_name')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'planName' => ['required', 'string', 'max:255'],
            'provider' => ['required', 'string', 'max:255'],
            'planType' => ['required', 'in:hmo,life_insurance,retirement,wellness,other'],
            'coverageAmount' => ['required', 'numeric', 'min:0'],
            'employerSharePercent' => ['required', 'numeric', 'min:0', 'max:100'],
            'employeeSharePercent' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $plan = BenefitPlan::create([
            'plan_name' => $data['planName'],
            'provider' => $data['provider'],
            'plan_type' => $data['planType'],
            'coverage_amount' => $data['coverageAmount'],
            'employer_share_percent' => $data['employerSharePercent'],
            'employee_share_percent' => $data['employeeSharePercent'],
            'is_active' => true,
        ]);

        return new BenefitPlanResource($plan);
    }

    public function update(Request $request, BenefitPlan $benefitPlan)
    {
        $data = $request->validate([
            'planName' => ['sometimes', 'string', 'max:255'],
            'provider' => ['sometimes', 'string', 'max:255'],
            'planType' => ['sometimes', 'in:hmo,life_insurance,retirement,wellness,other'],
            'coverageAmount' => ['sometimes', 'numeric', 'min:0'],
            'employerSharePercent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'employeeSharePercent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'isActive' => ['sometimes', 'boolean'],
        ]);

        $map = [
            'planName' => 'plan_name', 'provider' => 'provider', 'planType' => 'plan_type',
            'coverageAmount' => 'coverage_amount', 'employerSharePercent' => 'employer_share_percent',
            'employeeSharePercent' => 'employee_share_percent', 'isActive' => 'is_active',
        ];

        $benefitPlan->update(
            collect($data)->mapWithKeys(fn ($v, $k) => [$map[$k] => $v])->toArray()
        );

        return new BenefitPlanResource($benefitPlan);
    }
}
