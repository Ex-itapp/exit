import { NextResponse } from 'next/server';
import { createServerSupabase } from './supabase-server';
import { getLifetimeProductIds, subscriptionGrantsAccess } from './subscription';

type ProCheckSuccess = { user: { id: string; email?: string }; error: null };
type ProCheckFailure = { user: null; error: NextResponse };
type ProCheckResult = ProCheckSuccess | ProCheckFailure;

const BYPASS_PRO = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';

/**
 * Require an authenticated user with an active subscription (or a lifetime
 * payment). Queries run through the cookie-aware client so RLS scopes them to
 * the current user — no service-role key required.
 *
 * Set NEXT_PUBLIC_AUTH_BYPASS=true in .env.local to bypass this during local
 * development. Never enable it in production.
 */
export async function requirePro(): Promise<ProCheckResult> {
  if (BYPASS_PRO) {
    return { user: { id: 'test-user', email: 'test@example.com' }, error: null };
  }

  const supabase = await createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const lifetimeProductIds = getLifetimeProductIds();
  const lifetimeProductFilter = lifetimeProductIds.length > 0 ? lifetimeProductIds : ['__none__'];

  const [subscriptionResult, paymentResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('payments')
      .select('id, product_id')
      .eq('user_id', user.id)
      .eq('status', 'succeeded')
      .in('product_id', lifetimeProductFilter)
      .limit(1)
      .maybeSingle(),
  ]);

  if (subscriptionResult.error || paymentResult.error) {
    console.error('[requirePro] subscription lookup failed:', {
      subscriptionError: subscriptionResult.error,
      paymentError: paymentResult.error,
    });
    return {
      user: null,
      error: NextResponse.json({ error: 'Unable to verify subscription' }, { status: 500 }),
    };
  }

  const sub = subscriptionResult.data;
  const hasSubscriptionAccess = sub
    ? subscriptionGrantsAccess(sub.status, sub.current_period_end)
    : false;

  const hasLifetimeAccess = Boolean(
    paymentResult.data?.product_id &&
    lifetimeProductIds.includes(paymentResult.data.product_id)
  );

  if (!hasSubscriptionAccess && !hasLifetimeAccess) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Pro subscription required' }, { status: 403 }),
    };
  }

  return { user: { id: user.id, email: user.email }, error: null };
}
