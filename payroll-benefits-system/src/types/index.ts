// Shared domain types for the Payroll & Benefits Management System.
// These mirror the shape of data expected from the centralized backend
// (PostgreSQL via a REST API). No mock/sample records are seeded anywhere;
// every list starts empty until the API is connected.

export type ID = string;

export type Role = 'admin' | 'hr';

export interface SystemUser {
  id: ID;
  fullName: string;
  email: string;
  role: Role;
  employeeId?: ID | null;
  createdAt: string;
}

export type EmploymentStatus = 'active' | 'on_leave' | 'suspended' | 'separated';
export type EmploymentType = 'regular' | 'probationary' | 'contractual';
export type CivilStatus = 'single' | 'married' | 'widowed' | 'separated';

export interface Employee {
  id: ID;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  department: string;
  position: string;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  civilStatus: CivilStatus;
  dateHired: string; // ISO date
  baseSalary: number;
  loanDeductionPerCutoff: number;
  transportationAllowance: number;
  riceSubsidyAllowance: number;
  sssLoanPerCutoff: number;
  hdmfLoanPerCutoff: number;
  sssNumber?: string | null;
  philhealthNumber?: string | null;
  pagibigNumber?: string | null;
  tinNumber?: string | null;
  shiftStart: string; // "HH:mm:ss"
  shiftEnd: string; // "HH:mm:ss"
}

// ---------- Payroll Management ----------

export type PayrollRunStatus = 'draft' | 'processing' | 'for_approval' | 'approved' | 'released' | 'rejected';

export interface PayrollRun {
  id: ID;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  cutoffLabel: string;
  status: PayrollRunStatus;
  isArchived: boolean;
  totalEmployees: number;
  grossTotal: number;
  deductionsTotal: number;
  netTotal: number;
  unresolvedAnomaliesCount: number;
  blockingAnomaliesCount: number;
  createdAt: string;
}

// ---------- AI-Powered Payroll Anomaly Detection ----------

export type AnomalySeverity = 'low' | 'medium' | 'critical';
export type AnomalyStatus = 'unresolved' | 'dismissed' | 'needs_correction';
export type AnomalyType =
  | 'unusual_pay_change'
  | 'high_overtime'
  | 'duplicate_claim'
  | 'missing_statutory_deduction'
  | 'net_pay_error'
  | 'proration_check_needed';

export interface PayrollAnomaly {
  id: ID;
  payrollRunId: ID;
  employeeId: ID;
  employeeName: string;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  suggestedAction: string;
  metrics: Record<string, unknown> | null;
  status: AnomalyStatus;
  blocksApproval: boolean;
  createdAt: string;
}

export interface Payslip {
  id: ID;
  payrollRunId: ID;
  employeeId: ID;
  employeeNumber: string | null;
  employeeName: string;
  department: string;
  basicPay: number;
  taxRefund: number;
  slCashConversion: number;
  overtimePay: number;
  lateUndertimeAbsenceDeduction: number;
  totalSalary: number;
  sssContribution: number;
  philHealthContribution: number;
  hdmfContribution: number;
  taxableSalary: number;
  withholdingTax: number;
  cashAdvance: number;
  sssLoan: number;
  hdmfLoan: number;
  companyLoanDeduction: number;
  netSalary: number;
  transportationAllowance: number;
  riceSubsidyAllowance: number;
  totalRemittance: number;
  status: 'pending' | 'computed' | 'released';
  emailSentAt?: string | null;
  smsSentAt?: string | null;
}

export interface AttendanceSummary {
  id: ID;
  payrollRunId: ID;
  employeeId: ID;
  employeeName: string;
  daysPresent: number;
  lateMinutes: number;
  overtimeHours: number;
  unpaidAbsenceDays: number;
  cashAdvance: number;
  taxRefund: number;
  slCashConversion: number;
}

// ---------- Compensation Planning ----------

export interface SalaryGrade {
  id: ID;
  gradeCode: string;
  gradeName: string;
  minSalary: number;
  midSalary: number;
  maxSalary: number;
  applicablePositions: string;
}

export type AdjustmentType = 'merit_increase' | 'promotion' | 'market_adjustment' | 'annual_increment';
export type AdjustmentStatus = 'pending' | 'approved' | 'rejected' | 'implemented';

export interface CompensationAdjustment {
  id: ID;
  employeeId: ID;
  employeeName: string;
  adjustmentType: AdjustmentType;
  currentSalary: number;
  proposedSalary: number;
  effectiveDate: string;
  justification: string;
  status: AdjustmentStatus;
  requestedBy: string;
  requestedAt: string;
}

// ---------- Claims & Reimbursement ----------

export type ClaimType = 'transportation' | 'medical' | 'meal' | 'training' | 'equipment' | 'other';
export type ClaimStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'reimbursed';

export interface Claim {
  id: ID;
  employeeId: ID;
  employeeName: string;
  department: string;
  claimType: ClaimType;
  description: string;
  amount: number;
  dateIncurred: string;
  dateSubmitted: string;
  status: ClaimStatus;
  attachmentName?: string;
  reviewerNote?: string;
}

// ---------- HMO & Benefits Administration ----------

export type BenefitPlanType = 'hmo' | 'life_insurance' | 'retirement' | 'wellness' | 'other';

export interface BenefitPlan {
  id: ID;
  planName: string;
  provider: string;
  planType: BenefitPlanType;
  coverageAmount: number;
  employerSharePercent: number;
  employeeSharePercent: number;
  isActive: boolean;
}

export type EnrollmentStatus = 'enrolled' | 'pending' | 'waived' | 'terminated';

export interface Dependent {
  id: ID;
  fullName: string;
  relationship: string;
  birthDate: string;
}

export interface BenefitEnrollment {
  id: ID;
  employeeId: ID;
  employeeName: string;
  planId: ID;
  planName: string;
  status: EnrollmentStatus;
  enrollmentDate: string;
  dependents: Dependent[];
}

// ---------- HR Analytics ----------

export interface PayrollCostTrendPoint {
  period: string;
  grossCost: number;
  netCost: number;
  deductions: number;
}

export interface ClaimsByTypePoint {
  claimType: ClaimType;
  totalAmount: number;
  count: number;
}

export interface BenefitsUtilizationPoint {
  planName: string;
  enrolled: number;
  capacity: number;
}

// ---------- Employee Self-Service: Attendance ----------

export type HolidayType = 'regular' | 'special_non_working';
export type ClockInStatus = 'on_time' | 'late';
export type ClockOutStatus = 'on_time' | 'overtime';

export interface AttendanceRecord {
  id: ID;
  employeeId: ID;
  date: string; // ISO date
  timestampIn: string | null;
  timestampOut: string | null;
  statusIn: ClockInStatus | null;
  statusOut: ClockOutStatus | null;
  minutesLate: number;
  overtimeMinutes: number;
  holidayType: HolidayType | null;
}

export interface TodayAttendance {
  record: AttendanceRecord | null;
  shiftStart: string; // "HH:mm:ss"
  shiftEnd: string; // "HH:mm:ss"
  holiday: { name: string; type: HolidayType } | null;
}

export interface AnalyticsSummary {
  totalPayrollCostThisPeriod: number;
  totalActiveEmployees: number;
  pendingClaimsCount: number;
  benefitsEnrollmentRate: number; // 0-100
  payrollCostTrend: PayrollCostTrendPoint[];
  claimsByType: ClaimsByTypePoint[];
  benefitsUtilization: BenefitsUtilizationPoint[];
}
