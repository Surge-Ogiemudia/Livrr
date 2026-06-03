'use client';
import { Message } from '@/lib/types';
import { formatDistanceToNow } from '@/lib/utils';

interface Props {
  message: Message;
  userName: string;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[a-z])(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return match;
    });
}

export default function MessageBubble({ message, userName }: Props) {
  const isUser = message.role === 'user';
  const time = formatDistanceToNow(new Date(message.timestamp));

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%]">
          <div className="bg-[var(--accent)] rounded-2xl rounded-tr-md px-4 py-2.5 text-white text-sm leading-relaxed">
            {message.content}
          </div>
          <div className="text-right text-[10px] text-[var(--muted)] mt-1 pr-1">{time}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[88%]">
        <div className="text-xs text-[var(--muted)] mb-1 ml-1">Livrr</div>
        <div
          className="bg-[var(--surface)] rounded-2xl rounded-tl-md px-4 py-3 text-sm text-[var(--foreground)] prose-livrr"
          dangerouslySetInnerHTML={{
            __html: `<p>${renderMarkdown(message.content)}</p>`,
          }}
        />
        <div className="text-[10px] text-[var(--muted)] mt-1 ml-1">{time}</div>
      </div>
    </div>
  );
}

export function ThinkingBubble() {
  return (
    <div className="flex justify-start mb-4">
      <div>
        <div className="text-xs text-[var(--muted)] mb-1 ml-1">Livrr</div>
        <div className="bg-[var(--surface)] rounded-2xl rounded-tl-md px-4 py-3 flex gap-1 items-center">
          <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-[var(--muted)] inline-block" />
          <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-[var(--muted)] inline-block" />
          <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-[var(--muted)] inline-block" />
        </div>
      </div>
    </div>
  );
}
