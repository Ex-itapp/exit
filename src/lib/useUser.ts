"use client";

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  AvatarConfig, 
  AVATAR_SHAPES, 
  AVATAR_COLORS, 
  AVATAR_EYES, 
  AVATAR_MOUTHS, 
  AVATAR_ACCESSORIES 
} from '@/components/ui/Avatar';

export type AppMode = 'evaluating' | 'no_contact';

export const DEFAULT_AVATAR: AvatarConfig = {
  shape: 'blob',
  fillColor: '#00E676',
  eyes: 'happy',
  mouth: 'smile',
  accessory: 'sparkle'
};

export interface UserState {
  userName: string;
  userGoal: string;
  userAnchor: string;
  userAvatar: AvatarConfig;
  breakupDate: string | null;
  punchedDates: string[];
  appMode: AppMode;
  hasCompletedOnboarding: boolean;
  isProfileSyncing: boolean;
  streakDays: number;
  lastSeenStreak: number;
}

export function getDeterministicAvatar(userId: string): AvatarConfig {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash);
  return {
    shape: AVATAR_SHAPES[h % AVATAR_SHAPES.length],
    fillColor: AVATAR_COLORS[h % AVATAR_COLORS.length],
    eyes: AVATAR_EYES[h % AVATAR_EYES.length],
    mouth: AVATAR_MOUTHS[h % AVATAR_MOUTHS.length],
    accessory: AVATAR_ACCESSORIES[h % AVATAR_ACCESSORIES.length],
  };
}

