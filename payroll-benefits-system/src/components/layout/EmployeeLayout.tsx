import type { ReactNode } from 'react';
import { EmployeeSidebar } from './EmployeeSidebar';
import { EmployeeTopbar } from './EmployeeTopbar';

interface EmployeeLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function EmployeeLayout({ title, subtitle, children }: EmployeeLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-sand-50">
      <EmployeeSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <EmployeeTopbar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
