"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' || 
  window.location.hostname.startsWith('192.168.')
);

const MOCK_LOCAL_USER = {
  id: "localhost-dev-user-000000000000",
  email: "localhost-dev@sanctuary.local",
  app_metadata: {},
  user_metadata: { name: "Localhost Dev Guest" },
  aud: "authenticated",
  created_at: new Date().toISOString()
} as unknown as User;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 1. Google OAuth Authentication
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      },
    });
    return { data, error };
  };

  // 2. Email Magic Link (OTP) Authentication
  const signInWithEmail = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      },
    });
    return { data, error };
  };

  // 3. Email & Password Login
  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  // 4. Email & Password Sign Up
  const signUpWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      },
    });
    return { data, error };
  };

  const signInAnonymously = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("unsent_onboarding_done_clean");
        localStorage.removeItem("unsent_user_name_clean");
        localStorage.removeItem("unsent_user_goal_clean");
        localStorage.removeItem("unsent_user_anchor_clean");
        localStorage.removeItem("unsent_breakup_date_clean");
        localStorage.removeItem("unsent_app_mode_clean");
        window.location.href = "/";
      }
    }
    return { error };
  };

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signInWithPassword,
    signUpWithPassword,
    signInAnonymously,
    signOut,
  };
}
