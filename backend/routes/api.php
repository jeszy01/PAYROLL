<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AttendanceSummaryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BenefitEnrollmentController;
use App\Http\Controllers\Api\BenefitPlanController;
use App\Http\Controllers\Api\ClaimController;
use App\Http\Controllers\Api\CompensationAdjustmentController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\PayrollRunController;
use App\Http\Controllers\Api\PayslipController;
use App\Http\Controllers\Api\SalaryGradeController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ---------- Auth ----------
// Rate-limited so login can't be brute-forced.
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

// Everything below requires a valid Sanctum access token — the frontend is
// entirely behind a login wall, so no employee, payroll, claims, compensation,
// or benefits data should ever be reachable anonymously.
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // ---------- User Management (admin) ----------
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::patch('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // ---------- Employees ----------
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
    Route::patch('/employees/{employee}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);

    // ---------- Payroll Management ----------
    Route::get('/payroll/runs', [PayrollRunController::class, 'index']);
    Route::post('/payroll/runs', [PayrollRunController::class, 'store']);
    Route::get('/payroll/runs/{payrollRun}', [PayrollRunController::class, 'show']);
    Route::get('/payroll/runs/{payrollRun}/attendance', [AttendanceSummaryController::class, 'indexForRun']);
    Route::post('/payroll/runs/{payrollRun}/attendance', [AttendanceSummaryController::class, 'upsert']);
    Route::post('/payroll/runs/{payrollRun}/compute', [PayrollRunController::class, 'compute']);
    Route::post('/payroll/runs/{payrollRun}/approve', [PayrollRunController::class, 'approve']);
    Route::post('/payroll/runs/{payrollRun}/release', [PayrollRunController::class, 'release']);
    Route::post('/payroll/runs/{payrollRun}/archive', [PayrollRunController::class, 'archive']);
    Route::post('/payroll/runs/{payrollRun}/unarchive', [PayrollRunController::class, 'unarchive']);
    Route::delete('/payroll/runs/{payrollRun}', [PayrollRunController::class, 'destroy']);
    Route::get('/payroll/runs/{payrollRun}/payslips', [PayslipController::class, 'indexForRun']);
    Route::post('/payroll/runs/{payrollRun}/payslips/send-bulk', [PayslipController::class, 'sendBulk']);
    Route::get('/payroll/payslips/{payslip}', [PayslipController::class, 'show']);
    Route::post('/payroll/payslips/{payslip}/send', [PayslipController::class, 'send']);

    // ---------- Compensation Planning ----------
    Route::get('/compensation/salary-grades', [SalaryGradeController::class, 'index']);
    Route::post('/compensation/salary-grades', [SalaryGradeController::class, 'store']);
    Route::patch('/compensation/salary-grades/{salaryGrade}', [SalaryGradeController::class, 'update']);
    Route::delete('/compensation/salary-grades/{salaryGrade}', [SalaryGradeController::class, 'destroy']);

    Route::get('/compensation/adjustments', [CompensationAdjustmentController::class, 'index']);
    Route::post('/compensation/adjustments', [CompensationAdjustmentController::class, 'store']);
    Route::patch('/compensation/adjustments/{compensationAdjustment}', [CompensationAdjustmentController::class, 'update']);

    // ---------- Claims & Reimbursement ----------
    Route::get('/claims', [ClaimController::class, 'index']);
    Route::post('/claims', [ClaimController::class, 'store']);
    Route::get('/claims/{claim}', [ClaimController::class, 'show']);
    Route::patch('/claims/{claim}', [ClaimController::class, 'update']);
    Route::post('/claims/{claim}/reimburse', [ClaimController::class, 'reimburse']);

    // ---------- HMO & Benefits Administration ----------
    Route::get('/benefits/plans', [BenefitPlanController::class, 'index']);
    Route::post('/benefits/plans', [BenefitPlanController::class, 'store']);
    Route::patch('/benefits/plans/{benefitPlan}', [BenefitPlanController::class, 'update']);

    Route::get('/benefits/enrollments', [BenefitEnrollmentController::class, 'index']);
    Route::post('/benefits/enrollments', [BenefitEnrollmentController::class, 'store']);
    Route::patch('/benefits/enrollments/{benefitEnrollment}', [BenefitEnrollmentController::class, 'update']);

    // ---------- HR Analytics ----------
    Route::get('/analytics/summary', [AnalyticsController::class, 'summary']);
});
