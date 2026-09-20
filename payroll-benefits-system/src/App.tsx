import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { UserManagement } from './pages/UserManagement';
import { PayrollManagement } from './pages/PayrollManagement';
import { CompensationPlanning } from './pages/CompensationPlanning';
import { ClaimsReimbursement } from './pages/ClaimsReimbursement';
import { HmoBenefits } from './pages/HmoBenefits';
import { Login } from './pages/Login';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeAttendance } from './pages/employee/EmployeeAttendance';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';
import { EmployeePayslips } from './pages/employee/EmployeePayslips';
import { EmployeeClaims } from './pages/employee/EmployeeClaims';
import { EmployeeBenefits } from './pages/employee/EmployeeBenefits';
import { authService } from './services/auth.service';
import { useCurrentUser, isAdmin } from './hooks/useCurrentUser';
import { EssTwoFactorGate } from './components/employee/EssTwoFactorGate';

function RequireAuth({ children }: { children: ReactNode }) {
  if (!authService.hasToken()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { data: user, loading } = useCurrentUser();
  if (loading) return null;
  if (!isAdmin(user)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function RequireEmployee({ children }: { children: ReactNode }) {
  const { data: user, loading } = useCurrentUser();
  if (loading) return null;
  if (!user || user.role !== 'employee') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function RequireStaff({ children }: { children: ReactNode }) {
  const { data: user, loading } = useCurrentUser();
  if (loading) return null;
  if (!user || user.role === 'employee') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <RequireStaff>
                <Dashboard />
              </RequireStaff>
            </RequireAuth>
          }
        />
        <Route
          path="/employees"
          element={
            <RequireAuth>
              <RequireStaff>
                <Employees />
              </RequireStaff>
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAuth>
              <RequireStaff>
                <RequireAdmin>
                  <UserManagement />
                </RequireAdmin>
              </RequireStaff>
            </RequireAuth>
          }
        />
        <Route
          path="/payroll"
          element={
            <RequireAuth>
              <RequireStaff>
                <PayrollManagement />
              </RequireStaff>
            </RequireAuth>
          }
        />
        <Route
          path="/compensation"
          element={
            <RequireAuth>
              <RequireStaff>
                <CompensationPlanning />
              </RequireStaff>
            </RequireAuth>
          }
        />
        <Route
          path="/claims"
          element={
            <RequireAuth>
              <RequireStaff>
                <ClaimsReimbursement />
              </RequireStaff>
            </RequireAuth>
          }
        />
        <Route
          path="/benefits"
          element={
            <RequireAuth>
              <RequireStaff>
                <HmoBenefits />
              </RequireStaff>
            </RequireAuth>
          }
        />
        <Route
          path="/ess"
          element={
            <RequireAuth>
              <RequireEmployee>
                <EssTwoFactorGate>
                  <EmployeeDashboard />
                </EssTwoFactorGate>
              </RequireEmployee>
            </RequireAuth>
          }
        />
        <Route
          path="/ess/attendance"
          element={
            <RequireAuth>
              <RequireEmployee>
                <EssTwoFactorGate>
                  <EmployeeAttendance />
                </EssTwoFactorGate>
              </RequireEmployee>
            </RequireAuth>
          }
        />
        <Route
          path="/ess/profile"
          element={
            <RequireAuth>
              <RequireEmployee>
                <EssTwoFactorGate>
                  <EmployeeProfile />
                </EssTwoFactorGate>
              </RequireEmployee>
            </RequireAuth>
          }
        />
        <Route
          path="/ess/payslips"
          element={
            <RequireAuth>
              <RequireEmployee>
                <EssTwoFactorGate>
                  <EmployeePayslips />
                </EssTwoFactorGate>
              </RequireEmployee>
            </RequireAuth>
          }
        />
        <Route
          path="/ess/claims"
          element={
            <RequireAuth>
              <RequireEmployee>
                <EssTwoFactorGate>
                  <EmployeeClaims />
                </EssTwoFactorGate>
              </RequireEmployee>
            </RequireAuth>
          }
        />
        <Route
          path="/ess/benefits"
          element={
            <RequireAuth>
              <RequireEmployee>
                <EssTwoFactorGate>
                  <EmployeeBenefits />
                </EssTwoFactorGate>
              </RequireEmployee>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;