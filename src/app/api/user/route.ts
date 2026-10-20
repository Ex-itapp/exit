import { NextResponse } from 'next/server';
import { createServerSupabase, createSupabaseWithToken } from '../../../lib/supabase-server';
import { getLifetimeProductIds, subscriptionGrantsAccess } from '../../../lib/subscription';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Always authenticate via cookie session first, or fallback to Authorization header
    const supabase = await createServerSupabase();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '') || '';
    const { data: { user }, error: authError } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ user: null, isPro: false, paymentFailed: false });
    }

    // Always use the authenticated user's ID — ignore any query param userId to prevent IDOR
    const userId = user.id;
    // RLS scopes subscriptions/payments to the current user. Prefer a
    // token-scoped client when the request authenticated via bearer token.
    const db = token ? createSupabaseWithToken(token) : supabase;

    const userInfo = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    };

    if (!userId) {
      return NextResponse.json({ user: null, isPro: false, paymentFailed: false });
    }

    // Run subscription & payment checks in parallel. Queries are scoped by RLS
    // to the authenticated user.
    const lifetimeProductIds = getLifetimeProductIds();
    const lifetimeProductFilter = lifetimeProductIds.length > 0 ? lifetimeProductIds : ['__none__'];

    const [subResult, paymentResult, failedPaymentResult] = await Promise.all([
      db
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      db
        .from('payments')
        .select('status, product_id')
        .eq('user_id', userId)
        .eq('status', 'succeeded')
        .in('product_id', lifetimeProductFilter)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      db
        .from('payments')
        .select('status, created_at')
        .eq('user_id', userId)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (subResult.error) console.error('[api/user] subscription lookup failed:', subResult.error);
    if (paymentResult.error) console.error('[api/user] payment lookup failed:', paymentResult.error);
    if (failedPaymentResult.error) console.error('[api/user] failed payment lookup failed:', failedPaymentResult.error);

    const sub = subResult.data;
    const payment = paymentResult.data;
    const failedPayment = failedPaymentResult.data;
    const hasLifetimeAccess = Boolean(
      payment?.product_id && lifetimeProductIds.includes(payment.product_id)
    );

    const isRecentFailure = (createdAt: string) => {
      const ts = new Date(createdAt).getTime();
      if (Number.isNaN(ts)) return false;
      return Date.now() - ts < 1000 * 60 * 30; // within last 30 minutes
    };

    const paymentFailed = failedPayment ? isRecentFailure(failedPayment.created_at) : false;
    const hasSubscriptionAccess = sub
      ? subscriptionGrantsAccess(sub.status, sub.current_period_end)
      : false;

    if (hasSubscriptionAccess) {
      return NextResponse.json({
        user: userInfo,
        isPro: true,
        subscriptionStatus: sub!.status,
        expiresAt: sub!.current_period_end,
        paymentFailed: false,
        endedPro: null,
      });
    }

    const endedAtMs = sub?.current_period_end ? new Date(sub.current_period_end).getTime() : null;
    const hasEnded = endedAtMs !== null && !Number.isNaN(endedAtMs) && endedAtMs <= Date.now();
    const endedPro = sub && hasEnded
      ? {
          status: sub.status,
          endedAt: sub.current_period_end,
        }
      : null;

    return NextResponse.json({
      user: userInfo,
      isPro: hasLifetimeAccess,
      subscriptionStatus: hasLifetimeAccess ? 'lifetime' : null,
      expiresAt: null,
      paymentFailed,
      endedPro,
    });
  } catch (error) {
    console.error('[api/user] unhandled error:', error);
    return NextResponse.json({ user: null, isPro: false, paymentFailed: false });
  }
}
