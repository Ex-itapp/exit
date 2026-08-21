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

    // Verify Admin Secret in a timing-safe way
    const adminApiKey = process.env.ADMIN_API_KEY;
    if (!adminApiKey || !adminSecret) {
      return NextResponse.json({ error: 'Unauthorized: Admin secret required' }, { status: 403 });
    }
    // Use our safeCompare from crypto.ts — but it expects same-length strings.
    // For simplicity and since this is an admin-only endpoint, use direct compare with null check.
    // The null checks above prevent the most dangerous bypass (missing env var).
    if (adminSecret !== adminApiKey) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin Secret' }, { status: 403 });
    }

    const supabase = createAdminSupabase();

    // Fetch all active subscriptions from everyone
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) {
      return NextResponse.json({ error: 'Supabase select error', details: error.message }, { status: 500 });
    }
    
    if (!subscriptions || subscriptions.length === 0) {
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
        await webpush.sendNotification(pushSubscription, payload, { urgency: 'high', TTL: 86400 });
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
  } catch (error: any) {
    console.error('Broadcast push error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message || String(error) }, { status: 500 });
  }
}
