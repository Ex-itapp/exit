import { useState, useEffect } from 'react';

export interface Goal {
  id: string;
  category: 'physical' | 'mental';
  content: string;
  completedDates: string[];
  createdAt: string;
}

export function useGlowUp() {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('unsent_glowup_goals');
    if (saved) {
      // Migrate old data if necessary
      const parsed = JSON.parse(saved);
      const migrated = parsed.map((g: any) => ({
        ...g,
        completedDates: g.completedDates || (g.isCompleted ? [new Date().toISOString().split('T')[0]] : [])
      }));
      setGoals(migrated);
    }
  }, []);

  const addGoal = (content: string, category: 'physical' | 'mental') => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      category,
      content,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    
    const updated = [...goals, newGoal];
    setGoals(updated);
    localStorage.setItem('unsent_glowup_goals', JSON.stringify(updated));
  };

  const toggleGoal = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = goals.map(goal => {
      if (goal.id === id) {
        const hasCompletedToday = goal.completedDates.includes(todayStr);
        return {
          ...goal,
          completedDates: hasCompletedToday 
            ? goal.completedDates.filter(d => d !== todayStr) 
            : [...goal.completedDates, todayStr]
        };
      }
      return goal;
    });
    setGoals(updated);
    localStorage.setItem('unsent_glowup_goals', JSON.stringify(updated));
  };

  return { goals, addGoal, toggleGoal };
}
