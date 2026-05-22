import type { ReactNode } from 'react';
import Button from '../ui/Button';
import Sidebar from './Sidebar';
import type { Student } from '../../types/student';
import type { SystemPage } from '../../types/navigation';

interface AppLayoutProps {
  activePage: SystemPage;
  children: ReactNode;
  student: Student;
  onLogout: () => void;
  onPageChange: (page: SystemPage) => void;
}

export default function AppLayout({
  activePage,
  children,
  student,
  onLogout,
  onPageChange,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col gap-6 px-4 py-6 font-sans md:flex-row md:px-8">
      <Sidebar activePage={activePage} onPageChange={onPageChange} />
      <main className="min-w-0 flex-1">
        <header className="mb-6 flex flex-col gap-3 rounded-3xl bg-white/45 px-6 py-5 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">歡迎回來</p>
            <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
          </div>
          <Button variant="secondary" onClick={onLogout}>
            登出
          </Button>
        </header>
        {children}
      </main>
    </div>
  );
}
