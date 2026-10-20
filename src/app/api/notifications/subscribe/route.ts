import { NextResponse } from 'next/server';
import { createServerSupabase, createSupabaseWithToken } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '') || '';

    const supabase = await createServerSupabase();

    // Verify the bearer token when present, otherwise use the cookie session.
    const { data: { user }, error: authError } = token
      ? await supabase.auth.getUser(token)
      : await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    const { subscription } = await req.json();

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    // RLS scopes writes to the authenticated user. Prefer a token-scoped client
    // for bearer-auth requests so the request works even without cookies.
    const db = token ? createSupabaseWithToken(token) : supabase;

    const { error: dbError } = await db
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys?.p256dh,
          auth: subscription.keys?.auth,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

    if (dbError) {
      console.error('Supabase error saving subscription:', dbError);
      return NextResponse.json(
        { error: 'Failed to save to database', details: dbError.message || dbError.toString() },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
