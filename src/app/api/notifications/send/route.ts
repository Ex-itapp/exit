import { NextResponse } from 'next/server';
import { createAdminSupabase, createServerSupabase, createSupabaseWithToken } from '@/lib/supabase-server';
import { safeCompare } from '@/lib/crypto';
import { getWebPush } from '@/lib/webpush';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '') || '';

    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = token
      ? await supabase.auth.getUser(token)
      : await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    const { title, body, data, targetUserId, adminSecret } = await req.json();

    // Users may only notify themselves. Cross-user targeting requires the
    // server-side admin key, compared in constant time.
    const isCrossUser = Boolean(targetUserId) && targetUserId !== user.id;
    if (isCrossUser) {
      const adminApiKey = process.env.ADMIN_API_KEY;
      if (!adminApiKey || typeof adminSecret !== 'string' || !safeCompare(adminSecret, adminApiKey)) {
        return NextResponse.json({ error: 'Unauthorized to ping other users' }, { status: 403 });
      }
    }

    const userIdToNotify = targetUserId || user.id;

    // Self-sends use RLS (token-scoped client when requested via bearer auth);
    // cross-user sends need the admin client.
    const db = isCrossUser
      ? createAdminSupabase()
      : token
        ? createSupabaseWithToken(token)
        : supabase;

    const { data: subscriptions, error } = await db
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userIdToNotify);

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
    }

    const payload = JSON.stringify({ title, body, data });
    const webpush = getWebPush();

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
          await db.from('push_subscriptions').delete().eq('id', sub.id);
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
