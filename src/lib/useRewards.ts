import { useUser } from './useUser';
import { useDiary } from './useDiary';
import { useFlags } from './useFlags';
import { useCheckins } from './useCheckins';

export interface RewardBadge {
  id: string;
  title: string;
  category: 'Milestones' | 'Diary' | 'Streaks' | 'Insights';
  description: string;
  iconName: string; // Used for lucide icon selection
  isUnlocked: boolean;
  progressText: string;
  unlockedAt?: string;
}

export function useRewards() {
  const { hasCompletedOnboarding, streakDays } = useUser();
  const { entries } = useDiary();
  const { flags } = useFlags();
  const { checkins } = useCheckins();

  const badges: RewardBadge[] = [
    {
      id: 'onboarding',
      title: 'A New Beginning',
      category: 'Milestones',
      description: 'You took the courageous first step and set up your healing sanctuary.',
      iconName: 'Sparkles',
      isUnlocked: hasCompletedOnboarding || entries.length > 0 || checkins.length > 0,
      progressText: hasCompletedOnboarding ? 'Unlocked on Day 1' : 'Complete Setup'
    },
    {
      id: 'first_diary',
      title: 'First Expression',
      category: 'Diary',
      description: 'You put your unfiltered feelings into words instead of keeping them bottled up.',
      iconName: 'BookOpen',
      isUnlocked: entries.length >= 1,
      progressText: `${Math.min(entries.length, 1)} / 1 Entry`
    },
    {
      id: 'seven_days',
      title: 'Spine of Steel',
      category: 'Streaks',
      description: 'One full week of protecting your peace. The withdrawal is real, but so is your resilience.',
      iconName: 'ShieldCheck',
      isUnlocked: streakDays >= 7,
      progressText: `${Math.min(streakDays, 7)} / 7 Days`
    },
    {
      id: 'five_flags',
      title: 'Pattern Recognition',
      category: 'Insights',
      description: 'You logged 5 Red Flags. You are seeing reality clearly instead of looking through rose-tinted glasses.',
      iconName: 'Flag',
      isUnlocked: flags.length >= 5,
      progressText: `${Math.min(flags.length, 5)} / 5 Flags`
    },
    {
      id: 'three_checkins',
      title: 'Daily Discipline',
      category: 'Milestones',
      description: 'You checked in with your daily mission 3 times. Consistency is the foundation of healing.',
      iconName: 'CheckCircle',
      isUnlocked: checkins.length >= 3,
      progressText: `${Math.min(checkins.length, 3)} / 3 Check-ins`
    },
    {
      id: 'thirty_days',
      title: '30 Days of Peace',
      category: 'Streaks',
      description: 'A full month without looking back. You have built a fortress around your peace of mind.',
      iconName: 'Zap',
      isUnlocked: streakDays >= 30,
      progressText: `${Math.min(streakDays, 30)} / 30 Days`
    },
    {
      id: 'ten_diary',
      title: 'Chronicler',
      category: 'Diary',
      description: 'You wrote 10 diary entries. You are actively releasing the past and rewriting your story.',
      iconName: 'PenLine',
      isUnlocked: entries.length >= 10,
      progressText: `${Math.min(entries.length, 10)} / 10 Entries`
    },
    {
      id: 'self_mastery',
      title: 'Self-Mastery',
      category: 'Insights',
      description: 'Logged 5 diary entries and 5 red flags. You have mastered the art of self-awareness.',
      iconName: 'Award',
      isUnlocked: entries.length >= 5 && flags.length >= 5,
      progressText: `${Math.min(entries.length, 5)}/5 Entries, ${Math.min(flags.length, 5)}/5 Flags`
    }
  ];

  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const totalCount = badges.length;

  return { badges, unlockedCount, totalCount };
}
