import { useState, useEffect } from 'react';

export interface Checkin {
  id: string;
  content: string;
  createdAt: string;
}

export function useCheckins() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('unsent_checkins');
    if (saved) {
      setCheckins(JSON.parse(saved));
    }
  }, []);

  const addCheckin = (content: string) => {
    const newCheckin: Checkin = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString(),
    };
    
    const updated = [newCheckin, ...checkins];
    setCheckins(updated);
    localStorage.setItem('unsent_checkins', JSON.stringify(updated));
  };

  return { checkins, addCheckin };
}
