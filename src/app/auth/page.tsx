"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/useAuth";
import { useUser } from "@/lib/useUser";

export default function AuthPage() {
  const router = useRouter();
  const { signInAnonymously, signInWithEmail, signInWithGoogle, user } = useAuth();
  const { hasCompletedOnboarding } = useUser();

  const [email, setEmail] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const isSignedUp = !!(user && !user.is_anonymous);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsAuthLoading(true);
    const { error } = await signInWithEmail(email.trim());
    setIsAuthLoading(false);
    if (error) {
      setAuthMsg("Error: " + error.message);
    } else {
      setAuthMsg("✨ Magic login link sent to your email!");
    }
  };

  const handleGuestLogin = async () => {
    setIsAuthLoading(true);
    const { error } = await signInAnonymously();
    setIsAuthLoading(false);
    if (error) {
      setAuthMsg("Error: " + error.message);
    } else {
      setAuthMsg("✨ Logged in as Guest!");
      setTimeout(() => {
        router.push(hasCompletedOnboarding ? "/dashboard" : "/onboarding");
      }, 800);
    }
  };

  const handleLaunchApp = () => {
    router.push(hasCompletedOnboarding ? "/dashboard" : "/onboarding");
  };

  useEffect(() => {
    if (isSignedUp) {
      router.push("/dashboard");
    }
  }, [isSignedUp, router]);

  if (isSignedUp) return null;

  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-brand selection:text-ink flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-4 h-10 bg-white border-2 border-ink brutalist-shadow-sm hover:bg-ink hover:text-bg transition-colors font-mono text-xs font-bold uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
        </div>

        <div className="bg-white border-4 border-ink brutalist-shadow p-6 sm:p-8 space-y-6 text-ink">
          <div className="flex items-center gap-3 border-b-4 border-ink pb-4">
            <div className="p-2 bg-brand border-2 border-ink">
              <LogIn className="w-5 h-5 text-ink" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-ink/50 tracking-widest">
                Sanctuary Access
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight">
                Sign In to EX-it
              </h1>
            </div>
          </div>

          <p className="font-sans text-xs text-ink/70">
            Log in to sync your diary entries, streak calendar, and red flags.
          </p>

          <Button
            type="button"
            onClick={async () => {
              setIsAuthLoading(true);
              const { error } = await signInWithGoogle();
              setIsAuthLoading(false);
              if (error) setAuthMsg("Error: " + error.message);
            }}
            disabled={isAuthLoading}
            className="w-full h-12 bg-white text-ink hover:bg-bg font-mono font-bold uppercase text-xs border-3 border-ink flex items-center justify-center gap-2 brutalist-shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center border-t-2 border-ink/20 pt-4">
            <span className="font-mono text-[11px] text-ink/60 uppercase bg-white px-2 absolute -top-3">
              Or Login With Email
            </span>
          </div>

          <form onSubmit={handleMagicLinkLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-wider block">
                Your Email Address
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-3 border-ink font-mono text-sm bg-bg px-4"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isAuthLoading || !email.trim()}
              className="w-full h-12 bg-ink text-bg hover:bg-ink/90 font-mono font-bold uppercase text-xs border-3 border-ink"
            >
              {isAuthLoading ? "Sending Magic Link..." : "Send Magic Login Link ✉️"}
            </Button>
          </form>

          <div className="relative flex items-center justify-center border-t-2 border-ink/20 pt-4">
            <span className="font-mono text-[11px] text-ink/60 uppercase bg-white px-2 absolute -top-3">
              Or Continue As
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleGuestLogin}
              disabled={isAuthLoading}
              className="w-full h-12 border-3 border-ink font-mono font-bold uppercase text-xs bg-bg hover:bg-white"
            >
              Guest / Demo Sanctuary Access 👤
            </Button>

            <Button
              variant="ghost"
              onClick={handleLaunchApp}
              className="w-full h-10 border-2 border-ink font-mono text-[11px] uppercase"
            >
              Launch App Directly →
            </Button>
          </div>

          {authMsg && (
            <div className="p-3 bg-positive/20 border-2 border-positive font-mono text-xs font-bold text-center">
              {authMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
