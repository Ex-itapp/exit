import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createAdminSupabase } from '@/lib/supabase-server';

webpush.setVapidDetails(
  'mailto:hello@ex-it.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const { title, body, data, adminSecret } = await req.json();

    // Verify Admin Secret (you must set this in your Vercel env variables!)
    if (!adminSecret || adminSecret !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin Secret' }, { status: 403 });
    }

    const supabase = createAdminSupabase();

    // Fetch all active subscriptions from everyone
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found in the database.' }, { status: 404 });
    }

    const payload = JSON.stringify({
      title: title || "EX-it Update",
      body: body || "You have a new message.",
      data: data || { url: "/" },
    });

    let successCount = 0;
    let failCount = 0;

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };
        await webpush.sendNotification(pushSubscription, payload);
        successCount++;
      } catch (err: any) {
        failCount++;
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is no longer valid, delete it
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    });

    // Wait for all push promises to resolve
    await Promise.all(sendPromises);

    return NextResponse.json({ 
      success: true, 
      sent: successCount,
      failed: failCount,
      total: subscriptions.length 
    });
  } catch (error) {
    console.error('Broadcast push error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
