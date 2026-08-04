import { useMemo } from 'react';
import { useDiary } from './useDiary';
import { useCheckins } from './useCheckins';
import { useFlags } from './useFlags';
import { useMoods } from './useMoods';

export type TimelineEvent = {
  id: string;
  type: 'diary' | 'checkin' | 'flag' | 'mood';
  timestamp: Date;
  data: any;
};

export function useTimeline() {
  const { entries: diaryEntries } = useDiary();
  const { checkins } = useCheckins();
  const { flags } = useFlags();
  const { moodLogs } = useMoods();

  const events: TimelineEvent[] = useMemo(() => {
    const allEvents: TimelineEvent[] = [];

    diaryEntries.forEach(entry => {
      allEvents.push({
        id: `diary-${entry.id}`,
        type: 'diary',
        timestamp: new Date(entry.createdAt),
        data: entry
      });
    });

    checkins.forEach(checkin => {
      allEvents.push({
        id: `checkin-${checkin.id}`,
        type: 'checkin',
        timestamp: new Date(checkin.createdAt),
        data: checkin
      });
    });

    flags.forEach(flag => {
      allEvents.push({
        id: `flag-${flag.id}`,
        type: 'flag',
        timestamp: new Date(flag.createdAt),
        data: flag
      });
    });

    moodLogs.forEach(mood => {
      allEvents.push({
        id: `mood-${mood.id}`,
        type: 'mood',
        timestamp: new Date(mood.createdAt),
        data: mood
      });
    });

    return allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [diaryEntries, checkins, flags, moodLogs]);

  return { events };
}
