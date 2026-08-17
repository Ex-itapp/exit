import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '../../../../lib/supabase-server';
import { getDodoClient } from '../../../../lib/dodo';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();

    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    const { data: { user }, error: authError } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch the user's latest active subscription to get their Dodo customer ID
    const adminSupabase = createAdminSupabase();
    const { data: subscription, error: subError } = await adminSupabase
      .from('subscriptions')
      .select('dodo_customer_id')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError || !subscription || !subscription.dodo_customer_id) {
      console.error('[billing/portal] No active subscription or customer ID found', { userId: user.id });
      return NextResponse.json({ error: 'No active subscription found to manage.' }, { status: 404 });
    }

    if (!process.env.DODO_PAYMENTS_API_KEY) {
      return NextResponse.json({ error: 'Payment provider is not configured.' }, { status: 500 });
    }

    // 3. Create the Customer Portal session via Dodo Payments SDK
    const dodo = getDodoClient();
    const portalSession = await dodo.customers.customerPortal.create(subscription.dodo_customer_id);

    if (!portalSession || !portalSession.link) {
      console.error('[billing/portal] Failed to generate portal link', { customerId: subscription.dodo_customer_id });
      return NextResponse.json({ error: 'Failed to generate billing portal link.' }, { status: 502 });
    }

    // 4. Return the link to the client
    return NextResponse.json({ url: portalSession.link });
  } catch (error: unknown) {
    console.error('[billing/portal] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
