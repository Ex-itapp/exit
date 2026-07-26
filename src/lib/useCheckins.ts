"use client";

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface Checkin {
  id: string;
  content: string;
  createdAt: string;
  classifierResult?: 'SAFE' | 'RISK';
  aiReply?: string | null;
  crisisPathTriggered?: boolean;
  followUpAnswer?: string;
}

const STORAGE_KEY = 'unsent_checkins_clean';

export function useCheckins() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) try { setCheckins(JSON.parse(saved)); } catch (e) {}

    async function syncDB() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase.from('checkins').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (data) {
        const mapped: Checkin[] = data.map(c => ({
          id: c.id,
          content: c.content,
          createdAt: c.created_at,
          mood: c.mood
        }));
        setCheckins(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }
    }
    syncDB();
  }, []);

  const addCheckin = async (
    content: string, 
    classifierResult?: 'SAFE' | 'RISK', 
    aiReply?: string | null, 
    crisisPathTriggered?: boolean
  ) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newCheckin: Checkin = { id, content, createdAt, classifierResult, aiReply, crisisPathTriggered };
    
    const updated = [newCheckin, ...checkins];
    setCheckins(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('checkins').insert({
        id,
        user_id: session.user.id,
        content,
        mood: classifierResult || 'SAFE',
        created_at: createdAt
      });
    }
  };

  const addFollowUp = (id: string, answer: string) => {
    const updated = checkins.map(c => 
      c.id === id ? { ...c, followUpAnswer: answer } : c
    );
    setCheckins(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { checkins, addCheckin, addFollowUp };
}
