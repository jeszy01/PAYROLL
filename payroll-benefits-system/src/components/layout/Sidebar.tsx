import logo from '../../assets/Logo.png';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Banknote,
  LineChart,
  Receipt,
  HeartPulse,
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/payroll', label: 'Payroll Management', icon: Banknote },
  { to: '/compensation', label: 'Compensation Planning', icon: LineChart },
  { to: '/claims', label: 'Claims & Reimbursement', icon: Receipt },
  { to: '/benefits', label: 'HMO & Benefits', icon: HeartPulse },
  { to: '/analytics', label: 'HR Analytics', icon: BarChart3 },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col bg-navy-900 text-navy-100 transition-all ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <img src={logo} alt="Company logo" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Payroll &amp; Benefits</p>
            <p className="truncate text-xs text-navy-100/60">Management System</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-navy-700 text-white'
                  : 'text-navy-100/70 hover:bg-navy-800 hover:text-white'
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} strokeWidth={1.75} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="m-3 flex items-center justify-center gap-2 rounded-lg border border-navy-700 py-2 text-xs font-medium text-navy-100/70 transition hover:bg-navy-800 hover:text-white"
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        {!collapsed && 'Collapse'}
      </button>
    </aside>
  );
}
