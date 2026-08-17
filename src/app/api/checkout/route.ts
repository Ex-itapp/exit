import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '../../../lib/supabase-server';
import { getDodoClient } from '../../../lib/dodo';

function buildLogContext(requestId: string, userId: string, productId: string, paymentType: string) {
  return {
    requestId,
    userId,
    productId,
    paymentType,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    hasDodoApiKey: Boolean(process.env.DODO_PAYMENTS_API_KEY),
  };
}

function getAllowedProductIds(paymentType: string) {
  if (paymentType === 'subscription') {
    return [
      process.env.NEXT_PUBLIC_DODO_PRODUCT_MONTHLY,
      process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY,
    ].filter(Boolean) as string[];
  }
  return [];
}

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    const enriched = error as Error & {
      status?: number;
      code?: string;
      type?: string;
      cause?: unknown;
      errors?: unknown;
    };
    return {
      message: error.message,
      name: error.name,
      status: enriched.status,
      code: enriched.code,
      type: enriched.type,
      cause: enriched.cause,
      errors: enriched.errors,
    };
  }
  return { raw: error };
}

async function getExistingProAccess(userId: string) {
  const adminSupabase = createAdminSupabase();

  const { data: subscription, error: subscriptionError } = await adminSupabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscriptionError) {
    throw new Error(`Subscription lookup failed: ${subscriptionError.message}`);
  }

  if (subscription) {
    return {
      isPro: true,
      source: 'subscription' as const,
      subscriptionStatus: subscription.status,
      expiresAt: subscription.current_period_end,
    };
  }

  const { data: payment, error: paymentError } = await adminSupabase
    .from('payments')
    .select('status, created_at')
    .eq('user_id', userId)
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError) {
    throw new Error(`Payment lookup failed: ${paymentError.message}`);
  }

  if (payment) {
    return {
      isPro: true,
      source: 'payment' as const,
      subscriptionStatus: 'lifetime',
      expiresAt: null,
    };
  }

  return {
    isPro: false,
    source: null,
    subscriptionStatus: null,
    expiresAt: null,
  };
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createServerSupabase();

    // Authenticate user
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    const { data: { user }, error: authError } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[checkout] unauthorized', { requestId, authError: authError?.message });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, payment_type } = body;
    const paymentType = payment_type === 'subscription' ? 'subscription' : 'one_time';
    const logContext = buildLogContext(requestId, user.id, product_id, paymentType);

    if (!product_id) {
      console.error('[checkout] missing product_id', logContext);
      return NextResponse.json({ error: 'Missing product_id' }, { status: 400 });
    }

    const allowedProductIds = getAllowedProductIds(paymentType);
    if (allowedProductIds.length > 0 && !allowedProductIds.includes(product_id)) {
      console.error('[checkout] invalid product_id', { ...logContext, allowedProductIds });
      return NextResponse.json({ error: 'Invalid product selected' }, { status: 400 });
    }

    // Block if user already has pro access
    const existingAccess = await getExistingProAccess(user.id);
    if (existingAccess.isPro) {
      console.warn('[checkout] blocked duplicate checkout for pro user', {
        ...logContext,
        existingSource: existingAccess.source,
        subscriptionStatus: existingAccess.subscriptionStatus,
      });
      return NextResponse.json(
        {
          error: 'You already have Pro access.',
          code: 'ALREADY_PRO',
          subscriptionStatus: existingAccess.subscriptionStatus,
          expiresAt: existingAccess.expiresAt,
        },
        { status: 409 }
      );
    }

    if (!process.env.DODO_PAYMENTS_API_KEY) {
      console.error('[checkout] missing DODO_PAYMENTS_API_KEY', logContext);
      return NextResponse.json({ error: 'Payment provider is not configured' }, { status: 500 });
    }

    const dodo = getDodoClient();
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?checkout_request_id=${encodeURIComponent(requestId)}`;

    if (!user.email) {
      console.error('[checkout] user has no email', logContext);
      return NextResponse.json({ error: 'Your account must have an email to subscribe. Please sign in with a magic link first.' }, { status: 400 });
    }

    console.log('[checkout] creating checkout', { ...logContext, email: user.email, returnUrl });

    if (paymentType === 'subscription') {
      const subscription = await dodo.subscriptions.create({
        billing: { city: '', country: 'US', state: '', street: '', zipcode: '' },
        customer: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
        },
        product_id,
        quantity: 1,
        trial_period_days: product_id === process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY ? 3 : 0,
        payment_link: true,
        redirect_immediately: true,
        return_url: returnUrl,
        metadata: {
          supabase_user_id: user.id,
          checkout_request_id: requestId,
        },
      });

      if (!subscription.payment_link) {
        console.error('[checkout] subscription missing payment_link', {
          ...logContext,
          subscriptionId: subscription.subscription_id,
        });
        return NextResponse.json(
          { error: 'Dodo did not return a checkout link for this subscription.' },
          { status: 502 }
        );
      }

      return NextResponse.json({
        request_id: requestId,
        payment_link: subscription.payment_link,
        subscription_id: subscription.subscription_id,
      });
    } else {
      const payment = await dodo.payments.create({
        billing: { city: '', country: 'US', state: '', street: '', zipcode: '' },
        customer: {
          email: user.email!,
          name: user.user_metadata?.full_name || user.email!,
        },
        product_cart: [{ product_id, quantity: 1 }],
        payment_link: true,
        redirect_immediately: true,
        return_url: returnUrl,
        metadata: {
          supabase_user_id: user.id,
          checkout_request_id: requestId,
        },
      });

      if (!payment.payment_link) {
        console.error('[checkout] payment missing payment_link', {
          ...logContext,
          paymentId: payment.payment_id,
        });
        return NextResponse.json(
          { error: 'Dodo did not return a checkout link for this payment.' },
          { status: 502 }
        );
      }

      return NextResponse.json({
        request_id: requestId,
        payment_link: payment.payment_link,
        payment_id: payment.payment_id,
      });
    }
  } catch (error: unknown) {
    console.error('[checkout] creation failed', { requestId, error: getErrorDetails(error) });
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
