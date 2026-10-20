import { NextResponse } from 'next/server';
import { createServerSupabase, createSupabaseWithToken } from '../../../lib/supabase-server';
import { getDodoClient } from '../../../lib/dodo';
import { getLifetimeProductIds, subscriptionGrantsAccess } from '../../../lib/subscription';
import type { SupabaseClient } from '@supabase/supabase-js';

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
  return getLifetimeProductIds();
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

async function getExistingProAccess(db: SupabaseClient, userId: string) {
  const { data: subscription, error: subscriptionError } = await db
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscriptionError) {
    throw new Error(`Subscription lookup failed: ${subscriptionError.message}`);
  }

  if (subscription && subscriptionGrantsAccess(subscription.status, subscription.current_period_end)) {
    return {
      isPro: true,
      source: 'subscription' as const,
      subscriptionStatus: subscription.status,
      expiresAt: subscription.current_period_end,
    };
  }

  const lifetimeProductIds = getLifetimeProductIds();
  const lifetimeProductFilter = lifetimeProductIds.length > 0 ? lifetimeProductIds : ['__none__'];

  const { data: payment, error: paymentError } = await db
    .from('payments')
    .select('status, product_id, created_at')
    .eq('user_id', userId)
    .eq('status', 'succeeded')
    .in('product_id', lifetimeProductFilter)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError) {
    throw new Error(`Payment lookup failed: ${paymentError.message}`);
  }

  if (payment?.product_id && lifetimeProductIds.includes(payment.product_id)) {
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
    const token = authHeader?.replace(/^Bearer\s+/i, '') || '';
    const { data: { user }, error: authError } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[checkout] unauthorized', { requestId, authError: authError?.message });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = token ? createSupabaseWithToken(token) : supabase;

    const body = await request.json();
    const { product_id, payment_type, discount_code } = body;
    const cleanDiscountCode = typeof discount_code === 'string' && discount_code.trim().length > 0
      ? discount_code.trim().toUpperCase()
      : undefined;
    const paymentType = payment_type === 'subscription' ? 'subscription' : 'one_time';
    const logContext = buildLogContext(requestId, user.id, product_id, paymentType);

    if (!product_id) {
      console.error('[checkout] missing product_id', logContext);
      return NextResponse.json({ error: 'Missing product_id' }, { status: 400 });
    }

    const allowedProductIds = getAllowedProductIds(paymentType);
    if (!allowedProductIds.includes(product_id)) {
      console.error('[checkout] invalid product_id', { ...logContext, allowedProductIds });
      return NextResponse.json({ error: 'Invalid product selected' }, { status: 400 });
    }

    // Block if user already has pro access
    const existingAccess = await getExistingProAccess(db, user.id);
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

    console.log('[checkout] creating checkout', { ...logContext, email: user.email, returnUrl, discountCode: cleanDiscountCode });

    let paymentLink: string | null = null;
    let checkoutId: string | null = null;

    // 1. Try modern Checkout Session with explicit discount code support enabled
    try {
      const session = await dodo.checkoutSessions.create({
        product_cart: [{ product_id, quantity: 1 }],
        customer: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
        },
        return_url: returnUrl,
        discount_code: cleanDiscountCode,
        feature_flags: {
          allow_discount_code: true,
        },
        metadata: {
          supabase_user_id: user.id,
          checkout_request_id: requestId,
        },
      });

      if (session?.checkout_url) {
        paymentLink = session.checkout_url;
        checkoutId = session.session_id || null;
      }
    } catch (sessionError) {
      console.warn('[checkout] checkoutSessions.create failed, falling back to legacy create:', sessionError);
    }

    // 2. Fallback to direct subscription/payment create if checkoutSessions did not return link
    if (!paymentLink) {
      if (paymentType === 'subscription') {
        const subscription = await dodo.subscriptions.create({
          billing: { city: '', country: 'US', state: '', street: '', zipcode: '' },
          customer: {
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
          },
          product_id,
          quantity: 1,
          discount_code: cleanDiscountCode,
          trial_period_days: product_id === process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY ? 3 : 0,
          payment_link: true,
          redirect_immediately: true,
          return_url: returnUrl,
          metadata: {
            supabase_user_id: user.id,
            checkout_request_id: requestId,
          },
        });

        paymentLink = subscription.payment_link || null;
        checkoutId = subscription.subscription_id || null;
      } else {
        const payment = await dodo.payments.create({
          billing: { city: '', country: 'US', state: '', street: '', zipcode: '' },
          customer: {
            email: user.email!,
            name: user.user_metadata?.full_name || user.email!,
          },
          product_cart: [{ product_id, quantity: 1 }],
          discount_code: cleanDiscountCode,
          payment_link: true,
          redirect_immediately: true,
          return_url: returnUrl,
          metadata: {
            supabase_user_id: user.id,
            checkout_request_id: requestId,
          },
        });

        paymentLink = payment.payment_link || null;
        checkoutId = payment.payment_id || null;
      }
    }

    if (!paymentLink) {
      return NextResponse.json(
        { error: 'Dodo did not return a valid checkout link.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      request_id: requestId,
      payment_link: paymentLink,
      subscription_id: checkoutId,
    });
  } catch (error: unknown) {
    console.error('[checkout] creation failed', { requestId, error: getErrorDetails(error) });
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
