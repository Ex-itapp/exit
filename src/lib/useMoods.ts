"use client";

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface MoodLog {
  id: string;
  emoji: string;
  note: string;
  createdAt: string;
}

const STORAGE_KEY = 'unsent_mood_logs';

export function useMoods() {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load from localStorage first for instant UI
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMoodLogs(JSON.parse(saved));
      } catch (e) {}
    }

    // Sync with Supabase if logged in
    async function syncDB() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const mapped: MoodLog[] = data.map(d => ({
          id: d.id,
          emoji: d.emoji,
          note: d.note || '',
          createdAt: d.created_at
        }));
        setMoodLogs(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }
    }

    syncDB();
  }, []);

  const logMood = async (emoji: string, note: string) => {
    const id = crypto.randomUUID();
    const newLog: MoodLog = {
      id,
      emoji,
      note,
      createdAt: new Date().toISOString()
    };
    
    // Check if a mood was already logged today, if so, replace it
    const today = new Date().toDateString();
    let updatedLogs = [...moodLogs];
    const existingIndex = updatedLogs.findIndex(log => new Date(log.createdAt).toDateString() === today);
    
    if (existingIndex !== -1) {
      updatedLogs[existingIndex] = newLog;
    } else {
      updatedLogs = [newLog, ...updatedLogs];
    }
    
    setMoodLogs(updatedLogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));

    // Sync to Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // If replacing today's mood, delete the old one first
      if (existingIndex !== -1) {
        const oldId = moodLogs[existingIndex].id;
        await supabase.from('mood_logs').delete().eq('id', oldId).eq('user_id', session.user.id);
      }
      
      await supabase.from('mood_logs').insert({
        id,
        user_id: session.user.id,
        emoji,
        note,
        created_at: newLog.createdAt
      });
    }
  };

  const getMoodForDate = (date: Date) => {
    return moodLogs.find(log => new Date(log.createdAt).toDateString() === date.toDateString());
  };

  return { moodLogs, logMood, getMoodForDate };
}
