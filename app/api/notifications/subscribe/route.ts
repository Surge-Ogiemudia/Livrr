export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { savePushSubscription } from '@/lib/memory';

export async function POST(req: NextRequest) {
  try {
    const { userId, subscription } = await req.json();
    if (!userId || !subscription) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await savePushSubscription(userId, {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}
