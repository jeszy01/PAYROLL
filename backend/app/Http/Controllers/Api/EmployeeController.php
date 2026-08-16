<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index()
    {
        return EmployeeResource::collection(
            Employee::orderBy('last_name')->orderBy('first_name')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employeeNumber' => [
                'required', 'string', 'max:50',
                Rule::unique('employees', 'employee_number')->whereNull('deleted_at'),
            ],
            'firstName' => ['required', 'string', 'max:255'],
            'lastName' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('employees', 'email')->whereNull('deleted_at'),
            ],
            'phone' => ['nullable', 'string', 'max:30'],
            'department' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'employmentStatus' => ['required', 'in:active,on_leave,suspended,separated'],
            'dateHired' => ['required', 'date'],
            'baseSalary' => ['required', 'numeric', 'min:0'],
            'loanDeductionPerCutoff' => ['nullable', 'numeric', 'min:0'],
            'transportationAllowance' => ['nullable', 'numeric', 'min:0'],
            'riceSubsidyAllowance' => ['nullable', 'numeric', 'min:0'],
            'sssLoanPerCutoff' => ['nullable', 'numeric', 'min:0'],
            'hdmfLoanPerCutoff' => ['nullable', 'numeric', 'min:0'],
        ]);

        $employee = Employee::create([
            'employee_number' => $data['employeeNumber'],
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'department' => $data['department'],
            'position' => $data['position'],
            'employment_status' => $data['employmentStatus'],
            'date_hired' => $data['dateHired'],
            'base_salary' => $data['baseSalary'],
            'loan_deduction_per_cutoff' => $data['loanDeductionPerCutoff'] ?? 0,
            'transportation_allowance' => $data['transportationAllowance'] ?? 0,
            'rice_subsidy_allowance' => $data['riceSubsidyAllowance'] ?? 0,
            'sss_loan_per_cutoff' => $data['sssLoanPerCutoff'] ?? 0,
            'hdmf_loan_per_cutoff' => $data['hdmfLoanPerCutoff'] ?? 0,
        ]);

        return new EmployeeResource($employee);
    }

    public function show(Employee $employee)
    {
        return new EmployeeResource($employee);
    }

    public function update(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'employeeNumber' => ['sometimes', 'string', 'max:50'],
            'firstName' => ['sometimes', 'string', 'max:255'],
            'lastName' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'department' => ['sometimes', 'string', 'max:255'],
            'position' => ['sometimes', 'string', 'max:255'],
            'employmentStatus' => ['sometimes', 'in:active,on_leave,suspended,separated'],
            'dateHired' => ['sometimes', 'date'],
            'baseSalary' => ['sometimes', 'numeric', 'min:0'],
            'loanDeductionPerCutoff' => ['sometimes', 'numeric', 'min:0'],
            'transportationAllowance' => ['sometimes', 'numeric', 'min:0'],
            'riceSubsidyAllowance' => ['sometimes', 'numeric', 'min:0'],
            'sssLoanPerCutoff' => ['sometimes', 'numeric', 'min:0'],
            'hdmfLoanPerCutoff' => ['sometimes', 'numeric', 'min:0'],
        ]);

        $map = [
            'employeeNumber' => 'employee_number', 'firstName' => 'first_name', 'lastName' => 'last_name',
            'email' => 'email', 'phone' => 'phone', 'department' => 'department', 'position' => 'position',
            'employmentStatus' => 'employment_status', 'dateHired' => 'date_hired', 'baseSalary' => 'base_salary',
            'loanDeductionPerCutoff' => 'loan_deduction_per_cutoff',
            'transportationAllowance' => 'transportation_allowance', 'riceSubsidyAllowance' => 'rice_subsidy_allowance',
            'sssLoanPerCutoff' => 'sss_loan_per_cutoff', 'hdmfLoanPerCutoff' => 'hdmf_loan_per_cutoff',
        ];

        $employee->update(
            collect($data)->mapWithKeys(fn ($v, $k) => [$map[$k] => $v])->toArray()
        );

        return new EmployeeResource($employee);
    }

    /**
     * Soft delete: the employee disappears from the active list and every
     * query that lists employees (Eloquent's SoftDeletingScope handles
     * that automatically), but the row itself stays in the database. That
     * matters because payslips.employee_id cascades on a real delete —
     * hard-deleting would silently wipe out already-run payroll records
     * that reference this employee.
     */
    public function destroy(Employee $employee)
    {
        $employee->delete();

        return response()->json(null, 204);
    }
}
