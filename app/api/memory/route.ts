export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemory, initMemory, approveTab, updateRoadmapItemStatus, generateId } from '@/lib/memory';
import { getDb } from '@/lib/mongodb';
import { Tab } from '@/lib/types';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const memory = await getMemory(userId);
  if (!memory) return NextResponse.json({ memory: null });

  // Return safe subset — no full conversation history in every poll
  return NextResponse.json({
    memory: {
      profile: memory.profile,
      themes: memory.themes,
      tabs: memory.tabs,
      roadmap: memory.roadmap,
      conversationCount: memory.conversations.length,
      updatedAt: memory.updatedAt,
    },
  });
}

export async function POST(req: NextRequest) {
  const { action, userId, payload } = await req.json();

  if (!userId || !action) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  switch (action) {
    case 'approve_tab': {
      const memory = await getMemory(userId);
      if (!memory) return NextResponse.json({ error: 'No memory' }, { status: 404 });

      const theme = memory.themes.find(t => t.id === payload.themeId);
      if (!theme) return NextResponse.json({ error: 'Theme not found' }, { status: 404 });

      const tab: Tab = {
        id: generateId(),
        name: payload.name || theme.name,
        themeId: payload.themeId,
        icon: payload.icon || '📁',
        description: theme.description,
        createdAt: new Date(),
        order: memory.tabs.length,
      };

      await approveTab(userId, tab);

      // Mark theme as approved
      const db = await getDb();
      await db.collection('memories').updateOne(
        { userId, 'themes.id': payload.themeId },
        { $set: { 'themes.$.approved': true, 'themes.$.proposed': false } }
      );

      return NextResponse.json({ tab });
    }

    case 'reject_tab': {
      const db = await getDb();
      await db.collection('memories').updateOne(
        { userId, 'themes.id': payload.themeId },
        { $set: { 'themes.$.proposed': false } }
      );
      return NextResponse.json({ ok: true });
    }

    case 'update_roadmap_status': {
      await updateRoadmapItemStatus(userId, payload.itemId, payload.status);
      return NextResponse.json({ ok: true });
    }

    case 'rename_tab': {
      const db = await getDb();
      await db.collection('memories').updateOne(
        { userId, 'tabs.id': payload.tabId },
        { $set: { 'tabs.$.name': payload.name } }
      );
      return NextResponse.json({ ok: true });
    }

    case 'delete_tab': {
      const db = await getDb();
      await db.collection('memories').updateOne(
        { userId },
        { $pull: { tabs: { id: payload.tabId } as never } }
      );
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
