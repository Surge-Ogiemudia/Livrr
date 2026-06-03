'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Theme, Tab, RoadmapItem } from '@/lib/types';
import { useUser } from '@/hooks/useUser';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useVoiceOutput } from '@/hooks/useVoice';
import Onboarding from './Onboarding';
import Header from './Header';
import TabBar from './TabBar';
import MessageBubble, { ThinkingBubble } from './MessageBubble';
import ChatInput from './ChatInput';
import ThemeProposal from './ThemeProposal';
import RoadmapView from './RoadmapView';

interface MemoryState {
  themes: Theme[];
  tabs: Tab[];
  roadmap: RoadmapItem[];
  conversationCount: number;
}

export default function LivrrApp() {
  const { user, loading: userLoading, createUser } = useUser();
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [memory, setMemory] = useState<MemoryState>({
    themes: [], tabs: [], roadmap: [], conversationCount: 0,
  });
  const [pendingThemeProposals, setPendingThemeProposals] = useState<Theme[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { subscribed, subscribe } = usePushNotifications(user?.id);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const { speaking, enabled: voiceOutputEnabled, speak, stop: stopSpeaking, toggleEnabled: toggleVoiceOutput } = useVoiceOutput();

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  // Load memory when user is ready
  useEffect(() => {
    if (!user) return;
    loadMemory();
    loadMessages(null);
  }, [user]);

  // Reload messages when tab changes
  useEffect(() => {
    if (!user || activeTabId === '__roadmap__') return;
    loadMessages(activeTabId);
  }, [activeTabId, user]);

  async function loadMemory() {
    if (!user) return;
    const res = await fetch(`/api/memory?userId=${user.id}`);
    const data = await res.json();
    if (data.memory) {
      setMemory(data.memory);
    }
  }

  async function loadMessages(tabId: string | null) {
    if (!user) return;
    const url = tabId
      ? `/api/conversations?userId=${user.id}&tabId=${tabId}`
      : `/api/conversations?userId=${user.id}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.messages) {
      setMessages(data.messages);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  async function handleSend(text: string) {
    if (!user) return;

    const userMsg: Message = {
      id: `tmp_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
      tabId: activeTabId || undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          tabId: activeTabId || undefined,
          userId: user.id,
          userName: user.name,
        }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: data.assistantMessageId || `tmp_${Date.now()}_a`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
        tabId: activeTabId || undefined,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Speak the reply if voice output is on
      speak(data.reply);

      // Handle new themes proposed
      if (data.memoryUpdates?.newThemes?.length) {
        setPendingThemeProposals(prev => [...prev, ...data.memoryUpdates.newThemes]);
      }

      // Refresh memory state
      await loadMemory();
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: "Something went wrong on my end. Try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  async function handleApproveTab(themeId: string, tabName: string, icon: string) {
    if (!user) return;
    const res = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve_tab',
        userId: user.id,
        payload: { themeId, name: tabName, icon },
      }),
    });
    const data = await res.json();
    if (data.tab) {
      setMemory(prev => ({ ...prev, tabs: [...prev.tabs, data.tab] }));
    }
    setPendingThemeProposals(prev => prev.filter(t => t.id !== themeId));
  }

  async function handleRejectTab(themeId: string) {
    if (!user) return;
    await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reject_tab',
        userId: user.id,
        payload: { themeId },
      }),
    });
    setPendingThemeProposals(prev => prev.filter(t => t.id !== themeId));
  }

  async function handleRoadmapStatusChange(itemId: string, status: RoadmapItem['status']) {
    if (!user) return;
    await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_roadmap_status',
        userId: user.id,
        payload: { itemId, status },
      }),
    });
    setMemory(prev => ({
      ...prev,
      roadmap: prev.roadmap.map(r => r.id === itemId ? { ...r, status, updatedAt: new Date() } : r),
    }));
  }

  async function handleEnableNotifications() {
    const ok = await subscribe();
    if (ok) setNotifEnabled(true);
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex gap-1">
          <span className="thinking-dot w-2 h-2 rounded-full bg-[var(--accent)] inline-block" />
          <span className="thinking-dot w-2 h-2 rounded-full bg-[var(--accent)] inline-block" />
          <span className="thinking-dot w-2 h-2 rounded-full bg-[var(--accent)] inline-block" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Onboarding onComplete={(name) => createUser(name)} />;
  }

  const isRoadmap = activeTabId === '__roadmap__';

  return (
    <div className="flex flex-col h-full">
      <Header
        userName={user.name}
        notificationsEnabled={notifEnabled || subscribed}
        voiceOutputEnabled={voiceOutputEnabled}
        voiceSpeaking={speaking}
        onEnableNotifications={handleEnableNotifications}
        onToggleVoiceOutput={toggleVoiceOutput}
        onStopSpeaking={stopSpeaking}
      />

      <TabBar
        tabs={memory.tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
      />

      {/* Theme proposals */}
      {pendingThemeProposals.length > 0 && (
        <div className="pt-3">
          {pendingThemeProposals.map(theme => (
            <ThemeProposal
              key={theme.id}
              theme={theme}
              onApprove={handleApproveTab}
              onReject={handleRejectTab}
            />
          ))}
        </div>
      )}

      {isRoadmap ? (
        <RoadmapView
          roadmap={memory.roadmap}
          userId={user.id}
          onStatusChange={handleRoadmapStatusChange}
        />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 pt-4">
            {messages.length === 0 && !thinking && (
              <div className="flex flex-col items-center justify-center h-full text-center px-8 space-y-3">
                <div className="text-2xl font-light">Hey, {user.name}.</div>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  What&apos;s on your mind?
                </p>
              </div>
            )}
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} userName={user.name} />
            ))}
            {thinking && <ThinkingBubble />}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            onSend={handleSend}
            disabled={thinking}
            placeholder={`Tell me anything, ${user.name}...`}
          />
        </>
      )}
    </div>
  );
}
