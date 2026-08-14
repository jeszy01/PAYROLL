import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: 'navy' | 'clay' | 'teal';
  hint?: string;
}

const TONE_BG: Record<NonNullable<StatCardProps['tone']>, string> = {
  navy: 'bg-navy-900 text-white',
  clay: 'bg-clay-500 text-white',
  teal: 'bg-teal-700 text-white',
};

export function StatCard({ icon: Icon, label, value, tone = 'navy', hint }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${TONE_BG[tone]}`}>
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
        <p className="text-xl font-bold text-ink-900">{value}</p>
        {hint && <p className="text-xs text-ink-300">{hint}</p>}
      </div>
    </div>
  );
}
