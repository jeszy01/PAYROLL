<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClaimResource;
use App\Models\Claim;
use Illuminate\Http\Request;

class ClaimController extends Controller
{
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
