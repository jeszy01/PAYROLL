import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';
import { AccountMenu } from './AccountMenu';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-navy-100 bg-white px-8 py-5">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <GlobalSearch />
        <NotificationBell />
        <AccountMenu />
      </div>
    </header>
  );
}
