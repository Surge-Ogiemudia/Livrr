'use client';
import { useState } from 'react';

interface Props {
  onComplete: (name: string) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [stage, setStage] = useState<'name' | 'intro'>('name');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setStage('intro');
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 max-w-md mx-auto">
      {stage === 'name' ? (
        <form onSubmit={handleSubmit} className="w-full space-y-8">
          <div className="space-y-2">
            <div className="text-4xl font-light tracking-tight">Livrr</div>
            <p className="text-[var(--muted)] text-sm">Your living intelligence. Not an app. A presence.</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-[var(--muted)]">What should I call you?</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors text-base"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-dim)] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl px-4 py-3 font-medium transition-colors"
          >
            Begin
          </button>
        </form>
      ) : (
        <div className="w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="text-2xl font-light">Hi, {name}.</div>
            <p className="text-[var(--muted)] leading-relaxed">
              I&apos;m Livrr. I&apos;ll learn who you are, remember everything you tell me, and grow more useful every day.
            </p>
            <p className="text-[var(--muted)] text-sm leading-relaxed">
              No structure imposed. No features assumed. Just you and me figuring out what actually matters.
            </p>
          </div>

          <button
            onClick={() => onComplete(name.trim())}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-dim)] rounded-xl px-4 py-3 font-medium transition-colors"
          >
            Let&apos;s go
          </button>
        </div>
      )}
    </div>
  );
}
