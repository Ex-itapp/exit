'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './supabase';

const PRO_CACHE_KEY = 'exit_cached_pro_status';
const LAST_USER_ID_CACHE_KEY = 'exit_last_user_id';

interface EndedProInfo {
  status: string;
  endedAt: string | null;
}

interface SubscriptionCheckResult {
  isPro: boolean;
  subscriptionStatus: string | null;
  expiresAt: string | null;
  paymentFailed: boolean;
  endedPro: EndedProInfo | null;
}

interface CachedProStatus {
  userId: string;
  isPro: boolean;
  subscriptionStatus: string | null;
  expiresAt: string | null;
  endedPro: EndedProInfo | null;
  cachedAt: string;
}

function readBootCachedStatus(): CachedProStatus | null {
  if (typeof window === 'undefined') return null;

  try {
    const userId = window.localStorage.getItem(LAST_USER_ID_CACHE_KEY);
    const raw = window.localStorage.getItem(PRO_CACHE_KEY);
    if (!userId || !raw) return null;

    const parsed = JSON.parse(raw) as CachedProStatus;
    if (parsed.userId !== userId) return null;

    const ageMs = Date.now() - new Date(parsed.cachedAt).getTime();
    if (Number.isNaN(ageMs) || ageMs > 1000 * 60 * 30) {
      window.localStorage.removeItem(PRO_CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * usePro — standalone hook for Dodo payment / subscription status.
 * Separate from useUser so existing profile logic is untouched.
 */
export function usePro() {
  const bootCachedStatus = useMemo(() => readBootCachedStatus(), []);

  const [isPro, setIsPro] = useState(bootCachedStatus?.isPro ?? false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    bootCachedStatus?.subscriptionStatus ?? null
  );
  const [expiresAt, setExpiresAt] = useState<string | null>(
    bootCachedStatus?.expiresAt ?? null
  );
  const [endedPro, setEndedPro] = useState<EndedProInfo | null>(
    bootCachedStatus?.endedPro ?? null
  );
  const [loading, setLoading] = useState(!bootCachedStatus);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const readCachedStatus = useCallback((userId: string): CachedProStatus | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(PRO_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CachedProStatus;
      if (parsed.userId !== userId) return null;
      const ageMs = Date.now() - new Date(parsed.cachedAt).getTime();
      if (Number.isNaN(ageMs) || ageMs > 1000 * 60 * 30) {
        window.localStorage.removeItem(PRO_CACHE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const writeCachedStatus = useCallback((userId: string, result: SubscriptionCheckResult) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(LAST_USER_ID_CACHE_KEY, userId);
      const payload: CachedProStatus = {
        userId,
        isPro: result.isPro,
        subscriptionStatus: result.subscriptionStatus,
        expiresAt: result.expiresAt,
        endedPro: result.endedPro,
        cachedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(PRO_CACHE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore localStorage failures.
    }
  }, []);

  const clearCachedStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(PRO_CACHE_KEY);
      window.localStorage.removeItem(LAST_USER_ID_CACHE_KEY);
    } catch {
      // Ignore localStorage failures.
    }
  }, []);

  const checkSubscription = useCallback(
    async (userId: string): Promise<SubscriptionCheckResult | null> => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        const apiRes = await fetch(`/api/user?userId=${userId}&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          const result: SubscriptionCheckResult = {
            isPro: Boolean(apiData.isPro),
            subscriptionStatus: apiData.subscriptionStatus || null,
            expiresAt: apiData.expiresAt || null,
            paymentFailed: Boolean(apiData.paymentFailed),
            endedPro: apiData.endedPro || null,
          };

          setIsPro(result.isPro);
          setSubscriptionStatus(result.subscriptionStatus);
          setExpiresAt(result.expiresAt);
          setPaymentFailed(result.paymentFailed);
          setEndedPro(result.endedPro);

          if (result.isPro) {
            writeCachedStatus(userId, result);
          } else {
            clearCachedStatus();
          }
          return result;
        }
        throw new Error(`API returned status ${apiRes.status}`);
      } catch (err) {
        console.error('[usePro] check error:', err);
        setIsPro(false);
        setSubscriptionStatus(null);
        setExpiresAt(null);
        setEndedPro(null);
        setPaymentFailed(false);
        clearCachedStatus();
        return null;
      }
    },
    [clearCachedStatus, writeCachedStatus]
  );

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        window.localStorage.setItem(LAST_USER_ID_CACHE_KEY, userId);
      } catch { /* ignore */ }

      const cached = readCachedStatus(userId);
      if (cached?.isPro) {
        setIsPro(true);
        setSubscriptionStatus(cached.subscriptionStatus);
        setExpiresAt(cached.expiresAt);
        setEndedPro(cached.endedPro);
      } else if (cached?.endedPro) {
        setEndedPro(cached.endedPro);
      }

      await checkSubscription(userId);
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const userId = session?.user?.id;
      if (userId) {
        await checkSubscription(userId);
      } else {
        setIsPro(false);
        setSubscriptionStatus(null);
        setExpiresAt(null);
        setEndedPro(null);
        setPaymentFailed(false);
        clearCachedStatus();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkSubscription, clearCachedStatus, readCachedStatus]);

  const refreshSubscription = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      return checkSubscription(session.user.id);
    }
    return null;
  }, [checkSubscription]);

  return {
    isPro: true, // TEST MODE UNLOCKED
    subscriptionStatus: 'active',
    expiresAt,
    endedPro,
    loading: false,
    paymentFailed,
    refreshSubscription,
  };
}
