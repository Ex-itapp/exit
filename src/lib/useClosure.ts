"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface VoiceProfile {
  response_time: string;
  typing_quirks: string;
  double_texting: string;
  capitalization: string;
  punctuation_habits: string;
  avg_message_length: string;
  emoji_usage: string;
  common_words_phrases: string[];
  tone_baseline: string;
  tone_under_conflict: string;
  tone_when_affectionate: string;
  recurring_topics: string[];
  top_verbatim_example_lines: string[];
  raw_chat_export?: string;
}

export interface TraitProfile {
  flaws_or_toxic_traits: string;
  breakup_context: string;
  trigger_phrase: string;
  values: string;
  love_language: string;
  conflict_behavior: string;
  humor_notes: string;
  relationship_context: string;
}

export interface ExProfile {
  id: string;
  label: string;
  voice_profile: VoiceProfile;
  trait_profile: TraitProfile;
  created_at: string;
  updated_at: string;
}

export interface MemoryBankEntry {
  id: string;
  ex_profile_id: string;
  content: string;
  topic_tags: string[];
  emotional_weight: 'hurt' | 'fond' | 'angry' | 'confusing' | 'neutral';
  source: 'user_added' | 'correction';
  created_at: string;
}

export interface ClosureMessage {
  id: string;
  session_id: string;
  role: 'user' | 'ex_simulation' | 'system_scripted';
  content: string;
  flagged_and_regenerated?: boolean;
  created_at: string;
}

export interface ClosureSession {
  id: string;
  ex_profile_id: string;
  status: 'active' | 'completed' | 'paused_crisis';
  message_count: number;
  max_messages: number;
  reflection_response?: string;
  started_at: string;
  ended_at?: string;
}

const STORAGE_KEY_PROFILE = 'unsent_closure_profile_clean';
const STORAGE_KEY_MEMORIES = 'unsent_closure_memories_clean';
const STORAGE_KEY_SESSIONS = 'unsent_closure_sessions_clean';
const STORAGE_KEY_MESSAGES = 'unsent_closure_messages_clean';
const STORAGE_KEY_SESSIONS_USED = 'unsent_closure_sessions_used_count';

