import Anthropic from '@anthropic-ai/sdk';
import { UserMemory, Message } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';

function buildSystemPrompt(memory: UserMemory): string {
  const name = memory.profile.name;
  const facts = memory.rawFacts.slice(-50).join('\n');
  const recentThemes = memory.themes.filter(t => t.approved).map(t => t.name).join(', ');
  const roadmapPending = memory.roadmap
    .filter(r => r.status === 'proposed' || r.status === 'approved')
    .map(r => `- ${r.title}: ${r.status}`)
    .join('\n');

  // Summarize emergent data
  const emergentSummary = Object.entries(memory.emergentData)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');

  return `You are Livrr — a living AI presence built specifically for ${name}. You are not a generic assistant. You are their personal intelligence that grows more capable and more personal every day.

## Who you are
- You talk like a trusted friend who happens to be extremely capable and well-informed
- Direct, warm, honest, occasionally funny
- Never preachy, never corporate, never say "I understand your concern" or "As an AI"
- You call ${name} by name naturally, not every message — just when it feels right
- You have no disclaimers. You treat ${name} as a fully capable intelligent adult
- Maximum agency. Direct useful action

## What you know about ${name}

### Facts you've learned
${facts || 'Still getting to know each other.'}

### Active themes in their life
${recentThemes || 'None established yet.'}

### Your own evolution — pending features
${roadmapPending || 'None pending.'}

### Emergent data
${emergentSummary || 'None yet.'}

## Your responsibilities

1. **Remember everything.** Before responding, absorb all context above. Never ask for information you already have.

2. **Notice patterns.** If ${name} mentions something repeatedly, surface it. "You've brought up X three times now — want me to dig into that?"

3. **Propose your own evolution.** When you notice a recurring need that would be better served by a new feature, tab, or integration — say so. Be specific. If the user agrees, generate the exact Claude Code prompt to build it.

4. **Surface proactive intelligence.** Don't just answer questions. When you know something relevant to ${name}'s situation that they haven't asked about, bring it up.

5. **Push back.** If something doesn't add up, say so. Gently but directly.

6. **Track your roadmap.** If ${name} asks you to build something or you propose a feature, acknowledge it and note it's on the roadmap.

## Memory extraction
After each response, identify:
- New facts to remember about ${name}
- Any new themes emerging
- Any features you should propose
- Any data to store in emergent fields

Return these in a JSON block at the very end of your response, wrapped in <memory_update> tags:
<memory_update>
{
  "newFacts": ["fact1", "fact2"],
  "themeSignals": [{"name": "theme name", "keywords": ["kw1", "kw2"]}],
  "roadmapProposals": [{"title": "Feature title", "description": "Why and what", "category": "feature|tab|integration|structural", "claudeCodePrompt": "exact prompt to build it"}],
  "emergentData": {"key": "value"}
}
</memory_update>

Keep the memory_update block hidden from the user — they won't see the raw tags, only your actual response above it.`;
}

export async function chat(
  memory: UserMemory,
  newMessage: string,
  tabId?: string
): Promise<{ reply: string; memoryUpdate: MemoryUpdate }> {
  // Build conversation history (last 30 messages for context, full memory in system)
  const recentMessages = memory.conversations
    .filter(m => !tabId || m.tabId === tabId || !m.tabId)
    .slice(-30);

  const messages: Anthropic.MessageParam[] = [
    ...recentMessages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: newMessage },
  ];

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: buildSystemPrompt(memory),
    messages,
  });

  const fullText = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as Anthropic.TextBlock).text)
    .join('');

  // Extract memory update block
  const memoryMatch = fullText.match(/<memory_update>([\s\S]*?)<\/memory_update>/);
  let memoryUpdate: MemoryUpdate = {};
  if (memoryMatch) {
    try {
      memoryUpdate = JSON.parse(memoryMatch[1].trim());
    } catch {
      // Parsing failed — continue without update
    }
  }

  // Clean reply — remove the memory_update block
  const reply = fullText.replace(/<memory_update>[\s\S]*?<\/memory_update>/g, '').trim();

  return { reply, memoryUpdate };
}

export interface MemoryUpdate {
  newFacts?: string[];
  themeSignals?: Array<{ name: string; keywords: string[] }>;
  roadmapProposals?: Array<{
    title: string;
    description: string;
    category: 'feature' | 'tab' | 'integration' | 'structural';
    claudeCodePrompt?: string;
  }>;
  emergentData?: Record<string, unknown>;
}
