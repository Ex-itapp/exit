import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-server';
import { verifyBearerToken } from '@/lib/crypto';
import { getWebPush } from '@/lib/webpush';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!verifyBearerToken(authHeader, process.env.CRON_SECRET)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabase();
    const webpush = getWebPush();

    // Fetch all active subscriptions
    const { data: subscriptions, error } = await adminSupabase
      .from('push_subscriptions')
      .select('*');

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No subscriptions found' });
    }

    const payload = JSON.stringify({
      title: "Good Morning! ☀️",
      body: "Take 2 minutes to check in on how you're feeling today.",
      data: { url: '/dashboard' }
    });

    let sentCount = 0;
    let failedCount = 0;

    const pushPromises = subscriptions.map(async (sub) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webpush.sendNotification(pushSub, payload, { urgency: 'high', TTL: 86400 });
        sentCount++;
      } catch (err: any) {
        console.error('Failed to send push to', sub.endpoint, err);
        failedCount++;
        // If the subscription is no longer valid, delete it
        if (err.statusCode === 404 || err.statusCode === 410) {
          await adminSupabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    });

    await Promise.allSettled(pushPromises);

    return NextResponse.json({ success: true, sent: sentCount, failed: failedCount });
  } catch (error: any) {
    console.error('Morning cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
