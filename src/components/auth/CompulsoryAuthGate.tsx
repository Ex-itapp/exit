"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Lock, Mail, Key, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export function CompulsoryAuthGate() {
  const { signInWithGoogle, signInWithEmail, signInWithPassword, signUpWithPassword } = useAuth();

  const [authTab, setAuthTab] = useState<'google' | 'magic' | 'password'>('google');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setMsg(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setMsg({ text: "Google Auth Error: " + error.message, type: 'error' });
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setMsg({ text: "Please enter your email address.", type: 'error' });
      return;
    }
    setLoading(true);
    setMsg(null);
    const { error } = await signInWithEmail(email.trim());
    setLoading(false);
    if (error) {
      setMsg({ text: "Error: " + error.message, type: 'error' });
    } else {
      setMsg({ text: "✨ Magic login link sent! Check your inbox to enter.", type: 'success' });
    }
  };

  const handlePasswordAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setMsg({ text: "Please provide both email and password.", type: 'error' });
      return;
    }
    setLoading(true);
    setMsg(null);
    if (isSignUp) {
      const { error } = await signUpWithPassword(email.trim(), password);
      setLoading(false);
      if (error) {
        setMsg({ text: "Sign Up Error: " + error.message, type: 'error' });
      } else {
        setMsg({ text: "✨ Account created! You are now logged in.", type: 'success' });
      }
    } else {
      const { error } = await signInWithPassword(email.trim(), password);
      setLoading(false);
      if (error) {
        setMsg({ text: "Login Error: " + error.message, type: 'error' });
      } else {
        setMsg({ text: "✨ Welcome back!", type: 'success' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'linear-gradient(var(--color-ink) 2px, transparent 2px), linear-gradient(90deg, var(--color-ink) 2px, transparent 2px)',
          backgroundSize: '40px 40px'
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 max-w-md w-full bg-white border-4 border-ink brutalist-shadow p-6 sm:p-8 space-y-6"
      >
        <div className="text-center space-y-2 border-b-4 border-ink pb-6">
          <div className="w-12 h-12 bg-brand border-3 border-ink flex items-center justify-center mx-auto transform -rotate-3 mb-3 shadow-sm">
            <Lock className="w-6 h-6 text-ink" />
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-ink text-bg px-2.5 py-1">
            Compulsory Sanctuary Gate
          </span>
          <h1 className="text-3xl font-heading uppercase tracking-tight mt-1">AUTHENTICATION REQUIRED</h1>
          <p className="font-sans text-xs sm:text-sm text-ink/80 leading-relaxed">
            To protect your private diary entries, Person Engine profiles, and healing metrics, authentication is compulsory to enter EX-it.
          </p>
        </div>

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 border-b-2 border-ink/20 pb-4">
          <button
            onClick={() => { setAuthTab('google'); setMsg(null); }}
            className={cn("h-11 border-2 border-ink font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2",
              authTab === 'google' ? "bg-ink text-bg brutalist-shadow-sm" : "bg-bg text-ink hover:bg-white"
            )}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Auth</span>
          </button>

          <button
            onClick={() => { setAuthTab('magic'); setMsg(null); }}
            className={cn("h-11 border-2 border-ink font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2",
              authTab === 'magic' ? "bg-brand text-ink brutalist-shadow-sm" : "bg-bg text-ink hover:bg-white"
            )}
          >
            <Mail className="w-4 h-4" />
            <span>Email Login</span>
          </button>
        </div>

        {/* TAB 1: GOOGLE OAUTH */}
        {authTab === 'google' && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-bg border-2 border-ink space-y-2 text-center">
              <p className="font-mono text-xs leading-relaxed text-ink/80">
                Sign in securely with your Google account. One-click instant cloud sync and private backup.
              </p>
            </div>

            <Button
              className="w-full h-14 bg-white hover:bg-gray-50 text-ink border-3 border-ink brutalist-shadow text-sm font-bold uppercase flex items-center justify-center gap-3"
              onClick={handleGoogle}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
            </Button>
          </div>
        )}

        {/* TAB 2: EMAIL LOGIN (MAGIC LINK / PASSWORD) */}
        {authTab === 'magic' && (
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold uppercase">Email Authentication</span>
              <button 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-brand font-bold hover:underline"
              >
                {isSignUp ? "Switch to Login" : "Need to Sign Up?"}
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold uppercase">Email Address</label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-2 border-ink font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold uppercase flex justify-between">
                  <span>Password (Optional for Magic Link)</span>
                </label>
                <Input
                  type="password"
                  placeholder="Leave empty for passwordless Magic Link"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-2 border-ink font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {password.trim() ? (
                <Button
                  className="w-full h-14 bg-ink text-bg hover:bg-ink/90 font-bold uppercase text-sm shadow-md"
                  onClick={handlePasswordAuth}
                  disabled={loading || !email.trim()}
                >
                  <Key className="w-4 h-4 mr-2" />
                  {loading ? "Processing..." : isSignUp ? "Create Account & Enter" : "Sign In with Password"}
                </Button>
              ) : (
                <Button
                  className="w-full h-14 bg-brand hover:bg-brand/90 text-ink border-3 border-ink brutalist-shadow text-sm font-bold uppercase"
                  onClick={handleMagicLink}
                  disabled={loading || !email.trim()}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {loading ? "Sending Link..." : "Send Email Magic Link"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Status Message */}
        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn("p-3 border-2 border-ink font-mono text-xs font-bold",
                msg.type === 'success' ? "bg-positive/20 border-positive text-ink" : "bg-danger/20 border-danger text-danger"
              )}
            >
              {msg.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4 border-t-2 border-ink/10 flex items-center justify-center gap-2 text-[10px] font-mono text-ink/60">
          <ShieldCheck className="w-4 h-4 text-positive" />
          <span>Secure Cloud Sync • End-to-End Privacy</span>
        </div>
      </motion.div>
    </div>
  );
}
