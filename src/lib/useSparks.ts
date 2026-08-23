import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './useAuth';

export type SparkTransactionSource = 
  | 'then_vs_now'
  | 'word_cloud'
  | 'pattern_detective'
  | 'the_vault'
  | 'urge_interceptor'
  | 'red_flag_reflex'
  | 'glow_up_runner'
  | 'spend_streak_freeze'
  | 'spend_cosmetic_cert'
  | 'spend_cosmetic_bubble'
  | 'spend_cosmetic_icon'
  | 'spend_bonus_pack';

export function useSparks() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from('user_sparks')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (err && err.code !== 'PGRST116') { // PGRST116 is "No rows found"
        throw err;
      }

      setBalance(data?.balance || 0);
    } catch (err: any) {
      console.error('Failed to fetch sparks balance:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  /**
   * Process a transaction (earn or spend)
   * Positive amount = earn, Negative amount = spend
   */
  const processTransaction = async (amount: number, source: SparkTransactionSource): Promise<boolean> => {
    if (!user) return false;

    // Hard rule: We never bypass Ex Simulator caps
    if (source.startsWith('spend_') && source.includes('simulator')) {
      console.error("CRITICAL: Sparks cannot be used to bypass Simulator harm-reduction caps.");
      return false;
    }

    // Client-side optimistic check
    if (amount < 0 && balance + amount < 0) {
      setError("Insufficient sparks");
      return false;
    }

    try {
      const { data: newBalance, error: rpcError } = await supabase.rpc('process_spark_transaction', {
        p_amount: amount,
        p_source: source
      });

      if (rpcError) throw rpcError;

      setBalance(newBalance);
      return true;
    } catch (err: any) {
      console.error('Failed to process transaction:', err);
      setError(err.message);
      return false;
    }
  };

  const earnSparks = (source: SparkTransactionSource, amount: number) => {
    if (amount <= 0) return Promise.resolve(false);
    return processTransaction(amount, source);
  };

  const spendSparks = (source: SparkTransactionSource, cost: number) => {
    if (cost <= 0) return Promise.resolve(false);
    return processTransaction(-cost, source);
  };

  return {
    balance,
    isLoading,
    error,
    earnSparks,
    spendSparks,
    refreshBalance: fetchBalance
  };
}
