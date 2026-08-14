"use client";

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface Flag {
  id: string;
  category: string;
  content: string;
  createdAt: string;
}

const STORAGE_KEY = 'unsent_flags_clean';
const ARCHIVE_KEY = 'unsent_flags_archived_ids';

export function useFlags() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) try { setFlags(JSON.parse(saved)); } catch (e) {}

    const savedArchives = localStorage.getItem(ARCHIVE_KEY);
    if (savedArchives) try { setArchivedIds(JSON.parse(savedArchives)); } catch (e) {}

    async function syncDB() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase.from('red_flags').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (data) {
        const mapped: Flag[] = data.map(f => ({
          id: f.id,
          category: f.category || 'general',
          content: f.description || f.title || '',
          createdAt: f.created_at
        }));
        setFlags(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }
    }
    syncDB();
  }, []);

  const addFlag = async (content: string, category: string) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newFlag: Flag = { id, category, content, createdAt };
    
    const updated = [newFlag, ...flags];
    setFlags(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('red_flags').insert({
        id,
        user_id: session.user.id,
        title: content.substring(0, 50),
        description: content,
        category,
        created_at: createdAt
      });
    }
  };

  const deleteFlag = async (id: string) => {
    const updated = flags.filter(f => f.id !== id);
    setFlags(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('red_flags').delete().eq('id', id).eq('user_id', session.user.id);
    }
  };

  const archiveFlag = (id: string) => {
    const newArchives = [...new Set([...archivedIds, id])];
    setArchivedIds(newArchives);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(newArchives));
  };

  const unarchiveFlag = (id: string) => {
    const newArchives = archivedIds.filter(aId => aId !== id);
    setArchivedIds(newArchives);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(newArchives));
  };

  const activeFlags = flags.filter(f => !archivedIds.includes(f.id));
  const archivedFlags = flags.filter(f => archivedIds.includes(f.id));

  return { 
    flags: activeFlags, 
    allFlags: flags,
    archivedFlags, 
    addFlag, 
    deleteFlag,
    archiveFlag,
    unarchiveFlag
  };
}
