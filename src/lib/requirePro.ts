import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from './supabase-server';

type ProCheckSuccess = { user: { id: string; email?: string }; error: null };
type ProCheckFailure = { user: null; error: NextResponse };
type ProCheckResult = ProCheckSuccess | ProCheckFailure;

export async function requirePro(): Promise<ProCheckResult> {
  const supabase = await createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const adminSupabase = createAdminSupabase();
  const [subResult, paymentResult] = await Promise.all([
    adminSupabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    adminSupabase
      .from('payments')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!subResult.data && !paymentResult.data) {
    return { user: null, error: NextResponse.json({ error: 'Pro subscription required' }, { status: 403 }) };
  }

  return { user: { id: user.id, email: user.email }, error: null };
}
