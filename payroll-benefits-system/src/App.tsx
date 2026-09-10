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
<<<<<<< Updated upstream
import { authService } from './services/auth.service';

function RequireAuth({ children }: { children: ReactNode }) {
  if (!authService.hasToken()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
=======
import { RequireAuth, RequireRole } from './components/auth/RequireAuth';
>>>>>>> Stashed changes

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
<<<<<<< Updated upstream
        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/employees"
          element={
            <RequireAuth>
              <Employees />
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAuth>
              <UserManagement />
            </RequireAuth>
          }
        />
        <Route
          path="/payroll"
          element={
            <RequireAuth>
              <PayrollManagement />
            </RequireAuth>
          }
        />
        <Route
          path="/compensation"
          element={
            <RequireAuth>
              <CompensationPlanning />
            </RequireAuth>
          }
        />
        <Route
          path="/claims"
          element={
            <RequireAuth>
              <ClaimsReimbursement />
            </RequireAuth>
          }
        />
        <Route
          path="/benefits"
          element={
            <RequireAuth>
              <HmoBenefits />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
=======
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/payroll" element={<PayrollManagement />} />
          <Route path="/compensation" element={<CompensationPlanning />} />
          <Route path="/claims" element={<ClaimsReimbursement />} />
          <Route path="/benefits" element={<HmoBenefits />} />
          <Route path="/analytics" element={<HrAnalytics />} />
          <Route
            path="/users"
            element={
              <RequireRole role="admin">
                <UserManagement />
              </RequireRole>
            }
          />
        </Route>
>>>>>>> Stashed changes
      </Routes>
    </BrowserRouter>
  );
}

export default App;
