import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
    }

    const supabase = await createServerSupabase();
    
    // Verify the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    // Instead of upsert (which requires a UNIQUE constraint the user might have forgotten),
    // we manually check if the endpoint exists, then update or insert.
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', subscription.endpoint)
      .maybeSingle();

    let dbError;
    if (existing) {
      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          user_id: user.id,
          p256dh: subscription.keys?.p256dh,
          auth: subscription.keys?.auth,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      dbError = error;
    } else {
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys?.p256dh,
          auth: subscription.keys?.auth,
        });
      dbError = error;
    }

    if (dbError) {
      console.error('Supabase error saving subscription:', dbError);
      return NextResponse.json({ error: 'Failed to save to database', details: dbError.message || dbError.toString() }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
