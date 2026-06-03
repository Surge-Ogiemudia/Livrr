export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemory } from '@/lib/memory';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const tabId = req.nextUrl.searchParams.get('tabId');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');

  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const memory = await getMemory(userId);
  if (!memory) return NextResponse.json({ messages: [] });

  let messages = memory.conversations;

  if (tabId) {
    messages = messages.filter(m => m.tabId === tabId);
  } else {
    // Main conversation — messages with no tabId
    messages = messages.filter(m => !m.tabId);
  }

  // Return most recent N messages
  messages = messages.slice(-limit);

  return NextResponse.json({ messages });
}
