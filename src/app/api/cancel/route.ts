import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '../../../lib/supabase-server';
import { getDodoClient } from '../../../lib/dodo';

export async function POST() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabase();
    const { data: sub } = await adminSupabase
      .from('subscriptions')
      .select('dodo_subscription_id')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub?.dodo_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const dodo = getDodoClient();
    await dodo.subscriptions.update(sub.dodo_subscription_id, {
      cancel_at_next_billing_date: true,
      cancellation_comment: 'Cancelled by user from account settings',
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled. You retain access until the end of the billing period. No refunds will be issued for the current billing period.',
    });
  } catch (error) {
    console.error('[cancel] error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
