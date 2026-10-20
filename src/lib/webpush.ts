import webpush from 'web-push';

let configured = false;

/**
 * Lazily configure web-push so a missing VAPID key produces a clear runtime
 * error instead of crashing at module import time (which would take down the
 * whole route during build).
 */
export function getWebPush() {
  if (!configured) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      throw new Error(
        'Web push is not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.'
      );
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:hello@ex-it.app',
      publicKey,
      privateKey
    );
    configured = true;
  }

  return webpush;
}
