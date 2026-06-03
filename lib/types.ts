export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tabId?: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  messageCount: number;
  proposed: boolean;
  approved: boolean;
  createdAt: Date;
}

export interface Tab {
  id: string;
  name: string;
  themeId: string;
  icon: string;
  description: string;
  createdAt: Date;
  order: number;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'proposed' | 'approved' | 'building' | 'built' | 'rejected';
  claudeCodePrompt?: string;
  proposedAt: Date;
  updatedAt: Date;
  category: 'feature' | 'integration' | 'tab' | 'structural';
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface UserMemory {
  _id?: string;
  userId: string;
  profile: {
    name: string;
    timezone?: string;
    joinedAt: Date;
    lastActive: Date;
  };
  conversations: Message[];
  themes: Theme[];
  tabs: Tab[];
  roadmap: RoadmapItem[];
  pushSubscription?: PushSubscriptionData;
  rawFacts: string[];
  // Freeform emergent data — grows as Livrr discovers what matters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emergentData: Record<string, any>;
  updatedAt: Date;
}

export interface ChatRequest {
  message: string;
  tabId?: string;
  userId: string;
}

export interface ChatResponse {
  reply: string;
  memoryUpdates?: {
    newThemes?: Theme[];
    newRoadmapItems?: RoadmapItem[];
    tabProposal?: { themeId: string; name: string };
  };
}