export function useClosure() {
  const [profile, setProfileState] = useState<ExProfile | null>(null);
  const [memories, setMemoriesState] = useState<MemoryBankEntry[]>([]);
  const [sessions, setSessionsState] = useState<ClosureSession[]>([]);
  const [messages, setMessagesState] = useState<ClosureMessage[]>([]);
  const [sessionsUsedCount, setSessionsUsedCountState] = useState<number>(0);
  const maxSessionsAllowed = 9999; // Unlimited

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load from local cache first for instant UI responsiveness
    const savedProf = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (savedProf) try { setProfileState(JSON.parse(savedProf)); } catch (e) { }

    const savedMem = localStorage.getItem(STORAGE_KEY_MEMORIES);
    if (savedMem) try { setMemoriesState(JSON.parse(savedMem)); } catch (e) { }

    const savedSess = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (savedSess) try { setSessionsState(JSON.parse(savedSess)); } catch (e) { }

    const savedMsg = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (savedMsg) try { setMessagesState(JSON.parse(savedMsg)); } catch (e) { }

    const savedUsed = localStorage.getItem(STORAGE_KEY_SESSIONS_USED);
    if (savedUsed) setSessionsUsedCountState(parseInt(savedUsed, 10) || 0);

    // Sync with Supabase Database if logged in
    async function syncWithSupabase() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;

      // 1. Fetch Profile
      const { data: profData } = await supabase.from('ex_profiles').select('*').eq('user_id', userId).maybeSingle();
      if (profData) {
        const loadedProf: ExProfile = {
          id: profData.id,
          label: profData.label,
          voice_profile: profData.voice_profile,
          trait_profile: profData.trait_profile,
          created_at: profData.created_at,
          updated_at: profData.updated_at
        };
        setProfileState(loadedProf);
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(loadedProf));
      }

      // 2. Fetch Memories
      const { data: memData } = await supabase.from('memory_bank').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (memData) {
        setMemoriesState(memData as MemoryBankEntry[]);
        localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memData));
      }

      // 3. Fetch Sessions
      const { data: sessData } = await supabase.from('closure_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false });
      if (sessData && sessData.length > 0) {
        setSessionsState(prev => {
          const map = new Map<string, ClosureSession>();
          prev.forEach(s => map.set(s.id, s));
          (sessData as ClosureSession[]).forEach(s => map.set(s.id, s));
          const merged = Array.from(map.values()).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
          localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(merged));
          return merged;
        });
      }

      // 4. Fetch Messages
      const { data: msgData } = await supabase.from('closure_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true });
      if (msgData && msgData.length > 0) {
        setMessagesState(prev => {
          const map = new Map<string, ClosureMessage>();
          prev.forEach(m => map.set(m.id, m));
          (msgData as ClosureMessage[]).forEach(m => map.set(m.id, m));
          const merged = Array.from(map.values()).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(merged));
          return merged;
        });
      }
    }

    syncWithSupabase();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      syncWithSupabase();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const saveProfile = async (newProf: ExProfile) => {
    setProfileState(newProf);
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProf));

    // Sync to Supabase DB
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const userId = session.user.id;
      await supabase.from('ex_profiles').upsert({
        id: newProf.id,
        user_id: userId,
        label: newProf.label || 'Them',
        voice_profile: newProf.voice_profile,
        trait_profile: newProf.trait_profile,
        updated_at: new Date().toISOString()
      });
    }
  };

  const updateVoiceProfile = (vp: Partial<VoiceProfile>) => {
    if (!profile) return;
    const updated: ExProfile = {
      ...profile,
      voice_profile: { ...profile.voice_profile, ...vp },
      updated_at: new Date().toISOString()
    };
    saveProfile(updated);
  };

  const updateTraitProfile = (tp: Partial<TraitProfile>) => {
    if (!profile) return;
    const updated: ExProfile = {
      ...profile,
      trait_profile: { ...profile.trait_profile, ...tp },
      updated_at: new Date().toISOString()
    };
    saveProfile(updated);
  };

  const tuneVoiceProfileFromCorrection = async (aiMsg: string, correctionText: string) => {
    if (!profile) return;
    try {
      const res = await fetch('/api/closure/tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceProfile: profile.voice_profile,
          aiMsg,
          correctionText
        })
      });
      const data = await res.json();
      if (data.updatedVoiceProfile) {
        updateVoiceProfile(data.updatedVoiceProfile);
        return true;
      }
    } catch (e) {
      console.error("Error tuning voice:", e);
    }
    return false;
  };

  const addMemory = async (content: string, topic_tags: string[], emotional_weight: MemoryBankEntry['emotional_weight'], source: MemoryBankEntry['source'] = 'user_added') => {
    const memId = "mem-" + Date.now();
    const newEntry: MemoryBankEntry = {
      id: memId,
      ex_profile_id: profile?.id || "default-ex-profile",
      content,
      topic_tags,
      emotional_weight,
      source,
      created_at: new Date().toISOString()
    };
    const updated = [newEntry, ...memories];
    setMemoriesState(updated);
    localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(updated));

    // Sync to Supabase DB & generate embedding
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && profile?.id) {
      await supabase.from('memory_bank').insert({
        id: memId,
        ex_profile_id: profile.id,
        user_id: session.user.id,
        content,
        topic_tags,
        emotional_weight,
        source
      });
    }

    return newEntry;
  };

  const deleteMemory = async (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemoriesState(updated);
    localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(updated));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('memory_bank').delete().eq('id', id).eq('user_id', session.user.id);
    }
  };

  const getActiveSession = (): ClosureSession | undefined => {
    return sessions.find(s => s.status === 'active');
  };

  const createSession = async (): Promise<{ session?: ClosureSession; error?: string }> => {
    // Use callback form to get the latest state, avoiding race conditions
    let active: ClosureSession | undefined;
    setSessionsState(prev => {
      active = prev.find(s => s.status === 'active');
      return prev;
    });
    if (active) return { session: active };

    if (!profile) {
      return { error: "Please set up your Persona profile before initiating a session." };
    }

    const sessId = "sess-" + Date.now();
    const newSession: ClosureSession = {
      id: sessId,
      ex_profile_id: profile.id,
      status: 'active',
      message_count: 0,
      max_messages: 9999,
      started_at: new Date().toISOString()
    };

    const updatedSessions = [newSession, ...sessions];
    setSessionsState(updatedSessions);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updatedSessions));

    const newCount = sessionsUsedCount + 1;
    setSessionsUsedCountState(newCount);
    localStorage.setItem(STORAGE_KEY_SESSIONS_USED, newCount.toString());

    // Add initial scripted greeting
    const starterMsg: ClosureMessage = {
      id: "msg-" + Date.now(),
      session_id: newSession.id,
      role: 'ex_simulation',
      content: "Hey. I didn't expect to hear from you... what did you want to say?",
      created_at: new Date().toISOString()
    };
    const updatedMessages = [...messages, starterMsg];
    setMessagesState(updatedMessages);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updatedMessages));

    // Sync to Supabase DB
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('closure_sessions').insert({
        id: sessId,
        user_id: session.user.id,
        ex_profile_id: profile.id,
        status: 'active',
        message_count: 0,
        max_messages: 9999,
        started_at: newSession.started_at
      });

      await supabase.from('closure_messages').insert({
        id: starterMsg.id,
        session_id: sessId,
        user_id: session.user.id,
        role: 'ex_simulation',
        content: starterMsg.content,
        created_at: starterMsg.created_at
      });
    }

    return { session: newSession };
  };

  const addMessage = async (sessionId: string, role: ClosureMessage['role'], content: string, flagged = false) => {
    const msgId = "msg-" + Date.now() + Math.random().toString(36).substring(2, 5);
    const newMsg: ClosureMessage = {
      id: msgId,
      session_id: sessionId,
      role,
      content,
      flagged_and_regenerated: flagged,
      created_at: new Date().toISOString()
    };
    let updatedMessages: ClosureMessage[] = [];
    setMessagesState(prev => {
      updatedMessages = [...prev, newMsg];
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updatedMessages));
      return updatedMessages;
    });

    let updatedSessions: ClosureSession[] = [];
    setSessionsState(prevSess => {
      updatedSessions = prevSess.map(s => {
        if (s.id === sessionId) {
          return { ...s, message_count: s.message_count + 1 };
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updatedSessions));
      return updatedSessions;
    });

    // Sync to Supabase DB
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('closure_messages').insert({
        id: msgId,
        session_id: sessionId,
        user_id: session.user.id,
        role,
        content,
        flagged_and_regenerated: flagged,
        created_at: newMsg.created_at
      });

      const currSess = updatedSessions.find(s => s.id === sessionId);
      if (currSess) {
        await supabase.from('closure_sessions').update({
          message_count: currSess.message_count
        }).eq('id', sessionId).eq('user_id', session.user.id);
      }
    }

    return newMsg;
  };

  const endSession = async (sessionId: string, reflection?: string, status: 'completed' | 'paused_crisis' = 'completed') => {
    const endedAt = new Date().toISOString();
    const updatedSessions = sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          status,
          reflection_response: reflection,
          ended_at: endedAt
        };
      }
      return s;
    });
    setSessionsState(updatedSessions);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updatedSessions));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('closure_sessions').update({
        status,
        reflection_response: reflection,
        ended_at: endedAt
      }).eq('id', sessionId).eq('user_id', session.user.id);
    }
  };

  const getSessionMessages = (sessionId: string) => {
    return messages.filter(m => m.session_id === sessionId);
  };

  const retrieveRelevantMemories = (queryText: string, limit = 3): MemoryBankEntry[] => {
    if (!memories || memories.length === 0) return [];
    const queryLower = queryText.toLowerCase();

    const scored = memories.map(mem => {
      let score = 0;
      mem.topic_tags.forEach(tag => {
        if (queryLower.includes(tag.toLowerCase())) score += 3;
      });
      const words = mem.content.toLowerCase().split(/\s+/);
      words.forEach(w => {
        if (w.length > 4 && queryLower.includes(w)) score += 1;
      });
      return { mem, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(item => item.mem);
  };

  const resetAllClosureData = () => {
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_MEMORIES);
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    localStorage.removeItem(STORAGE_KEY_SESSIONS_USED);
    setProfileState(null);
    setMemoriesState([]);
    setSessionsState([]);
    setMessagesState([]);
    setSessionsUsedCountState(0);
  };

  return {
    profile,
    memories,
    sessions,
    messages,
    sessionsUsedCount,
    maxSessionsAllowed,
    saveProfile,
    updateVoiceProfile,
    updateTraitProfile,
    tuneVoiceProfileFromCorrection,
    addMemory,
    deleteMemory,
    getActiveSession,
    createSession,
    addMessage,
    endSession,
    getSessionMessages,
    retrieveRelevantMemories,
    resetAllClosureData
  };
}
