import { useState, useEffect } from 'react';

export interface Flag {
  id: string;
  category: string;
  content: string;
  createdAt: string;
}

export function useFlags() {
  const [flags, setFlags] = useState<Flag[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('unsent_flags');
    if (saved) {
      setFlags(JSON.parse(saved));
    }
  }, []);

  const addFlag = (content: string, category: string) => {
    const newFlag: Flag = {
      id: crypto.randomUUID(),
      category,
      content,
      createdAt: new Date().toISOString(),
    };
    
    const updated = [newFlag, ...flags];
    setFlags(updated);
    localStorage.setItem('unsent_flags', JSON.stringify(updated));
  };

  const deleteFlag = (id: string) => {
    const updated = flags.filter(f => f.id !== id);
    setFlags(updated);
    localStorage.setItem('unsent_flags', JSON.stringify(updated));
  };

  return { flags, addFlag, deleteFlag };
}
