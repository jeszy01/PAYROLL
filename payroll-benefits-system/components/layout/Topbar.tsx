import { Search, Bell, LogOut, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { authService } from '../../services/auth.service';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '—';

  async function handleSignOut() {
    await authService.logout();
    navigate('/login');
    window.location.reload();
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-navy-100 bg-white px-8 py-5">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-lg border border-navy-100 bg-sand-50 px-3 py-2 text-sm text-ink-500 md:flex">
          <Search size={16} />
          <span>Search employees, records…</span>
        </div>

        <button
          aria-label="Notifications"
          className="relative rounded-lg border border-navy-100 p-2.5 text-ink-500 transition hover:bg-sand-100"
        >
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-3 border-l border-navy-100 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-semibold text-ink-900">{user?.fullName ?? 'Not signed in'}</p>
            <p className="text-xs text-ink-500">{user?.role ?? 'Sign in to load your account'}</p>
          </div>

          {user ? (
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="rounded-lg p-2 text-ink-500 transition hover:bg-sand-100 hover:text-bad-600"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              <LogIn size={16} />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
