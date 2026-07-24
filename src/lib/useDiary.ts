import { useState, useEffect } from 'react';

export interface DiaryEntry {
  id: string;
  content: string;
  moods: string[];
  isUnsent: boolean;
  createdAt: string;
}

export function useDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('unsent_diary');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  const addEntry = (content: string, moods: string[], isUnsent: boolean) => {
    const newEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      content,
      moods,
      isUnsent,
      createdAt: new Date().toISOString(),
    };
    
    const newEntries = [newEntry, ...entries];
    setEntries(newEntries);
    localStorage.setItem('unsent_diary', JSON.stringify(newEntries));
  };

  const deleteEntry = (id: string) => {
    const newEntries = entries.filter(e => e.id !== id);
    setEntries(newEntries);
    localStorage.setItem('unsent_diary', JSON.stringify(newEntries));
  };

  return { entries, addEntry, deleteEntry };
}
