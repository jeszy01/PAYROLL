<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ResolvesOwnEmployee;
use App\Http\Controllers\Controller;
use App\Http\Resources\ClaimResource;
use App\Models\Claim;
use Illuminate\Http\Request;

class ClaimController extends Controller
{
    use ResolvesOwnEmployee;

    public function mine(Request $request)
    {
        $employee = $this->ownEmployee($request);

        return ClaimResource::collection(
            Claim::where('employee_id', $employee->id)->orderByDesc('date_submitted')->get()
        );
    }

    /**
     * Self-service claim submission. Identity (employee_id/name/department)
     * is always derived from the authenticated user's linked employee —
     * never taken from the request body — so an employee can't file a
     * claim under someone else's name.
     */
    public function storeMine(Request $request)
    {
        $employee = $this->ownEmployee($request);

        $data = $request->validate([
            'claimType' => ['required', 'in:transportation,medical,meal,training,equipment,other'],
            'description' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'dateIncurred' => ['required', 'date'],
        ]);

        $claim = Claim::create([
            'employee_id' => $employee->id,
            'employee_name' => "{$employee->first_name} {$employee->last_name}",
            'department' => $employee->department,
            'claim_type' => $data['claimType'],
            'description' => $data['description'],
            'amount' => $data['amount'],
            'date_incurred' => $data['dateIncurred'],
            'date_submitted' => now()->toDateString(),
            'status' => 'submitted',
        ]);

        return new ClaimResource($claim);
    }

    public function index()
    {
        return ClaimResource::collection(
            Claim::orderByDesc('date_submitted')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employeeId' => ['required', 'uuid', 'exists:employees,id'],
            'employeeName' => ['required', 'string', 'max:255'],
            'department' => ['required', 'string', 'max:255'],
            'claimType' => ['required', 'in:transportation,medical,meal,training,equipment,other'],
            'description' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'dateIncurred' => ['required', 'date'],
        ]);

        $claim = Claim::create([
            'employee_id' => $data['employeeId'],
            'employee_name' => $data['employeeName'],
            'department' => $data['department'],
            'claim_type' => $data['claimType'],
            'description' => $data['description'],
            'amount' => $data['amount'],
            'date_incurred' => $data['dateIncurred'],
            'date_submitted' => now()->toDateString(),
            'status' => 'submitted',
        ]);

        return new ClaimResource($claim);
    }

    public function show(Claim $claim)
    {
        return new ClaimResource($claim);
    }

        /**
     * Demo endpoint: fetches the claim's employee via a real HTTP call
     * to the Employee service's internal API, instead of a direct
     * Eloquent lookup — demonstrates the microservice service-to-service
     * communication pattern.
     */
    public function showViaInternalApi(Claim $claim)
    {
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'X-Internal-Api-Key' => config('services.internal_api_key'),
        ])->timeout(5)->retry(2, 200)->get(config('app.url').'/api/internal/employees/'.$claim->employee_id);

        if (! $response->successful()) {
            return response()->json([
                'message' => 'Employee service unavailable.',
                'status' => $response->status(),
            ], 502);
        }

        return response()->json([
            'claim' => new ClaimResource($claim),
            'employee_via_internal_api' => $response->json(),
        ]);
    }

    public function update(Request $request, Claim $claim)
    {
        $data = $request->validate([
            'status' => ['required', 'in:submitted,under_review,approved,rejected,reimbursed'],
            'reviewerNote' => ['nullable', 'string'],
        ]);

        $claim->update([
            'status' => $data['status'],
            'reviewer_note' => $data['reviewerNote'] ?? $claim->reviewer_note,
        ]);

        return new ClaimResource($claim);
    }

    public function reimburse(Claim $claim)
    {
        $claim->update(['status' => 'reimbursed']);

        return new ClaimResource($claim);
    }
}