export function useUser() {
  const [userName, setUserName] = useState<string>("Friend");
  const [userGoal, setUserGoal] = useState<string>("Finding peace and clarity");
  const [userAnchor, setUserAnchor] = useState<string>("I deserve someone who chooses me every day.");
  const [userAvatar, setUserAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [breakupDate, setBreakupDate] = useState<string | null>(null);
  const [punchedDates, setPunchedDates] = useState<string[]>([]);
  const [appModeState, setAppModeState] = useState<AppMode>('no_contact');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isProfileSyncing, setIsProfileSyncing] = useState<boolean>(true);
  const [lastSeenStreak, setLastSeenStreak] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadState = () => {
      const savedName = localStorage.getItem('unsent_user_name_clean');
      if (savedName) setUserName(savedName);

      const savedGoal = localStorage.getItem('unsent_user_goal_clean');
      if (savedGoal) setUserGoal(savedGoal);

      const savedAnchor = localStorage.getItem('unsent_user_anchor_clean');
      if (savedAnchor) setUserAnchor(savedAnchor);

      const savedAvatarStr = localStorage.getItem('unsent_user_avatar_config');
      if (savedAvatarStr) {
        try {
          setUserAvatar(JSON.parse(savedAvatarStr));
        } catch (e) {
          // fallback to default if corrupt
        }
      }

      let savedDate = localStorage.getItem('unsent_breakup_date_clean');
      if (!savedDate) {
        savedDate = new Date().toISOString();
        localStorage.setItem('unsent_breakup_date_clean', savedDate);
      }
      setBreakupDate(savedDate);

      const savedPunches = localStorage.getItem('unsent_punched_dates_clean');
      if (savedPunches) try { setPunchedDates(JSON.parse(savedPunches)); } catch (e) {}

      const savedMode = localStorage.getItem('unsent_app_mode_clean') as AppMode;
      if (savedMode) setAppModeState(savedMode);

      const savedOnboarding = localStorage.getItem('unsent_onboarding_done_clean');
      setHasCompletedOnboarding(savedOnboarding === 'true');

      const savedStreak = localStorage.getItem('unsent_last_seen_streak_clean');
      if (savedStreak) setLastSeenStreak(parseInt(savedStreak, 10));
    };
    
    loadState();

    async function syncWithSupabase() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsProfileSyncing(false);
        return;
      }
      
      const [{ data }, { data: avatarData }] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', session.user.id).maybeSingle(),
        supabase.from('user_avatars').select('*').eq('user_id', session.user.id).maybeSingle()
      ]);

      if (data) {
        setUserName(data.user_name || "Friend");
        setUserGoal(data.user_goal || "Finding peace and clarity");
        setUserAnchor(data.user_anchor || "I deserve someone who chooses me every day.");
        setBreakupDate(data.breakup_date || new Date().toISOString());
        if (data.app_mode) setAppModeState(data.app_mode as AppMode);
        setHasCompletedOnboarding(!!data.has_completed_onboarding);

        // Fire and forget tracker to log the user as active today
        supabase.from('user_profiles').update({ last_active_at: new Date().toISOString() }).eq('id', session.user.id).then();

        localStorage.setItem('unsent_user_name_clean', data.user_name || "Friend");
        localStorage.setItem('unsent_user_goal_clean', data.user_goal || "Finding peace and clarity");
        localStorage.setItem('unsent_user_anchor_clean', data.user_anchor || "I deserve someone who chooses me every day.");
        if (data.breakup_date) localStorage.setItem('unsent_breakup_date_clean', data.breakup_date);
        if (data.app_mode) localStorage.setItem('unsent_app_mode_clean', data.app_mode);
        localStorage.setItem('unsent_onboarding_done_clean', data.has_completed_onboarding ? 'true' : 'false');
      }

      if (avatarData) {
        const config: AvatarConfig = {
          shape: avatarData.shape,
          fillColor: avatarData.fill_color,
          eyes: avatarData.eyes,
          mouth: avatarData.mouth,
          accessory: avatarData.accessory
        };
        setUserAvatar(config);
        localStorage.setItem('unsent_user_avatar_config', JSON.stringify(config));
      } else {
        const savedAvatarStr = localStorage.getItem('unsent_user_avatar_config');
        let avatarToSave: AvatarConfig | null = null;
        if (savedAvatarStr) {
          try { avatarToSave = JSON.parse(savedAvatarStr); } catch (e) {}
        }
        if (!avatarToSave) {
          avatarToSave = getDeterministicAvatar(session.user.id);
        }

        setUserAvatar(avatarToSave);
        localStorage.setItem('unsent_user_avatar_config', JSON.stringify(avatarToSave));
        
        // Save initial deterministic (or locally existing) avatar to db
        supabase.from('user_avatars').upsert({
          user_id: session.user.id,
          shape: avatarToSave.shape,
          fill_color: avatarToSave.fillColor,
          eyes: avatarToSave.eyes,
          mouth: avatarToSave.mouth,
          accessory: avatarToSave.accessory,
          updated_at: new Date().toISOString()
        }).then();
      }
      setIsProfileSyncing(false);
    }

    syncWithSupabase();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsProfileSyncing(true);
        syncWithSupabase();
      } else {
        setIsProfileSyncing(false);
      }
    });

    const handleSync = () => loadState();
    window.addEventListener('unsent_sync', handleSync);
    
    return () => {
      window.removeEventListener('unsent_sync', handleSync);
      subscription.unsubscribe();
    };
  }, []);

  const streakDays = (() => {
    if (!breakupDate) return 0;
    // Use date-only comparison to avoid timezone drift
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const breakup = new Date(breakupDate);
    const breakupDay = new Date(breakup.getFullYear(), breakup.getMonth(), breakup.getDate());
    const diffMs = today.getTime() - breakupDay.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  })();

  const updateLastSeenStreak = (newStreak: number) => {
    setLastSeenStreak(newStreak);
    localStorage.setItem('unsent_last_seen_streak_clean', newStreak.toString());
  };

  const punchToday = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!punchedDates.includes(todayStr)) {
      const newPunches = [...punchedDates, todayStr];
      setPunchedDates(newPunches);
      localStorage.setItem('unsent_punched_dates_clean', JSON.stringify(newPunches));
      window.dispatchEvent(new Event('unsent_sync'));
    }
  };

  const setAppMode = async (mode: AppMode) => {
    setAppModeState(mode);
    localStorage.setItem('unsent_app_mode_clean', mode);
    window.dispatchEvent(new Event('unsent_sync'));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('user_profiles').upsert({
        id: session.user.id,
        app_mode: mode,
        updated_at: new Date().toISOString()
      });
    }
  };

  const completeOnboarding = async (name: string, goal: string, anchor: string, mode: AppMode, date: string) => {
    setUserName(name || "Friend");
    setUserGoal(goal || "Finding peace and clarity");
    setUserAnchor(anchor || "I deserve someone who chooses me every day.");
    setAppModeState(mode);
    setBreakupDate(date);
    setHasCompletedOnboarding(true);

    localStorage.setItem('unsent_user_name_clean', name || "Friend");
    localStorage.setItem('unsent_user_goal_clean', goal || "Finding peace and clarity");
    localStorage.setItem('unsent_user_anchor_clean', anchor || "I deserve someone who chooses me every day.");
    localStorage.setItem('unsent_app_mode_clean', mode);
    localStorage.setItem('unsent_breakup_date_clean', date);
    localStorage.setItem('unsent_onboarding_done_clean', 'true');

    window.dispatchEvent(new Event('unsent_sync'));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('user_profiles').upsert({
        id: session.user.id,
        user_name: name || "Friend",
        user_goal: goal || "Finding peace and clarity",
        user_anchor: anchor || "I deserve someone who chooses me every day.",
        app_mode: mode,
        breakup_date: date,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString()
      });
    }
  };

  const updateUserAvatar = async (config: AvatarConfig) => {
    setUserAvatar(config);
    localStorage.setItem('unsent_user_avatar_config', JSON.stringify(config));
    window.dispatchEvent(new Event('unsent_sync'));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('user_avatars').upsert({
        user_id: session.user.id,
        shape: config.shape,
        fill_color: config.fillColor,
        eyes: config.eyes,
        mouth: config.mouth,
        accessory: config.accessory,
        updated_at: new Date().toISOString()
      });
    }
  };

  const updateProfile = async (name: string, goal: string, anchor: string, date: string, config?: AvatarConfig) => {
    setUserName(name);
    setUserGoal(goal);
    setUserAnchor(anchor);
    setBreakupDate(date);
    if (config) {
      setUserAvatar(config);
      localStorage.setItem('unsent_user_avatar_config', JSON.stringify(config));
    }

    localStorage.setItem('unsent_user_name_clean', name);
    localStorage.setItem('unsent_user_goal_clean', goal);
    localStorage.setItem('unsent_user_anchor_clean', anchor);
    localStorage.setItem('unsent_breakup_date_clean', date);

    window.dispatchEvent(new Event('unsent_sync'));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('user_profiles').upsert({
        id: session.user.id,
        user_name: name,
        user_goal: goal,
        user_anchor: anchor,
        breakup_date: date,
        updated_at: new Date().toISOString()
      });
      if (config) {
        await supabase.from('user_avatars').upsert({
          user_id: session.user.id,
          shape: config.shape,
          fill_color: config.fillColor,
          eyes: config.eyes,
          mouth: config.mouth,
          accessory: config.accessory,
          updated_at: new Date().toISOString()
        });
      }
    }
  };

  const resetAccount = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        await Promise.allSettled([
          supabase.from('diary_entries').delete().eq('user_id', session.user.id),
          supabase.from('red_flags').delete().eq('user_id', session.user.id),
          supabase.from('checkins').delete().eq('user_id', session.user.id),
          supabase.from('ex_profiles').delete().eq('user_id', session.user.id),
          supabase.from('memory_bank').delete().eq('user_id', session.user.id),
          supabase.from('closure_sessions').delete().eq('user_id', session.user.id),
          supabase.from('closure_messages').delete().eq('user_id', session.user.id)
        ]);
        await supabase.from('user_profiles').update({ has_completed_onboarding: false }).eq('id', session.user.id);
        await supabase.auth.updateUser({ data: { has_seen_pwa_prompt: null } });
      } catch (err) {
        console.error("Error wiping remote data:", err);
      }
    }

    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('unsent_')) {
          localStorage.removeItem(key);
        }
      });
    }

    setHasCompletedOnboarding(false);
    window.location.href = '/onboarding';
  };

  return {
    userName,
    userGoal,
    userAnchor,
    userAvatar,
    breakupDate,
    punchedDates,
    appMode: appModeState,
    hasCompletedOnboarding,
    isProfileSyncing,
    streakDays,
    lastSeenStreak,
    updateProfile,
    updateUserAvatar,
    punchToday,
    setAppMode,
    completeOnboarding,
    updateLastSeenStreak,
    resetAccount,
  };
}
