'use client';
import { Theme } from '@/lib/types';
import { X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  theme: Theme;
  onApprove: (themeId: string, tabName: string, icon: string) => void;
  onReject: (themeId: string) => void;
}

const ICON_OPTIONS = ['📁', '💼', '🔬', '❤️', '🎯', '📖', '💰', '🏥', '🌍', '🎨', '⚡', '🧠'];

export default function ThemeProposal({ theme, onApprove, onReject }: Props) {
  const [tabName, setTabName] = useState(theme.name);
  const [selectedIcon, setSelectedIcon] = useState('📁');

  return (
    <div className="slide-in-right bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-xl mx-4 mb-3 space-y-3">
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium">New theme detected</div>
        <button onClick={() => onReject(theme.id)} className="text-[var(--muted)] hover:text-white">
          <X size={14} />
        </button>
      </div>

      <p className="text-xs text-[var(--muted)] leading-relaxed">
        I&apos;ve noticed a recurring theme around <strong className="text-white">{theme.name}</strong>. Want me to create a dedicated space for it?
      </p>

      <div className="space-y-2">
        <input
          value={tabName}
          onChange={e => setTabName(e.target.value)}
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
          placeholder="Tab name"
        />

        <div className="flex gap-1.5 flex-wrap">
          {ICON_OPTIONS.map(icon => (
            <button
              key={icon}
              onClick={() => setSelectedIcon(icon)}
              className={`text-sm p-1 rounded-lg transition-colors ${
                selectedIcon === icon ? 'bg-[var(--accent)]' : 'hover:bg-[var(--surface-2)]'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onApprove(theme.id, tabName.trim() || theme.name, selectedIcon)}
          className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-dim)] rounded-xl py-2 text-xs font-medium transition-colors"
        >
          Create tab
        </button>
        <button
          onClick={() => onReject(theme.id)}
          className="px-3 py-2 text-xs text-[var(--muted)] hover:text-white transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
