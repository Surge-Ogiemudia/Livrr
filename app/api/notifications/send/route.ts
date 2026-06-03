export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getMemory } from '@/lib/memory';

let vapidConfigured = false;
function ensureVapid() {
  if (!vapidConfigured) {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    vapidConfigured = true;
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureVapid();
    const { userId, title, body, url } = await req.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const memory = await getMemory(userId);
    if (!memory?.pushSubscription) {
      return NextResponse.json({ error: 'No push subscription found' }, { status: 404 });
    }

    const payload = JSON.stringify({
      title: title || 'Livrr',
      body: body || 'Something needs your attention.',
      url: url || '/',
    });

    await webpush.sendNotification(memory.pushSubscription as webpush.PushSubscription, payload);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Push error:', err);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
