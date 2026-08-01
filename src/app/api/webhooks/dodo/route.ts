import { NextResponse } from 'next/server';
import { createAdminSupabase } from '../../../../lib/supabase-server';
import { Webhook } from 'standardwebhooks';

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const body = await request.text();

    // Verify webhook signature
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[dodo webhook] missing webhook secret', { requestId });
      return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
    }

    const wh = new Webhook(webhookSecret);

    const webhookId = request.headers.get('webhook-id') || '';
    const webhookSignature = request.headers.get('webhook-signature') || '';
    const webhookTimestamp = request.headers.get('webhook-timestamp') || '';

    let payload: Record<string, unknown>;
    try {
      payload = wh.verify(body, {
        'webhook-id': webhookId,
        'webhook-signature': webhookSignature,
        'webhook-timestamp': webhookTimestamp,
      }) as Record<string, unknown>;
    } catch (verifyError) {
      console.error('[dodo webhook] signature verification failed', {
        requestId,
        webhookId,
        webhookTimestamp,
        error: verifyError,
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const eventType =
      (payload as { type?: string }).type ||
      (payload as { event_type?: string }).event_type;
    const data = (payload as { data?: Record<string, unknown> }).data || payload;

    const supabase = createAdminSupabase();

    console.log('[dodo webhook] received', {
      requestId,
      eventType,
      webhookId,
    });

    switch (eventType) {
      // ─── ONE-TIME PAYMENT EVENTS ───
      case 'payment.succeeded':
      case 'payment_succeeded': {
        const paymentData = data as Record<string, unknown>;
        const userId = ((paymentData.metadata as Record<string, string>)?.supabase_user_id) || null;
        const checkoutRequestId = ((paymentData.metadata as Record<string, string>)?.checkout_request_id) || null;
        const customerEmail = (paymentData.customer as Record<string, string>)?.email;

        let resolvedUserId = userId;
        if (!resolvedUserId && customerEmail) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', customerEmail)
            .single();
          resolvedUserId = profile?.id || null;
        }

        if (resolvedUserId) {
          const { error: upsertError } = await supabase.from('payments').upsert(
            {
              dodo_payment_id: paymentData.payment_id as string,
              user_id: resolvedUserId,
              status: 'succeeded',
              amount: paymentData.total_amount as number,
              currency: (paymentData.currency as string) || 'USD',
              product_id:
                ((paymentData.product_cart as Array<{ product_id: string }>)?.[0]?.product_id) ||
                null,
              created_at: (paymentData.created_at as string) || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'dodo_payment_id' }
          );

          if (upsertError) {
            console.error('[dodo webhook] payments upsert failed', {
              requestId,
              eventType,
              checkoutRequestId,
              paymentId: paymentData.payment_id,
              userId: resolvedUserId,
              error: upsertError,
            });
          }
        } else {
          console.error('[dodo webhook] unable to resolve user for payment.succeeded', {
            requestId,
            eventType,
            checkoutRequestId,
            paymentId: paymentData.payment_id,
            customerEmail,
          });
        }
        break;
      }

      // ─── SUBSCRIPTION EVENTS ───
      case 'subscription.active':
      case 'subscription_active': {
        const subData = data as Record<string, unknown>;
        const userId = ((subData.metadata as Record<string, string>)?.supabase_user_id) || null;
        const checkoutRequestId = ((subData.metadata as Record<string, string>)?.checkout_request_id) || null;
        const customerEmail = (subData.customer as Record<string, string>)?.email;

        const currentPeriodStart =
          (subData.current_period_start as string) ||
          (subData.previous_billing_date as string) ||
          (subData.created_at as string) ||
          new Date().toISOString();

        const currentPeriodEnd =
          (subData.current_period_end as string) ||
          (subData.next_billing_date as string) ||
          (subData.expires_at as string) ||
          null;

        let resolvedUserId = userId;
        if (!resolvedUserId && customerEmail) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', customerEmail)
            .single();
          resolvedUserId = profile?.id || null;
        }

        if (resolvedUserId) {
          const { error: upsertError } = await supabase.from('subscriptions').upsert(
            {
              dodo_subscription_id: subData.subscription_id as string,
              dodo_customer_id: (subData.customer as Record<string, string>)?.customer_id || null,
              user_id: resolvedUserId,
              status: 'active',
              product_id: subData.product_id as string,
              current_period_start: currentPeriodStart,
              current_period_end: currentPeriodEnd,
              created_at: (subData.created_at as string) || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'dodo_subscription_id' }
          );

          if (upsertError) {
            console.error('[dodo webhook] subscriptions upsert failed', {
              requestId,
              eventType,
              checkoutRequestId,
              subscriptionId: subData.subscription_id,
              userId: resolvedUserId,
              error: upsertError,
            });
          }
        } else {
          console.error('[dodo webhook] unable to resolve user for subscription.active', {
            requestId,
            eventType,
            checkoutRequestId,
            subscriptionId: subData.subscription_id,
            customerEmail,
          });
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired':
      case 'subscription_cancelled':
      case 'subscription_expired': {
        const subData = data as Record<string, unknown>;
        const subscriptionId = subData.subscription_id as string;

        if (subscriptionId) {
          const status = eventType.includes('cancelled') ? 'cancelled' : 'expired';
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('dodo_subscription_id', subscriptionId);

          if (updateError) {
            console.error('[dodo webhook] subscription status update failed', {
              requestId,
              eventType,
              subscriptionId,
              error: updateError,
            });
          }
        }
        break;
      }

      case 'subscription.paused':
      case 'subscription_paused': {
        const subData = data as Record<string, unknown>;
        const subscriptionId = subData.subscription_id as string;

        if (subscriptionId) {
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ status: 'paused', updated_at: new Date().toISOString() })
            .eq('dodo_subscription_id', subscriptionId);

          if (updateError) {
            console.error('[dodo webhook] subscription pause update failed', {
              requestId,
              eventType,
              subscriptionId,
              error: updateError,
            });
          }
        }
        break;
      }

      case 'payment.failed':
      case 'payment_failed': {
        const paymentData = data as Record<string, unknown>;
        const userId = ((paymentData.metadata as Record<string, string>)?.supabase_user_id) || null;
        const checkoutRequestId = ((paymentData.metadata as Record<string, string>)?.checkout_request_id) || null;
        const customerEmail = (paymentData.customer as Record<string, string>)?.email;

        let resolvedUserId = userId;
        if (!resolvedUserId && customerEmail) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', customerEmail)
            .single();
          resolvedUserId = profile?.id || null;
        }

        if (resolvedUserId) {
          const { error: upsertError } = await supabase.from('payments').upsert(
            {
              dodo_payment_id: paymentData.payment_id as string,
              user_id: resolvedUserId,
              status: 'failed',
              amount: paymentData.total_amount as number,
              currency: (paymentData.currency as string) || 'USD',
              product_id:
                ((paymentData.product_cart as Array<{ product_id: string }>)?.[0]?.product_id) ||
                null,
              created_at: (paymentData.created_at as string) || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'dodo_payment_id' }
          );

          if (upsertError) {
            console.error('[dodo webhook] failed payment upsert failed', {
              requestId,
              eventType,
              checkoutRequestId,
              paymentId: paymentData.payment_id,
              userId: resolvedUserId,
              error: upsertError,
            });
          }

          // Pause active subscription on payment failure
          const { error: pauseError } = await supabase
            .from('subscriptions')
            .update({ status: 'paused', updated_at: new Date().toISOString() })
            .eq('user_id', resolvedUserId)
            .in('status', ['active', 'trialing']);

          if (pauseError) {
            console.error('[dodo webhook] failed to pause subscription after payment failure', {
              requestId,
              userId: resolvedUserId,
              error: pauseError,
            });
          }
        } else {
          console.error('[dodo webhook] unable to resolve user for payment.failed', {
            requestId,
            eventType,
            checkoutRequestId,
            paymentId: paymentData.payment_id,
            customerEmail,
          });
        }
        break;
      }

      default:
        console.log('[dodo webhook] unhandled event type', { requestId, eventType });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[dodo webhook] processing error', { requestId, error });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
