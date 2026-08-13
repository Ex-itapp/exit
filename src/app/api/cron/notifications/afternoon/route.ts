import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-server';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = 'mailto:hello@exitapp.com';

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabase();

    // Fetch all active subscriptions
    const { data: subscriptions, error } = await adminSupabase
      .from('push_subscriptions')
      .select('*');

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No subscriptions found' });
    }

    let sentCount = 0;
    let failedCount = 0;

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const pushPromises = subscriptions.map(async (sub) => {
      try {
        // Get user profile to check last_active_at
        const { data: profile } = await adminSupabase
          .from('user_profiles')
          .select('last_active_at')
          .eq('id', sub.user_id)
          .maybeSingle();

        const lastActive = profile?.last_active_at ? new Date(profile.last_active_at) : null;
        const isActiveToday = lastActive && lastActive >= todayStart;

        let title = "";
        let body = "";

        if (!isActiveToday) {
          title = "We are here for you 💛";
          body = "Whenever you're ready, open the app to continue your healing journey.";
        } else {
          // Check if they made any entries today
          const [checkinsRes, diaryRes] = await Promise.all([
            adminSupabase.from('checkins').select('id').eq('user_id', sub.user_id).gte('created_at', todayStart.toISOString()).limit(1),
            adminSupabase.from('diary_entries').select('id').eq('user_id', sub.user_id).gte('created_at', todayStart.toISOString()).limit(1)
          ]);

          const hasEntries = (checkinsRes.data && checkinsRes.data.length > 0) || (diaryRes.data && diaryRes.data.length > 0);

          if (!hasEntries) {
            title = "We see you! 👀";
            body = "You opened the app today but didn't write anything. Take 2 minutes to log your thoughts.";
          } else {
            // If they already did everything, skip afternoon notification so we don't spam them
            return;
          }
        }

        const payload = JSON.stringify({
          title,
          body,
          data: { url: '/dashboard' }
        });

        const pushSub = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        await webpush.sendNotification(pushSub, payload, { urgency: 'high', TTL: 86400 });
        sentCount++;
      } catch (err: any) {
        console.error('Failed to send push to', sub.endpoint, err);
        failedCount++;
        if (err.statusCode === 404 || err.statusCode === 410) {
          await adminSupabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    });

    await Promise.allSettled(pushPromises);

    return NextResponse.json({ success: true, sent: sentCount, failed: failedCount });
  } catch (error: any) {
    console.error('Afternoon cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
