import React from 'react';

type TabId = 'dashboard' | 'lancamentos' | 'contas' | 'familia' | 'ia' | 'configuracoes';

interface NavItemConfig {
  id: TabId;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'lancamentos', icon: 'add_circle', label: 'Lançamentos' },
  { id: 'contas', icon: 'calendar_today', label: 'Contas' },
  { id: 'familia', icon: 'groups', label: 'Família' },
  { id: 'ia', icon: 'psychology', label: 'IA' },
  { id: 'configuracoes', icon: 'settings', label: 'Ajustes' },
];

interface BottomNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  pendingNotificationCount?: number;
}

function NavItem({
  item,
  isActive,
  onClick,
  showBadge,
}: {
  item: NavItemConfig;
  isActive: boolean;
  onClick: () => void;
  showBadge?: boolean;
  key?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all select-none cursor-pointer rounded-2xl border relative ${
        isActive
          ? 'bg-indigo-500/20 text-indigo-300 font-bold scale-105 border-indigo-500/30'
          : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
      }`}
    >
      <span className={`material-symbols-outlined text-xl ${isActive ? 'material-symbols-fill' : ''}`}>
        {item.icon}
      </span>
      <span className="text-[10px] font-bold tracking-wider uppercase mt-1 font-headline">
        {item.label}
      </span>
      {showBadge && (
        <span className="absolute top-1 right-3 w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
      )}
    </button>
  );
}

export default function BottomNavigation({
  activeTab,
  onTabChange,
  pendingNotificationCount = 0,
}: BottomNavigationProps) {
  return (
    <nav
      id="bottom-navigation"
      className="fixed bottom-0 left-0 w-full z-40 bg-slate-950/70 backdrop-blur-3xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] flex justify-around items-center px-2 py-3 pb-safe"
    >
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          isActive={activeTab === item.id}
          onClick={() => onTabChange(item.id)}
          showBadge={item.id === 'lancamentos' && pendingNotificationCount > 0}
        />
      ))}
    </nav>
  );
}

export type { TabId };
