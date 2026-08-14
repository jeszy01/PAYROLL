<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employeeNumber' => $this->employee_number,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'department' => $this->department,
            'position' => $this->position,
            'employmentStatus' => $this->employment_status,
            'dateHired' => $this->date_hired?->toDateString(),
            'baseSalary' => (float) $this->base_salary,
        ];
    }
}
