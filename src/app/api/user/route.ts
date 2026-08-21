import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '../../../lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get('userId');

    // Always authenticate via cookie session first, or fallback to Authorization header
    const supabase = await createServerSupabase();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    const { data: { user }, error: authError } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ user: null, isPro: false, paymentFailed: false });
    }

    // Always use the authenticated user's ID — ignore any query param userId to prevent IDOR
    const userId = user.id;
    const adminSupabase = createAdminSupabase();

    const userInfo = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    };

    if (!userId) {
      return NextResponse.json({ user: null, isPro: false, paymentFailed: false });
    }

    // Run subscription & payment checks in parallel using admin client (bypasses RLS)
    const [subResult, expiredSubResult, paymentResult, failedPaymentResult] = await Promise.all([
      adminSupabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      adminSupabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', userId)
        .in('status', ['cancelled', 'expired'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      adminSupabase
        .from('payments')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      adminSupabase
        .from('payments')
        .select('status, created_at')
        .eq('user_id', userId)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (subResult.error) console.error('[api/user] subscription lookup failed:', subResult.error);
    if (expiredSubResult.error) console.error('[api/user] expired sub lookup failed:', expiredSubResult.error);
    if (paymentResult.error) console.error('[api/user] payment lookup failed:', paymentResult.error);
    if (failedPaymentResult.error) console.error('[api/user] failed payment lookup failed:', failedPaymentResult.error);

    const sub = subResult.data;
    const expiredSub = expiredSubResult.data;
    const payment = paymentResult.data;
    const failedPayment = failedPaymentResult.data;

    const isRecentFailure = (createdAt: string) => {
      const ts = new Date(createdAt).getTime();
      if (Number.isNaN(ts)) return false;
      return Date.now() - ts < 1000 * 60 * 30; // within last 30 minutes
    };

    const paymentFailed = failedPayment ? isRecentFailure(failedPayment.created_at) : false;

    if (sub) {
      return NextResponse.json({
        user: userInfo,
        isPro: true,
        subscriptionStatus: sub.status,
        expiresAt: sub.current_period_end,
        paymentFailed: false,
        endedPro: null,
      });
    }

    const endedPro = expiredSub
      ? {
          status: expiredSub.status,
          endedAt: expiredSub.current_period_end,
        }
      : null;

    return NextResponse.json({
      user: userInfo,
      isPro: !!payment,
      subscriptionStatus: payment ? 'lifetime' : null,
      expiresAt: null,
      paymentFailed,
      endedPro,
    });
  } catch (error) {
    console.error('[api/user] unhandled error:', error);
    return NextResponse.json({ user: null, isPro: false, paymentFailed: false });
  }
}
