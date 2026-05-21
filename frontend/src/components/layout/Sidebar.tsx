import type { SystemPage } from '../../types/navigation';

interface SidebarProps {
  activePage: SystemPage;
  onPageChange: (page: SystemPage) => void;
}

const navItems: Array<{ label: string; page: SystemPage; icon: string }> = [
  { label: '修課紀錄', page: 'courseRecords', icon: '📚' },
  { label: '學分檢核', page: 'creditCheck', icon: '📊' },
  // { label: '個人設定', page: 'profile', icon: '⚙️' },
];

export default function Sidebar({ activePage, onPageChange }: SidebarProps) {
  return (
    <aside className="w-full shrink-0 rounded-3xl bg-white/55 p-4 shadow-sm backdrop-blur-xl md:min-h-[calc(100vh-48px)] md:w-64">
      <div className="px-3 py-4">
        <p className="text-2xl font-semibold text-gray-900">NCCUCS</p>
        <p className="mt-1 text-sm text-gray-500">畢業學分檢核系統</p>
      </div>
      <nav className="mt-4 flex gap-2 md:flex-col">
        {navItems.map((item) => {
          const isActive = activePage === item.page;

          return (
            <button
              key={item.page}
              className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all md:flex-none"
              style={
                isActive
                  ? { backgroundColor: '#036eb8', color: '#fff', boxShadow: '0 10px 22px rgba(3,110,184,0.20)' }
                  : { color: '#4b5563' }
              }
              onClick={() => onPageChange(item.page)}
              type="button"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
