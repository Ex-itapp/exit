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
    // If ADMIN_API_KEY is not set, adminSecret will never match — so cross-user targeting is always blocked
    if (targetUserId && targetUserId !== user.id) {
      const adminApiKey = process.env.ADMIN_API_KEY;
      if (!adminApiKey || !adminSecret || adminSecret !== adminApiKey) {
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
        await webpush.sendNotification(pushSubscription, payload, { urgency: 'high', TTL: 86400 });
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await adminSupabase.from('push_subscriptions').delete().eq('id', sub.id);
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
