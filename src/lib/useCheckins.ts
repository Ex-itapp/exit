import { useState, useEffect } from 'react';

export interface Checkin {
  id: string;
  content: string;
  createdAt: string;
  classifierResult?: 'SAFE' | 'RISK';
  aiReply?: string | null;
  crisisPathTriggered?: boolean;
}

export function useCheckins() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('unsent_checkins');
    if (saved) {
      setCheckins(JSON.parse(saved));
    }
  }, []);

  const addCheckin = (
    content: string, 
    classifierResult?: 'SAFE' | 'RISK', 
    aiReply?: string | null, 
    crisisPathTriggered?: boolean
  ) => {
    const newCheckin: Checkin = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString(),
      classifierResult,
      aiReply,
      crisisPathTriggered
    };
    
    const updated = [newCheckin, ...checkins];
    setCheckins(updated);
    localStorage.setItem('unsent_checkins', JSON.stringify(updated));
  };

  return { checkins, addCheckin };
}
