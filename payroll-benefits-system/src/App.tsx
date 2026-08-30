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
import { authService } from './services/auth.service';

function RequireAuth({ children }: { children: ReactNode }) {
  if (!authService.hasToken()) {
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
