'use client';
import { Tab } from '@/lib/types';
import { MessageSquare, Map, Plus } from 'lucide-react';

interface Props {
  tabs: Tab[];
  activeTabId: string | null;
  onSelectTab: (tabId: string | null) => void;
}

const ICON_MAP: Record<string, string> = {
  '💼': '💼', '🔬': '🔬', '❤️': '❤️', '🎯': '🎯',
  '📖': '📖', '💰': '💰', '🏥': '🏥', '🌍': '🌍',
  '📁': '📁',
};

export default function TabBar({ tabs, activeTabId, onSelectTab }: Props) {
  const isMain = activeTabId === null;

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-[var(--border)] overflow-x-auto scrollbar-none">
      {/* Main conversation */}
      <button
        onClick={() => onSelectTab(null)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
          isMain
            ? 'bg-[var(--accent)] text-white'
            : 'text-[var(--muted)] hover:text-white hover:bg-[var(--surface-2)]'
        }`}
      >
        <MessageSquare size={13} />
        <span>Livrr</span>
      </button>

      {/* Roadmap tab */}
      <button
        onClick={() => onSelectTab('__roadmap__')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
          activeTabId === '__roadmap__'
            ? 'bg-[var(--accent)] text-white'
            : 'text-[var(--muted)] hover:text-white hover:bg-[var(--surface-2)]'
        }`}
      >
        <Map size={13} />
        <span>Roadmap</span>
      </button>

      {/* User-approved tabs */}
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
            activeTabId === tab.id
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--muted)] hover:text-white hover:bg-[var(--surface-2)]'
          }`}
        >
          <span className="text-xs">{ICON_MAP[tab.icon] || '📁'}</span>
          <span>{tab.name}</span>
        </button>
      ))}
    </div>
  );
}
