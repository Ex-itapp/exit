"use client";

import { useState, useEffect } from 'react';

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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMoodLogs(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const logMood = (emoji: string, note: string) => {
    const newLog: MoodLog = {
      id: crypto.randomUUID(),
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
  };

  const getMoodForDate = (date: Date) => {
    return moodLogs.find(log => new Date(log.createdAt).toDateString() === date.toDateString());
  };

  return { moodLogs, logMood, getMoodForDate };
}
