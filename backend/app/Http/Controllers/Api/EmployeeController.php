<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Illuminate\Http\Request;

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
            'employeeNumber' => ['required', 'string', 'max:50', 'unique:employees,employee_number'],
            'firstName' => ['required', 'string', 'max:255'],
            'lastName' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:employees,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'department' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'employmentStatus' => ['required', 'in:active,on_leave,suspended,separated'],
            'dateHired' => ['required', 'date'],
            'baseSalary' => ['required', 'numeric', 'min:0'],
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
        ]);

        $map = [
            'employeeNumber' => 'employee_number', 'firstName' => 'first_name', 'lastName' => 'last_name',
            'email' => 'email', 'phone' => 'phone', 'department' => 'department', 'position' => 'position',
            'employmentStatus' => 'employment_status', 'dateHired' => 'date_hired', 'baseSalary' => 'base_salary',
        ];

        $employee->update(
            collect($data)->mapWithKeys(fn ($v, $k) => [$map[$k] => $v])->toArray()
        );

        return new EmployeeResource($employee);
    }
}
