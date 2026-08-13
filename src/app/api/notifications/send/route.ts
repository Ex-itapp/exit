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
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
    }

    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    const { title, body, data, targetUserId, adminSecret } = await req.json();
    
    // Security check: Only allow users to ping themselves, UNLESS they provide the admin secret
    if (targetUserId && targetUserId !== user.id) {
      if (adminSecret !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized to ping other users' }, { status: 403 });
      }
    }

    const userIdToNotify = targetUserId || user.id;

    const { createAdminSupabase } = await import('@/lib/supabase-server');
    const adminSupabase = createAdminSupabase();

    // Fetch all active subscriptions for the user
    const { data: subscriptions, error } = await adminSupabase
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
