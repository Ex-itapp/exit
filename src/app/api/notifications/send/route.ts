import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createServerSupabase } from '@/lib/supabase-server';

webpush.setVapidDetails(
  'mailto:hello@ex-it.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    // Note: We use the service role key or require standard auth depending on how this is called.
    // For now, we will require the caller to be authenticated (e.g. testing their own push) 
    // or you can secure this with an API key if called from a cron job.
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, data, targetUserId } = await req.json();
    
    // Allow users to send to themselves, or admins to send to targetUserId
    const userIdToNotify = targetUserId || user.id;

    // Fetch all active subscriptions for the user
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userIdToNotify);

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
    }

    const payload = JSON.stringify({
      title,
      body,
      data,
    });

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
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is no longer valid, delete it
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          console.error('Error sending push notification:', err);
        }
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, count: subscriptions.length });
  } catch (error) {
    console.error('Send push error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
