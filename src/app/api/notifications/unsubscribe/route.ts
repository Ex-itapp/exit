import { NextResponse } from 'next/server';
import { createServerSupabase, createSupabaseWithToken } from '@/lib/supabase-server';

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

    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    const db = token ? createSupabaseWithToken(token) : supabase;

    const { error } = await db
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Failed to delete subscription:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
