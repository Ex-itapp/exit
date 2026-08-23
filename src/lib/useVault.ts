import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './useAuth';

export interface VaultEntry {
  id: string;
  content: string;
  createdAt: string;
  unlocksAt: string;
}

export function useVault() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vault_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setEntries(
          data.map((d: any) => ({
            id: d.id,
            content: d.content,
            createdAt: d.created_at,
            unlocksAt: d.unlocks_at,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch vault entries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const lockMessage = async (content: string, days: number): Promise<boolean> => {
    if (!user) return false;

    const unlocksAt = new Date();
    unlocksAt.setDate(unlocksAt.getDate() + days);

    try {
      const { data, error } = await supabase
        .from('vault_entries')
        .insert({
          user_id: user.id,
          content,
          unlocks_at: unlocksAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEntries([
          {
            id: data.id,
            content: data.content,
            createdAt: data.created_at,
            unlocksAt: data.unlocks_at,
          },
          ...entries,
        ]);
      }
      return true;
    } catch (err) {
      console.error('Failed to lock message:', err);
      return false;
    }
  };

  return {
    entries,
    isLoading,
    lockMessage,
    refreshEntries: fetchEntries,
  };
}
