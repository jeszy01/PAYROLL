import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { UserManagement } from './pages/UserManagement';
import { PayrollManagement } from './pages/PayrollManagement';
import { CompensationPlanning } from './pages/CompensationPlanning';
import { ClaimsReimbursement } from './pages/ClaimsReimbursement';
import { HmoBenefits } from './pages/HmoBenefits';
import { HrAnalytics } from './pages/HrAnalytics';
import { Login } from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/payroll" element={<PayrollManagement />} />
        <Route path="/compensation" element={<CompensationPlanning />} />
        <Route path="/claims" element={<ClaimsReimbursement />} />
        <Route path="/benefits" element={<HmoBenefits />} />
        <Route path="/analytics" element={<HrAnalytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
