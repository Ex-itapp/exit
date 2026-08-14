"use client";

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface DiaryEntry {
  id: string;
  content: string;
  moods: string[];
  isUnsent: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'unsent_diary_clean';
const ARCHIVE_KEY = 'unsent_diary_archived_ids';

export function useDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) try { setEntries(JSON.parse(saved)); } catch (e) {}

    const savedArchives = localStorage.getItem(ARCHIVE_KEY);
    if (savedArchives) try { setArchivedIds(JSON.parse(savedArchives)); } catch (e) {}

    async function syncDB() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase.from('diary_entries').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (data) {
        const mapped: DiaryEntry[] = data.map(d => ({
          id: d.id,
          content: d.content,
          moods: d.moods || [],
          isUnsent: d.is_unsent,
          createdAt: d.created_at
        }));
        setEntries(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }
    }
    syncDB();
  }, []);

  const addEntry = async (content: string, moods: string[], isUnsent: boolean) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newEntry: DiaryEntry = { id, content, moods, isUnsent, createdAt };
    
    const newEntries = [newEntry, ...entries];
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('diary_entries').insert({
        id,
        user_id: session.user.id,
        content,
        moods,
        is_unsent: isUnsent,
        created_at: createdAt
      });
    }
  };

  const deleteEntry = async (id: string) => {
    const newEntries = entries.filter(e => e.id !== id);
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('diary_entries').delete().eq('id', id).eq('user_id', session.user.id);
    }
  };

  const archiveEntry = (id: string) => {
    const newArchives = [...new Set([...archivedIds, id])];
    setArchivedIds(newArchives);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(newArchives));
  };

  const unarchiveEntry = (id: string) => {
    const newArchives = archivedIds.filter(aId => aId !== id);
    setArchivedIds(newArchives);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(newArchives));
  };

  const activeEntries = entries.filter(e => !archivedIds.includes(e.id));
  const archivedEntries = entries.filter(e => archivedIds.includes(e.id));

  // We still export `entries` as `activeEntries` by default to not break existing reports
  return { 
    entries: activeEntries, 
    allEntries: entries,
    archivedEntries, 
    addEntry, 
    deleteEntry,
    archiveEntry,
    unarchiveEntry
  };
}
