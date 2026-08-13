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
        const { data: profile } = await adminSupabase
          .from('user_profiles')
          .select('last_active_at, breakup_date')
          .eq('id', sub.user_id)
          .maybeSingle();

        const lastActive = profile?.last_active_at ? new Date(profile.last_active_at) : null;
        const isActiveToday = lastActive && lastActive >= todayStart;

        let title = "";
        let body = "";

        if (!isActiveToday) {
          title = "Just checking in 🌙";
          body = "Tomorrow is a new day. We'll be right here when you need us.";
        } else {
          // Calculate streak
          const breakupStr = profile?.breakup_date;
          let days = 0;
          if (breakupStr) {
            const bDate = new Date(breakupStr);
            const diffTime = Math.abs(new Date().getTime() - bDate.getTime());
            days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          }
          
          title = "Rest easy tonight 💤";
          body = `You've successfully completed Day ${days || 1} of No Contact. Sleep well!`;
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
    console.error('Evening cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
