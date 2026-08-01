export const PAYMENT_DEBUG_STORAGE_KEY = 'exit_payment_debug';

export interface PaymentDebugRecord {
  requestId: string;
  productId: string;
  paymentType: string;
  startedAt: string;
}

export function savePaymentDebugRecord(record: PaymentDebugRecord) {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(PAYMENT_DEBUG_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage failures.
  }
}

export function readPaymentDebugRecord(): PaymentDebugRecord | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(PAYMENT_DEBUG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PaymentDebugRecord;
  } catch {
    return null;
  }
}

export function clearPaymentDebugRecord() {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(PAYMENT_DEBUG_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
