import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Banknote,
  Receipt,
  HeartPulse,
  UserCircle,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';

function initialsOf(fullName?: string) {
  if (!fullName) return '—';
  return fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const NAV_ITEMS = [
  { to: '/ess', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/ess/payslips', label: 'My Payslips', icon: Banknote },
  { to: '/ess/claims', label: 'My Claims', icon: Receipt },
  { to: '/ess/benefits', label: 'My Benefits', icon: HeartPulse },
  { to: '/ess/profile', label: 'My Profile', icon: UserCircle },
];

export function EmployeeSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: user } = useCurrentUser();

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col bg-primary-700 text-white transition-all ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-6">
       <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="50" rx="47" ry="15" stroke="#8B5CF6" strokeWidth="4" transform="rotate(-25 50 50)" />
    <ellipse cx="50" cy="50" rx="47" ry="15" stroke="#F59E0B" strokeWidth="4" transform="rotate(35 50 50)" />
    <ellipse cx="50" cy="50" rx="47" ry="15" stroke="#3B82F6" strokeWidth="4" transform="rotate(95 50 50)" />
    <circle cx="88" cy="35" r="3.5" fill="#8B5CF6" />
    <circle cx="12" cy="65" r="3.5" fill="#F59E0B" />
    <circle cx="50" cy="50" r="18" fill="#16A34A" />
    <text x="50" y="54" textAnchor="middle" fontSize="10" fontWeight="700" fill="white" fontFamily="Arial, sans-serif">
      arch
    </text>
  </svg>
</div>
{!collapsed && (
  <div className="min-w-0">
    <p className="truncate text-sm font-extrabold italic text-red-600">Archon Nell</p>
    <p className="truncate text-[10px] font-semibold tracking-wide text-blue-800">Incorporated</p>
  </div>
)}
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Archon Nell</p>
            <p className="truncate text-[10px] font-semibold tracking-widest text-red-500">Incorporated</p>
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
                  ? 'bg-primary-500 text-white'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} strokeWidth={1.75} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/20 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-3 px-1 py-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                {initialsOf(user?.fullName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user?.fullName ?? 'Not signed in'}</p>
                <p className="truncate text-xs text-white/60">Employee</p>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              title="Collapse"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronsLeft size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              title={user?.fullName ?? 'Not signed in'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white"
            >
              {initialsOf(user?.fullName)}
            </div>
            <button
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}