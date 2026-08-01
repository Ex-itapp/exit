import DodoPayments from 'dodopayments';

/**
 * Returns an initialized Dodo Payments client.
 * Uses the DODO_PAYMENTS_API_KEY environment variable.
 */
export function getDodoClient() {
  return new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  });
}
