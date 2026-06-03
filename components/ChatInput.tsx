'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoice';

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { listening, supported: voiceSupported, toggle: toggleVoice } = useVoiceInput({
    onResult: (transcript) => {
      // Auto-send voice transcript directly
      if (transcript && !disabled) {
        onSend(transcript);
      }
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const msg = value.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 px-3 py-3 border-t border-[var(--border)] bg-black safe-bottom"
    >
      {/* Voice button */}
      {voiceSupported && (
        <button
          type="button"
          onClick={toggleVoice}
          disabled={disabled}
          title={listening ? 'Stop listening' : 'Speak'}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
            listening
              ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] scale-110'
              : 'bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)]'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {listening ? (
            // Animated waveform while listening
            <span className="flex gap-[3px] items-end h-4">
              {[0, 1, 2, 3].map(i => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-white"
                  style={{
                    height: `${40 + Math.sin(i * 1.2) * 30}%`,
                    animation: `pulse-bar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                  }}
                />
              ))}
            </span>
          ) : (
            <MicIcon />
          )}
        </button>
      )}

      {/* Text input */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || listening}
        placeholder={listening ? 'Listening...' : (placeholder || 'Say anything...')}
        rows={1}
        className={`flex-1 resize-none bg-[var(--surface)] border rounded-2xl px-4 py-2.5 text-sm focus:outline-none placeholder-[var(--muted)] transition-colors leading-relaxed ${
          listening
            ? 'border-red-500/50 text-[var(--muted)]'
            : 'border-[var(--border)] focus:border-[var(--accent)]'
        }`}
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="w-10 h-10 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-dim)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-colors"
      >
        <ArrowUp size={16} />
      </button>

      <style>{`
        @keyframes pulse-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </form>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}
