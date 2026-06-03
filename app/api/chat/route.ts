export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemory, initMemory, appendMessage, updateEmergentData, generateId } from '@/lib/memory';
import { getDb } from '@/lib/mongodb';
import { chat } from '@/lib/claude';
import { Message, Theme, RoadmapItem } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { message, tabId, userId, userName } = await req.json();
    if (!message || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or init memory
    let memory = await getMemory(userId);
    if (!memory) {
      memory = await initMemory(userId, userName || 'Friend');
    }

    // Run Claude
    const { reply, memoryUpdate } = await chat(memory, message, tabId);

    // Save user message
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      tabId,
    };
    await appendMessage(userId, userMsg);

    // Save assistant reply
    const assistantMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content: reply,
      timestamp: new Date(),
      tabId,
    };
    await appendMessage(userId, assistantMsg);

    // Process memory updates
    const db = await getDb();

    if (memoryUpdate.newFacts?.length) {
      await db.collection('memories').updateOne(
        { userId },
        { $push: { rawFacts: { $each: memoryUpdate.newFacts } as never } }
      );
    }

    if (memoryUpdate.emergentData && Object.keys(memoryUpdate.emergentData).length) {
      await updateEmergentData(userId, memoryUpdate.emergentData);
    }

    // Process theme signals
    const newThemeProposals: Theme[] = [];
    if (memoryUpdate.themeSignals?.length) {
      const existingThemes = memory.themes.map(t => t.name.toLowerCase());
      for (const signal of memoryUpdate.themeSignals) {
        if (!existingThemes.includes(signal.name.toLowerCase())) {
          const theme: Theme = {
            id: generateId(),
            name: signal.name,
            description: `Emergent theme discovered through conversation`,
            keywords: signal.keywords,
            messageCount: 1,
            proposed: true,
            approved: false,
            createdAt: new Date(),
          };
          newThemeProposals.push(theme);
          await db.collection('memories').updateOne(
            { userId },
            { $push: { themes: theme as never } }
          );
        }
      }
    }

    // Process roadmap proposals
    const newRoadmapItems: RoadmapItem[] = [];
    if (memoryUpdate.roadmapProposals?.length) {
      for (const proposal of memoryUpdate.roadmapProposals) {
        const item: RoadmapItem = {
          id: generateId(),
          title: proposal.title,
          description: proposal.description,
          status: 'proposed',
          claudeCodePrompt: proposal.claudeCodePrompt,
          proposedAt: new Date(),
          updatedAt: new Date(),
          category: proposal.category,
        };
        newRoadmapItems.push(item);
        await db.collection('memories').updateOne(
          { userId },
          { $push: { roadmap: item as never } }
        );
      }
    }

    return NextResponse.json({
      reply,
      assistantMessageId: assistantMsg.id,
      memoryUpdates: {
        newThemes: newThemeProposals,
        newRoadmapItems,
      },
    });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
