'use client';
import { Bell, BellOff, Volume2, VolumeX } from 'lucide-react';

interface Props {
  userName: string;
  notificationsEnabled: boolean;
  voiceOutputEnabled: boolean;
  voiceSpeaking: boolean;
  onEnableNotifications: () => void;
  onToggleVoiceOutput: () => void;
  onStopSpeaking: () => void;
}

export default function Header({
  userName,
  notificationsEnabled,
  voiceOutputEnabled,
  voiceSpeaking,
  onEnableNotifications,
  onToggleVoiceOutput,
  onStopSpeaking,
}: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] safe-top">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold select-none">
          L
        </div>
        <div>
          <div className="text-sm font-semibold leading-none">Livrr</div>
          <div className="text-[10px] text-[var(--muted)] leading-none mt-0.5">{userName}</div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Voice output toggle */}
        <button
          onClick={voiceSpeaking ? onStopSpeaking : onToggleVoiceOutput}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            voiceSpeaking
              ? 'text-[var(--accent)] bg-[var(--accent)]/10'
              : voiceOutputEnabled
              ? 'text-white bg-[var(--surface-2)]'
              : 'text-[var(--muted)] hover:text-white'
          }`}
          title={
            voiceSpeaking
              ? 'Tap to stop speaking'
              : voiceOutputEnabled
              ? 'Voice on — tap to mute'
              : 'Enable voice replies'
          }
        >
          {voiceOutputEnabled || voiceSpeaking ? (
            <Volume2 size={16} className={voiceSpeaking ? 'animate-pulse' : ''} />
          ) : (
            <VolumeX size={16} />
          )}
        </button>

        {/* Push notifications toggle */}
        <button
          onClick={onEnableNotifications}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            notificationsEnabled
              ? 'text-white bg-[var(--surface-2)]'
              : 'text-[var(--muted)] hover:text-white'
          }`}
          title={notificationsEnabled ? 'Notifications on' : 'Enable notifications'}
        >
          {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
        </button>
      </div>
    </div>
  );
}
