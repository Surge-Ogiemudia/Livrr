'use client';
import { RoadmapItem } from '@/lib/types';
import { CheckCircle, Clock, Zap, XCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Props {
  roadmap: RoadmapItem[];
  userId: string;
  onStatusChange: (itemId: string, status: RoadmapItem['status']) => void;
}

const STATUS_CONFIG = {
  proposed: { icon: Clock, color: 'text-yellow-400', label: 'Proposed' },
  approved: { icon: Zap, color: 'text-blue-400', label: 'Approved' },
  building: { icon: Zap, color: 'text-purple-400', label: 'Building' },
  built: { icon: CheckCircle, color: 'text-green-400', label: 'Built' },
  rejected: { icon: XCircle, color: 'text-[var(--muted)]', label: 'Rejected' },
};

const CATEGORY_LABELS = {
  feature: 'Feature',
  tab: 'New Tab',
  integration: 'Integration',
  structural: 'Architecture',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-white transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy prompt'}
    </button>
  );
}

export default function RoadmapView({ roadmap, userId, onStatusChange }: Props) {
  const active = roadmap.filter(r => r.status !== 'rejected' && r.status !== 'built');
  const built = roadmap.filter(r => r.status === 'built');
  const rejected = roadmap.filter(r => r.status === 'rejected');

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-sm">Livrr Roadmap</h2>
        <p className="text-xs text-[var(--muted)]">
          {active.length} active · {built.length} built · {rejected.length} rejected
        </p>
      </div>

      {active.length === 0 && built.length === 0 && (
        <div className="text-center py-12 text-[var(--muted)] text-sm">
          <p>No features proposed yet.</p>
          <p className="text-xs mt-2">Livrr will suggest improvements as you use it.</p>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Active</h3>
          {active.map(item => <RoadmapCard key={item.id} item={item} onStatusChange={onStatusChange} />)}
        </div>
      )}

      {built.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Built</h3>
          {built.map(item => <RoadmapCard key={item.id} item={item} onStatusChange={onStatusChange} />)}
        </div>
      )}
    </div>
  );
}

function RoadmapCard({ item, onStatusChange }: { item: RoadmapItem; onStatusChange: (id: string, status: RoadmapItem['status']) => void }) {
  const cfg = STATUS_CONFIG[item.status];
  const Icon = cfg.icon;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <Icon size={14} className={`${cfg.color} mt-0.5 shrink-0`} />
          <div className="min-w-0">
            <div className="font-medium text-sm">{item.title}</div>
            <div className="text-xs text-[var(--muted)]">
              {CATEGORY_LABELS[item.category]} · {cfg.label}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--muted)] leading-relaxed">{item.description}</p>

      {item.claudeCodePrompt && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            {expanded ? 'Hide' : 'Show'} build prompt
          </button>
          {expanded && (
            <div className="mt-2 space-y-2">
              <div className="bg-[#1e1e2e] border border-[var(--border)] rounded-lg p-3 text-xs font-mono text-[var(--foreground)] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {item.claudeCodePrompt}
              </div>
              <CopyButton text={item.claudeCodePrompt} />
            </div>
          )}
        </div>
      )}

      {item.status !== 'built' && item.status !== 'rejected' && (
        <div className="flex gap-2 pt-1">
          {item.status === 'proposed' && (
            <button
              onClick={() => onStatusChange(item.id, 'approved')}
              className="text-xs px-3 py-1 bg-[var(--accent)] hover:bg-[var(--accent-dim)] rounded-lg transition-colors"
            >
              Approve
            </button>
          )}
          {(item.status === 'approved' || item.status === 'proposed') && (
            <button
              onClick={() => onStatusChange(item.id, 'building')}
              className="text-xs px-3 py-1 bg-[var(--surface-2)] hover:bg-[var(--border)] rounded-lg transition-colors"
            >
              Mark building
            </button>
          )}
          {item.status === 'building' && (
            <button
              onClick={() => onStatusChange(item.id, 'built')}
              className="text-xs px-3 py-1 bg-green-800 hover:bg-green-700 rounded-lg transition-colors"
            >
              Mark built
            </button>
          )}
          <button
            onClick={() => onStatusChange(item.id, 'rejected')}
            className="text-xs px-3 py-1 text-[var(--muted)] hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
