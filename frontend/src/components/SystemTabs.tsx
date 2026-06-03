import { NavLink } from 'react-router-dom';

const tabs = [
  { label: '修課紀錄', to: '/records' },
  { label: '畢業學分狀態', to: '/status' }
];

export default function SystemTabs() {
  return (
    <nav
      aria-label="系統頁面切換"
      className="mb-8 inline-flex w-full rounded-2xl p-1 sm:w-auto"
      style={{
        background: 'rgba(255,255,255,0.45)',
        border: '1px solid rgba(255,255,255,0.65)',
        boxShadow: '0 8px 24px rgba(100,140,180,0.12)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => [
            'flex-1 rounded-xl px-5 py-2.5 text-center text-sm font-semibold transition-all sm:flex-none',
            isActive
              ? 'text-white shadow-sm'
              : 'text-gray-500 hover:bg-white/45 hover:text-gray-800',
          ].join(' ')}
          style={({ isActive }) => (
            isActive
              ? { backgroundColor: '#036eb8' }
              : undefined
          )}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
