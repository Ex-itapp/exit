export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'paused'
  | 'cancelled'
  | 'expired';

/**
 * Product IDs that represent a lifetime (one-time) purchase. Only payments for
 * one of these products may grant permanent Pro access. Without an explicit
 * allowlist, successful subscription charges must never be treated as lifetime
 * purchases.
 */
export function getLifetimeProductIds(): string[] {
  return [
    process.env.DODO_PRODUCT_LIFETIME,
    process.env.NEXT_PUBLIC_DODO_PRODUCT_LIFETIME,
  ].filter(Boolean) as string[];
}

/**
 * Decide whether a subscription currently grants Pro access.
 *
 * Cancelled subscriptions keep access until the end of the paid period, which
 * matches the cancellation message shown in account settings. A missing
 * period end is treated as "no expiry" for active/trialing rows.
 */
export function subscriptionGrantsAccess(
  status: string | null | undefined,
  currentPeriodEnd: string | null | undefined,
  now = Date.now()
): boolean {
  if (!status) return false;

  const endMs = currentPeriodEnd ? new Date(currentPeriodEnd).getTime() : null;
  const hasFutureEnd = endMs !== null && !Number.isNaN(endMs) && endMs > now;

  if (status === 'active' || status === 'trialing') {
    return endMs === null || Number.isNaN(endMs) || hasFutureEnd;
  }

  if (status === 'cancelled') {
    return hasFutureEnd;
  }

  return false;
}
