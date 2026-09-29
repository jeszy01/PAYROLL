import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Banknote,
  LineChart,
  Receipt,
  HeartPulse,
  Users,
  
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCurrentUser, isAdmin } from '../../hooks/useCurrentUser';

const ROLE_LABEL = { admin: 'Admin', hr_staff: 'HR Staff', employee: 'Employee' } as const;

function initialsOf(fullName?: string) {
  if (!fullName) return '—';
  return fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

type NavChild = { label: string; to: string; defaultTab?: boolean };

type NavItem =
  | { kind: 'link'; to: string; label: string; icon: LucideIcon; end?: boolean }
  | {
      kind: 'group';
      key: string;
      label: string;
      icon: LucideIcon;
      adminOnly?: boolean;
      children: NavChild[];
    };

const NAV_ITEMS: NavItem[] = [
  { kind: 'link', to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  {
    kind: 'group',
    key: 'payroll',
    label: 'Payroll',
    icon: Banknote,
    children: [
      { label: 'Payroll Runs', to: '/payroll' },
      { label: 'Deductions & Loans', to: '/employees?tab=deductions' },
    ],
  },
  {
    kind: 'group',
    key: 'compensation',
    label: 'Compensation',
    icon: LineChart,
    children: [
      { label: 'Salary Grades', to: '/compensation?tab=grades', defaultTab: true },
      { label: 'Adjustment Requests', to: '/compensation?tab=adjustments' },
    ],
  },
  { kind: 'link', to: '/claims', label: 'Claims & Reimbursement', icon: Receipt },
  {
    kind: 'group',
    key: 'benefits',
    label: 'HMO & Benefits',
    icon: HeartPulse,
    children: [
      { label: 'Benefit Plans', to: '/benefits?tab=plans', defaultTab: true },
      { label: 'Enrollments', to: '/benefits?tab=enrollments' },
    ],
  },
  {
    kind: 'group',
    key: 'employee-data',
    label: 'Employee Data',
    icon: Users,
    children: [
      { label: 'Employee Directory', to: '/employees?tab=directory', defaultTab: true },
      { label: 'Attendance & OT', to: '/employees?tab=attendance' },
    ]
  },
];

function childActive(child: NavChild, pathname: string, search: string) {
  const [childPath, childQuery = ''] = child.to.split('?');
  if (pathname !== childPath) return false;
  const wanted = new URLSearchParams(childQuery).get('tab');
  if (!wanted) return true;
  const current = new URLSearchParams(search).get('tab');
  return current === wanted || (!current && !!child.defaultTab);
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const location = useLocation();
  const { data: user } = useCurrentUser();
  const admin = isAdmin(user);
  const accountHref = admin ? '/users' : '#';

  useEffect(() => {
    for (const item of NAV_ITEMS) {
      if (
        item.kind === 'group' &&
        item.children.some((c) => childActive(c, location.pathname, location.search))
      ) {
        setOpenGroups((prev) => (prev.includes(item.key) ? prev : [...prev, item.key]));
      }
    }
  }, [location.pathname, location.search]);

  function handleGroupClick(key: string) {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups((prev) => (prev.includes(key) ? prev : [...prev, key]));
      return;
    }
    setOpenGroups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col bg-primary-700 text-white transition-all ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <svg width="40" height="40" viewBox="0 0 100 100" className="shrink-0">
          <defs>
            <linearGradient id="ring1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#C026D3" />
            </linearGradient>
            <linearGradient id="ring2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#DB2777" />
            </linearGradient>
            <linearGradient id="ring3" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="nucleusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="50" rx="46" ry="17" fill="none" stroke="url(#ring1)" strokeWidth="5" transform="rotate(-30 50 50)" />
          <ellipse cx="50" cy="50" rx="46" ry="17" fill="none" stroke="url(#ring2)" strokeWidth="5" transform="rotate(30 50 50)" />
          <ellipse cx="50" cy="50" rx="46" ry="17" fill="none" stroke="url(#ring3)" strokeWidth="5" transform="rotate(90 50 50)" />
          <ellipse cx="50" cy="50" rx="22" ry="12" fill="url(#nucleusGrad)" />
          <text x="50" y="54" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="11" fill="#FFFFFF">
            ANI
          </text>
        </svg>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-red-600">ARCHON NELL</p>
            <p className="truncate text-[10px] font-semibold tracking-wide text-white">INCORPORATED</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.kind === 'group') {
            if (item.adminOnly && !admin) return null;

            const isOpen = openGroups.includes(item.key);
            const groupActive = item.children.some((c) =>
              childActive(c, location.pathname, location.search)
            );

            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => handleGroupClick(item.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    groupActive
                      ? 'bg-primary-500 text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} strokeWidth={1.75} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const active = childActive(child, location.pathname, location.search);
                      return (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={`block rounded-lg px-3 py-2 text-sm transition ${
                            active
                              ? 'bg-primary-500 text-white'
                              : 'text-white/65 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} strokeWidth={1.75} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/20 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <Link
              to={accountHref}
              onClick={(e) => {
                if (accountHref === '#') e.preventDefault();
              }}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 transition hover:bg-white/10"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                {initialsOf(user?.fullName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user?.fullName ?? 'Not signed in'}</p>
                <p className="truncate text-xs text-white/60">{user ? ROLE_LABEL[user.role] : 'Guest'}</p>
              </div>
            </Link>
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
            <Link
              to={accountHref}
              onClick={(e) => {
                if (accountHref === '#') e.preventDefault();
              }}
              title={user?.fullName ?? 'Not signed in'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {initialsOf(user?.fullName)}
            </Link>
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