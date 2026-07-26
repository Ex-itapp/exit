"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  MessageSquare, AlertTriangle, Send, Sparkles, BrainCircuit, 
  Database, ShieldAlert, CheckCircle2, RefreshCw, Trash2, 
  HelpCircle, Lock, ArrowRight, X, User, Heart, Shield, Plus,
  FileText, Upload, Sliders, Check, ArrowLeft, Settings, Zap
} from "lucide-react";
import { useClosure, type MemoryBankEntry, type VoiceProfile, type TraitProfile } from "@/lib/useClosure";
import { useDiary } from "@/lib/useDiary";
import { useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function ClosurePage() {
  const {
    profile, memories, sessions, messages, sessionsUsedCount, maxSessionsAllowed,
    saveProfile, updateVoiceProfile, updateTraitProfile, tuneVoiceProfileFromCorrection,
    addMemory, deleteMemory, getActiveSession, createSession, addMessage, endSession,
    getSessionMessages, retrieveRelevantMemories, resetAllClosureData
  } = useClosure();

  const { addEntry } = useDiary();
  const { user, signInAnonymously, signInWithEmail } = useAuth();

  // Active UI Navigation Tab: 'sessions' | 'engine' | 'memories'
  const [activeTab, setActiveTab] = useState<'sessions' | 'engine' | 'memories'>(profile ? 'sessions' : 'engine');

  // Person Engine Interactive Onboarding Step: 1 to 4
  const [engineStep, setEngineStep] = useState<number>(1);

  // Chat State
  const activeSession = getActiveSession();
  const sessionMsgs = activeSession ? getSessionMessages(activeSession.id) : [];
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReflectionCard, setShowReflectionCard] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Feedback loop state ("doesn't sound like them")
  const [correctingMsgId, setCorrectingMsgId] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const [isTuning, setIsTuning] = useState(false);
  const [tuneToast, setTuneToast] = useState<string | null>(null);

  // Person Engine Intake Form State
  const [sampleText, setSampleText] = useState("");
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [personLabel, setPersonLabel] = useState(profile?.label || "Them");
  const [voiceForm, setVoiceForm] = useState<VoiceProfile>(profile?.voice_profile || {
    capitalization: "lowercase mostly",
    punctuation_habits: "minimal periods, uses '...' when hesitating",
    avg_message_length: "short 1-2 sentences",
    emoji_usage: "occasional",
    common_words_phrases: ["honestly", "look", "it wasn't like that"],
    tone_baseline: "guarded but polite",
    tone_under_conflict: "defensive and quiet",
    tone_when_affectionate: "soft and nostalgic",
    recurring_topics: ["the breakup", "misunderstandings"],
    top_verbatim_example_lines: [
      "I just think we were going in different directions.",
      "honestly I didn't mean to hurt you.",
      "can we not talk about this right now?"
    ]
  });

  const [traitForm, setTraitForm] = useState<TraitProfile>(profile?.trait_profile || {
    values: "Personal peace, career goals over emotional heavy lifting",
    love_language: "Quality time and acts of service",
    conflict_behavior: "Shut down and withdraw rather than argue",
    humor_notes: "Sarcastic and self-deprecating",
    relationship_context: "We dated in the past and ended abruptly after an argument."
  });

  // Memory Bank New Entry Form State
  const [newMemContent, setNewMemContent] = useState("");
  const [newMemTags, setNewMemTags] = useState("");
  const [newMemWeight, setNewMemWeight] = useState<MemoryBankEntry['emotional_weight']>('hurt');

  // Auth Email state
  const [authEmail, setAuthEmail] = useState("");
  const [authSent, setAuthSent] = useState(false);

  useEffect(() => {
    if (profile) {
      setPersonLabel(profile.label || "Them");
      setVoiceForm(profile.voice_profile);
      setTraitForm(profile.trait_profile);
    } else {
      setActiveTab('engine');
    }
  }, [profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionMsgs.length, isLoading]);

  const handleStartSession = async () => {
    if (!profile) {
      setActiveTab('engine');
      return;
    }
    const res = await createSession();
    if (res.error) {
      alert(res.error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMsg.trim() || !activeSession || isLoading) return;

    const userText = inputMsg.trim();
    setInputMsg("");
    await addMessage(activeSession.id, 'user', userText);

    if (activeSession.message_count + 1 >= activeSession.max_messages) {
      setShowReflectionCard(true);
      return;
    }

    setIsLoading(true);
    try {
      const relevantMems = retrieveRelevantMemories(userText, 3);
      const res = await fetch('/api/closure/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
          history: sessionMsgs,
          voiceProfile: profile?.voice_profile,
          traitProfile: profile?.trait_profile,
          retrievedMemories: relevantMems
        })
      });

      const data = await res.json();

      if (data.status === 'paused_crisis') {
        await addMessage(activeSession.id, 'system_scripted', data.aiReply);
        await endSession(activeSession.id, "Paused due to crisis path trigger", 'paused_crisis');
        setIsLoading(false);
        return;
      }

      const aiText = data.aiReply || "I don't know what to say...";
      await addMessage(activeSession.id, 'ex_simulation', aiText);

      if (activeSession.message_count + 2 >= activeSession.max_messages) {
        setShowReflectionCard(true);
      }

    } catch (err) {
      console.error(err);
      await addMessage(activeSession.id, 'ex_simulation', "I just think it's hard to talk about this right now...");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishReflection = async () => {
    if (!activeSession) return;
    if (reflectionText.trim()) {
      await addEntry(
        `[Talk to Them — Closure Reflection]\n\n${reflectionText.trim()}`,
        ["Closure Session", "Reflection", "Talk to Them"],
        true
      );
    }
    await endSession(activeSession.id, reflectionText.trim() || "Completed without reflection", 'completed');
    setShowReflectionCard(false);
    setReflectionText("");
  };

  const handleSaveCorrection = async (aiMsg: string) => {
    if (!correctionText.trim()) return;
    setIsTuning(true);

    // 1. Store as correction memory in Supabase
    await addMemory(
      `[Correction on: "${aiMsg.substring(0, 40)}..."] Actually they would have said: ${correctionText.trim()}`,
      ["correction", "voice-feedback"],
      "confusing",
      "correction"
    );

    // 2. Auto-tune voice profile via AI router
    if (profile) {
      await tuneVoiceProfileFromCorrection(aiMsg, correctionText.trim());
      setTuneToast("⚡ Voice Profile auto-tuned! Future replies will immediately adopt this correction.");
      setTimeout(() => setTuneToast(null), 5000);
    }

    setIsTuning(false);
    setCorrectionText("");
    setCorrectingMsgId(null);
  };

  const handleAnalyzeVoiceSamples = async () => {
    if (!sampleText.trim() || sampleText.trim().length < 10) return;
    setIsAnalyzingVoice(true);
    try {
      const res = await fetch('/api/closure/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: sampleText })
      });
      const data = await res.json();
      if (data.voiceProfile) {
        setVoiceForm(data.voiceProfile);
        alert(data.simulated ? "✨ Analyzed samples! Voice profile updated." : "✨ AI successfully analyzed your text samples and extracted their exact communication style!");
      }
    } catch (err) {
      console.error(err);
      alert("Error analyzing samples. Using current settings.");
    } finally {
      setIsAnalyzingVoice(false);
      setSampleText("");
    }
  };

  const handleSaveEngineProfile = async () => {
    const newProf = {
      id: profile?.id || crypto.randomUUID(),
      label: personLabel || "Them",
      voice_profile: voiceForm,
      trait_profile: traitForm,
      created_at: profile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await saveProfile(newProf);
    setActiveTab('sessions');
  };

  const handleAddMemoryEntry = async () => {
    if (!newMemContent.trim()) return;
    const tags = newMemTags.split(',').map(t => t.trim()).filter(Boolean);
    await addMemory(
      newMemContent.trim(),
      tags.length > 0 ? tags : ["general"],
      newMemWeight,
      "user_added"
    );
    setNewMemContent("");
    setNewMemTags("");
    setNewMemWeight("hurt");
  };

  const handleEmailLogin = async () => {
    if (!authEmail.trim()) return;
    const { error } = await signInWithEmail(authEmail.trim());
    if (error) {
      alert("Auth Error: " + error.message);
    } else {
      setAuthSent(true);
    }
  };

  const sessionsRemaining = Math.max(0, maxSessionsAllowed - sessionsUsedCount);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-200 pb-24 max-w-5xl mx-auto px-4 sm:px-6">
      
      {/* Toast Notification for Tuning */}
      <AnimatePresence>
        {tuneToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-brand border-4 border-ink brutalist-shadow px-6 py-3 font-mono text-xs font-bold text-ink flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-ink animate-spin" />
            <span>{tuneToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <header className="border-b-4 border-ink pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 bg-brand border-2 border-ink block animate-pulse"></span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest bg-ink text-bg px-2 py-0.5">
              Bounded Closure Exercise
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-heading tracking-tighter uppercase">
            TALK TO THEM
          </h1>
          <p className="font-mono text-xs sm:text-sm text-ink/70 mt-1">
            A session-capped AI voice simulation to say what was never said. Not an open companion.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          <div className="p-3 bg-white border-4 border-ink brutalist-shadow-sm flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-brand shrink-0" />
            <div>
              <div className="font-mono text-[10px] font-bold uppercase opacity-70">Weekly Allowance</div>
              <div className="font-heading text-lg leading-none uppercase">
                {sessionsRemaining} of {maxSessionsAllowed} Remaining
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Supabase Auth Banner (if not logged in) */}
      {!user && (
        <div className="bg-purple/10 border-3 border-ink p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-purple shrink-0" />
            <div>
              <h4 className="font-heading uppercase text-sm">Sync with Supabase Cloud DB</h4>
              <p className="font-mono text-[11px] text-ink/70">
                Log in to encrypt and sync your Person Engine profile, memories, and chat history across devices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!authSent ? (
              <>
                <Input
                  placeholder="your@email.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="h-9 text-xs border-2 border-ink bg-white font-mono w-44"
                />
                <Button size="sm" className="h-9 bg-ink text-bg text-[10px]" onClick={handleEmailLogin}>
                  Send Link
                </Button>
                <Button size="sm" variant="secondary" className="h-9 text-[10px]" onClick={signInAnonymously}>
                  Guest Sync
                </Button>
              </>
            ) : (
              <span className="font-mono text-xs text-positive font-bold">✨ Login link sent to email!</span>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: SESSIONS HUB & CHAT */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {!profile ? (
            <Card className="border-4 border-ink brutalist-shadow bg-white p-8 sm:p-12 text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-brand/20 border-4 border-ink flex items-center justify-center transform rotate-3">
                <Sliders className="w-10 h-10 text-ink" strokeWidth={2.2} />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-3xl font-heading uppercase tracking-tight">Person Engine Not Initialized</h2>
                <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
                  Before you can start a bounded session, set up the 4-layer Person Engine so the AI understands their exact tone, vocabulary, and behavioral boundaries.
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <Button 
                  className="h-14 px-8 text-lg bg-brand hover:bg-brand/90 text-ink shadow-md font-bold uppercase"
                  onClick={() => { setActiveTab('engine'); setEngineStep(1); }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Launch Person Engine Setup Wizard
                </Button>
              </div>
            </Card>
          ) : !activeSession ? (
            <Card className="border-4 border-ink brutalist-shadow bg-white p-6 sm:p-10 text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-brand/20 border-4 border-ink flex items-center justify-center transform rotate-3">
                <MessageSquare className="w-10 h-10 text-ink" strokeWidth={2.2} />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-3xl font-heading uppercase tracking-tight">Initiate Closure Session with {profile.label}</h2>
                <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
                  Before you start, know what specific question or unsaid feeling you want to process today. Once initiated, you have a bounded 15-message window.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
                <Button 
                  className="h-14 px-8 text-lg bg-brand hover:bg-brand/90 text-ink shadow-md font-bold uppercase"
                  onClick={handleStartSession}
                  disabled={sessionsRemaining <= 0}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  {sessionsRemaining > 0 ? "Start Bounded Session" : "Session Cap Reached"}
                </Button>

                <Button
                  variant="secondary"
                  className="h-14 px-6 text-sm font-bold uppercase"
                  onClick={() => { setActiveTab('engine'); setEngineStep(1); }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Engine Settings
                </Button>

                <Button
                  variant="secondary"
                  className="h-14 px-6 text-sm font-bold uppercase"
                  onClick={() => setActiveTab('memories')}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Memory Bank ({memories.length})
                </Button>
              </div>
            </Card>
          ) : (
            /* ACTIVE CHAT SCREEN */
            <div className="border-4 border-ink brutalist-shadow bg-white flex flex-col h-[650px] relative overflow-hidden">
              
              {/* Chat Header with Progress Bar */}
              <div className="bg-ink text-bg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 border-b-4 border-ink">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-positive rounded-full animate-pulse" />
                  <div>
                    <h3 className="font-heading text-lg uppercase leading-none flex items-center gap-2 flex-wrap">
                      <span>Simulation Active: {profile.label}</span>
                      <button 
                        onClick={() => { setActiveTab('engine'); setEngineStep(1); }}
                        className="text-[10px] font-mono bg-bg/20 hover:bg-bg/40 text-bg px-2 py-0.5 border border-bg/30 flex items-center gap-1 transition-colors"
                        title="Change voice settings"
                      >
                        <Settings className="w-3 h-3" /> Edit Profile
                      </button>
                      <button 
                        onClick={() => setActiveTab('memories')}
                        className="text-[10px] font-mono bg-bg/20 hover:bg-bg/40 text-bg px-2 py-0.5 border border-bg/30 flex items-center gap-1 transition-colors"
                        title="View memory bank"
                      >
                        <Database className="w-3 h-3" /> Memories ({memories.length})
                      </button>
                    </h3>
                    <p className="font-mono text-[10px] text-bg/70 mt-0.5">
                      Powered by multi-provider API router (Groq LPUs + Gemini + OpenRouter)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold uppercase text-brand">
                      Message {activeSession.message_count} of {activeSession.max_messages} Max
                    </div>
                    <div className="w-32 bg-bg/20 h-2 mt-1 border border-bg/40 overflow-hidden">
                      <div 
                        className="bg-brand h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (activeSession.message_count / activeSession.max_messages) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    className="h-10 px-3 bg-accent text-bg hover:bg-accent/90 border-2 border-bg text-xs font-bold uppercase"
                    onClick={() => setShowReflectionCard(true)}
                  >
                    End Session
                  </Button>
                </div>
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-bg/30 custom-scrollbar">
                {sessionMsgs.map((m) => {
                  const isUser = m.role === 'user';
                  const isSystem = m.role === 'system_scripted';

                  if (isSystem) {
                    return (
                      <div key={m.id} className="bg-accent/15 border-2 border-accent p-4 rounded-none max-w-xl mx-auto my-4 text-center">
                        <AlertTriangle className="w-6 h-6 text-accent mx-auto mb-2" />
                        <p className="font-mono text-xs md:text-sm leading-relaxed text-ink font-bold whitespace-pre-wrap">
                          {m.content}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={m.id}
                      className={cn("flex flex-col max-w-[85%] sm:max-w-md", isUser ? "ml-auto items-end" : "mr-auto items-start")}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="font-mono text-[10px] font-bold uppercase opacity-60">
                          {isUser ? "You" : profile.label}
                        </span>
                        <span className="font-mono text-[9px] opacity-40">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className={cn(
                        "p-4 border-3 border-ink rounded-none shadow-sm font-sans text-sm sm:text-base leading-relaxed whitespace-pre-wrap",
                        isUser ? "bg-brand text-ink brutalist-shadow-sm" : "bg-white text-ink"
                      )}>
                        {m.content}
                      </div>

                      {/* Feedback Loop for Simulation Messages */}
                      {!isUser && (
                        <div className="mt-1 w-full">
                          {correctingMsgId === m.id ? (
                            <div className="bg-purple/10 border-2 border-ink p-3 mt-1 space-y-2 animate-in fade-in duration-150">
                              <div className="flex justify-between items-center font-mono text-[10px] font-bold uppercase">
                                <span>What would they actually have said?</span>
                                <button onClick={() => setCorrectingMsgId(null)} className="hover:opacity-70"><X className="w-3.5 h-3.5" /></button>
                              </div>
                              <Input
                                placeholder="e.g. He would have gotten defensive and said..."
                                value={correctionText}
                                onChange={(e) => setCorrectionText(e.target.value)}
                                className="h-9 text-xs border-2 border-ink bg-white font-mono"
                              />
                              <div className="flex justify-end gap-2 items-center">
                                <span className="text-[9px] font-mono opacity-60 mr-auto">Auto-tunes DB Voice Profile</span>
                                <Button 
                                  size="sm" 
                                  className="h-7 text-[10px] bg-ink text-bg"
                                  onClick={() => handleSaveCorrection(m.content)}
                                  disabled={isTuning || !correctionText.trim()}
                                >
                                  {isTuning ? "Tuning..." : "Save & Auto-Tune"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setCorrectingMsgId(m.id); setCorrectionText(""); }}
                              className="font-mono text-[10px] text-ink/50 hover:text-ink hover:underline flex items-center gap-1 transition-colors px-1"
                            >
                              <RefreshCw className="w-2.5 h-2.5" /> Doesn't sound like them?
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-ink/60 font-mono text-xs p-3 bg-white/60 border-2 border-ink/40 w-fit">
                    <Sparkles className="w-4 h-4 animate-spin text-brand" />
                    <span>Simulating voice via multi-provider router...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-white border-t-4 border-ink flex gap-3 shrink-0">
                <Textarea
                  placeholder="Type your message... (keep it short like a real text)"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[50px] max-h-[100px] border-3 border-ink font-sans text-sm sm:text-base p-3 resize-y"
                />
                <Button 
                  className="h-auto px-6 bg-brand hover:bg-brand/90 text-ink border-3 border-ink shrink-0 shadow-md"
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMsg.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* FULL-SCREEN END-OF-SESSION REFLECTION CARD MODAL */}
              <AnimatePresence>
                {showReflectionCard && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-ink/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-bg"
                  >
                    <div className="max-w-xl w-full bg-bg border-4 border-ink brutalist-shadow p-6 sm:p-10 text-ink space-y-6">
                      <div className="flex items-center gap-3 border-b-4 border-ink pb-4">
                        <CheckCircle2 className="w-8 h-8 text-positive shrink-0" />
                        <div>
                          <span className="font-mono text-xs font-bold uppercase bg-brand text-ink px-2 py-0.5 border border-ink">
                            Session Complete
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-heading uppercase mt-1">That's this session. Before you go —</h2>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-ink p-4 space-y-2">
                        <p className="font-heading text-lg uppercase text-brand bg-ink p-2">
                          Reflection Prompt:
                        </p>
                        <p className="font-sans text-base sm:text-lg font-medium p-2">
                          "What's one thing you said or felt today that you've been carrying for a while? What do you want to remind yourself right now, not them?"
                        </p>
                      </div>

                      <Textarea
                        placeholder="Write your reflection here... We will automatically save this into your Full Diary and cloud database."
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        className="min-h-[120px] border-3 border-ink text-base p-4 bg-white"
                        autoFocus
                      />

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button 
                          className="flex-1 h-14 text-base bg-positive hover:bg-positive/90 text-ink shadow-md font-bold uppercase"
                          onClick={handleFinishReflection}
                        >
                          <FileText className="w-5 h-5 mr-2" />
                          Save Reflection to Diary & Close
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Past Sessions List */}
          <div className="pt-8 space-y-4">
            <h3 className="text-2xl font-heading tracking-tight uppercase">PAST CLOSURE SESSIONS</h3>
            {sessions.filter(s => s.status !== 'active').length === 0 ? (
              <div className="text-center py-10 border-4 border-dashed border-ink/20 bg-white/40">
                <p className="font-mono text-sm opacity-60">NO PAST SESSIONS RECORDED YET.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.filter(s => s.status !== 'active').map((s) => (
                  <Card key={s.id} className="border-3 border-ink p-4 bg-white space-y-3">
                    <div className="flex justify-between items-center border-b-2 border-ink/20 pb-2 font-mono text-xs">
                      <span className="font-bold uppercase text-ink/70">
                        {new Date(s.started_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className={cn("px-2 py-0.5 border font-bold uppercase text-[10px]", 
                        s.status === 'completed' ? "bg-positive/20 border-positive text-ink" : "bg-accent/20 border-accent text-accent"
                      )}>
                        {s.status === 'completed' ? "Completed" : "Paused (Crisis)"}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-ink/70">
                      Messages exchanged: <strong className="text-ink">{s.message_count}</strong>
                    </div>

                    {s.reflection_response && (
                      <div className="bg-bg p-3 border-2 border-ink/30 space-y-1">
                        <div className="font-mono text-[10px] font-bold uppercase text-ink/60">Your Reflection:</div>
                        <p className="font-sans text-xs sm:text-sm line-clamp-3 italic">"{s.reflection_response}"</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PERSON ENGINE (INTERACTIVE STEP-BY-STEP ONBOARDING WIZARD) */}
      {activeTab === 'engine' && (
        <div className="space-y-6">
          {profile && (
            <Button
              variant="secondary"
              onClick={() => setActiveTab('sessions')}
              className="font-mono font-bold text-xs uppercase bg-white border-2 border-ink h-10 px-4 hover:bg-ink hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Talk to Them Hub
            </Button>
          )}
          <div className="bg-white border-4 border-ink brutalist-shadow p-6 sm:p-10 space-y-8">
            <div className="border-b-4 border-ink pb-6 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold uppercase bg-brand text-ink px-2 py-0.5 border border-ink">
                  Stateless Persona Architecture • Step {engineStep} of 4
                </span>
                <h2 className="text-2xl sm:text-4xl font-heading uppercase mt-1">THE PERSON ENGINE SETUP</h2>
              </div>
              <Sliders className="w-8 h-8 text-ink hidden sm:block" />
            </div>

            {/* Step Progress Bar */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((step) => (
                <button
                  key={step}
                  onClick={() => setEngineStep(step)}
                  className={cn("h-3 border-2 border-ink transition-all",
                    step === engineStep ? "bg-brand" : step < engineStep ? "bg-ink" : "bg-bg/40"
                  )}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: VOICE LAYER (SAMPLES ANALYZER) */}
              {engineStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 font-heading text-xl sm:text-2xl uppercase border-b-2 border-ink/10 pb-2">
                    <Upload className="w-6 h-6 text-brand" />
                    <span>Step 1: The Voice Layer & Naming</span>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
                    What did you call them, and how did they actually text? Paste 5-10 real sample text lines below. Our Multi-Provider AI (OpenRouter / Groq) will automatically extract their punctuation habits and baseline tone.
                  </p>

                  <div className="space-y-2">
                    <label className="font-mono text-xs font-bold uppercase">Person Label / Name</label>
                    <Input
                      placeholder="e.g. Him, Her, Alex"
                      value={personLabel}
                      onChange={(e) => setPersonLabel(e.target.value)}
                      className="h-12 text-sm border-3 border-ink bg-bg font-sans max-w-sm"
                    />
                  </div>

                  <div className="border-3 border-ink p-5 bg-bg/40 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="font-mono text-xs font-bold uppercase">Paste Text Samples (One per line)</label>
                      <span className="text-[10px] font-mono text-ink/60">Auto-deleted after extraction</span>
                    </div>

                    <Textarea
                      placeholder="e.g. I just need some space right now.&#10;honestly I didn't mean to hurt you...&#10;can we not talk about this today?&#10;you know I cared about you."
                      value={sampleText}
                      onChange={(e) => setSampleText(e.target.value)}
                      className="min-h-[120px] border-3 border-ink bg-white font-mono text-xs p-4"
                    />

                    <Button
                      className="w-full sm:w-auto h-12 px-6 bg-brand hover:bg-brand/90 text-ink shadow-sm font-bold uppercase text-xs"
                      onClick={handleAnalyzeVoiceSamples}
                      disabled={isAnalyzingVoice || !sampleText.trim()}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isAnalyzingVoice ? "AI Extracting Voice Profile..." : "Analyze Samples with AI"}
                    </Button>
                  </div>

                  {/* Manual Settings Accordion / Grid */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-ink/20">
                    <div className="space-y-1">
                      <label className="font-mono text-[11px] font-bold uppercase">Capitalization Style</label>
                      <Input
                        value={voiceForm.capitalization}
                        onChange={(e) => setVoiceForm({ ...voiceForm, capitalization: e.target.value })}
                        className="h-10 text-xs border-2 border-ink bg-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[11px] font-bold uppercase">Punctuation Habits</label>
                      <Input
                        value={voiceForm.punctuation_habits}
                        onChange={(e) => setVoiceForm({ ...voiceForm, punctuation_habits: e.target.value })}
                        className="h-10 text-xs border-2 border-ink bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      className="h-14 px-8 bg-ink text-bg hover:bg-ink/90 font-bold uppercase text-sm"
                      onClick={() => setEngineStep(2)}
                    >
                      Next: Behavioral Traits <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: BEHAVIORAL TRAITS */}
              {engineStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 font-heading text-xl sm:text-2xl uppercase border-b-2 border-ink/10 pb-2">
                    <BrainCircuit className="w-6 h-6 text-purple" />
                    <span>Step 2: Values & Conflict Behavior</span>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
                    How did they act when things got tense? This ensures the simulation responds accurately when you ask difficult questions.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold uppercase text-ink">Values & Priorities (what mattered most to them)</label>
                      <Input
                        value={traitForm.values}
                        onChange={(e) => setTraitForm({ ...traitForm, values: e.target.value })}
                        className="h-12 text-sm border-3 border-ink bg-bg font-sans p-3"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold uppercase text-ink">Love Language & Affection Style (how they showed care)</label>
                      <Input
                        value={traitForm.love_language}
                        onChange={(e) => setTraitForm({ ...traitForm, love_language: e.target.value })}
                        className="h-12 text-sm border-3 border-ink bg-bg font-sans p-3"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold uppercase text-ink">Conflict Behavior (did they go quiet, get louder, leave, or over-explain?)</label>
                      <Input
                        value={traitForm.conflict_behavior}
                        onChange={(e) => setTraitForm({ ...traitForm, conflict_behavior: e.target.value })}
                        className="h-12 text-sm border-3 border-ink bg-bg font-sans p-3"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="secondary" className="h-14 px-6 text-sm uppercase" onClick={() => setEngineStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button className="h-14 px-8 bg-ink text-bg hover:bg-ink/90 font-bold uppercase text-sm" onClick={() => setEngineStep(3)}>
                      Next: Context & Humor <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: HUMOR & CONTEXT */}
              {engineStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 font-heading text-xl sm:text-2xl uppercase border-b-2 border-ink/10 pb-2">
                    <User className="w-6 h-6 text-brand" />
                    <span>Step 3: Humor & Relationship Context</span>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
                    Add personality quirks and context about how the relationship ended.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold uppercase text-ink">Humor & Personality Quirks (sarcastic, earnest, deadpan)</label>
                      <Input
                        value={traitForm.humor_notes}
                        onChange={(e) => setTraitForm({ ...traitForm, humor_notes: e.target.value })}
                        className="h-12 text-sm border-3 border-ink bg-bg font-sans p-3"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold uppercase text-ink">Relationship Context & Why It Ended</label>
                      <Textarea
                        value={traitForm.relationship_context}
                        onChange={(e) => setTraitForm({ ...traitForm, relationship_context: e.target.value })}
                        className="min-h-[100px] text-sm border-3 border-ink bg-bg font-sans p-3"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="secondary" className="h-14 px-6 text-sm uppercase" onClick={() => setEngineStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button className="h-14 px-8 bg-ink text-bg hover:bg-ink/90 font-bold uppercase text-sm" onClick={() => setEngineStep(4)}>
                      Next: Memory Bank <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: FIRST MEMORIES & REVIEW */}
              {engineStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 font-heading text-xl sm:text-2xl uppercase border-b-2 border-ink/10 pb-2">
                    <Database className="w-6 h-6 text-positive" />
                    <span>Step 4: Add Your First Memory & Activate</span>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
                    The Memory Bank is the depth mechanism. During chat sessions, our vector engine automatically retrieves memories relevant to what you just typed. Add one core memory now (or add more in Tab 3 anytime).
                  </p>

                  <div className="bg-bg p-5 border-3 border-ink space-y-4">
                    <Textarea
                      placeholder="e.g., 'The night we argued in the car because you wouldn't tell me where we stood on moving in together...'"
                      value={newMemContent}
                      onChange={(e) => setNewMemContent(e.target.value)}
                      className="min-h-[80px] border-2 border-ink bg-white font-sans text-sm p-3"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        placeholder="Tags: e.g. moving in, argument, future"
                        value={newMemTags}
                        onChange={(e) => setNewMemTags(e.target.value)}
                        className="h-10 text-xs border-2 border-ink bg-white font-mono"
                      />
                      <select
                        value={newMemWeight}
                        onChange={(e: any) => setNewMemWeight(e.target.value)}
                        className="w-full h-10 border-2 border-ink bg-white font-mono text-xs px-2"
                      >
                        <option value="hurt">💔 Hurt / Painful</option>
                        <option value="fond">✨ Fond / Nostalgic</option>
                        <option value="angry">🔥 Angry / Unresolved</option>
                        <option value="confusing">❓ Confusing / Mixed</option>
                      </select>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        size="sm"
                        className="bg-purple text-ink text-xs font-bold uppercase"
                        onClick={() => {
                          handleAddMemoryEntry();
                          alert("✨ Memory added to your database!");
                        }}
                        disabled={!newMemContent.trim()}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add to Bank Now
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-positive/20 border-3 border-positive flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-positive shrink-0" />
                    <p className="font-mono text-xs leading-relaxed">
                      Your Person Engine for <strong>{personLabel || "Them"}</strong> is ready to activate! Once saved, all settings sync securely to your Supabase cloud database.
                    </p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="secondary" className="h-14 px-6 text-sm uppercase" onClick={() => setEngineStep(3)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                      className="h-16 px-10 text-lg bg-brand hover:bg-brand/90 text-ink shadow-md font-bold uppercase"
                      onClick={handleSaveEngineProfile}
                    >
                      <CheckCircle2 className="w-6 h-6 mr-2" />
                      Save & Activate Person Engine
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* TAB 3: MEMORY BANK */}
      {activeTab === 'memories' && (
        <div className="space-y-6">
          <Button
            variant="secondary"
            onClick={() => setActiveTab('sessions')}
            className="font-mono font-bold text-xs uppercase bg-white border-2 border-ink h-10 px-4 hover:bg-ink hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Talk to Them Hub
          </Button>
          <div className="bg-white border-4 border-ink brutalist-shadow p-6 sm:p-8 space-y-6">
            <div className="border-b-4 border-ink pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold uppercase bg-purple text-ink px-2 py-0.5 border border-ink">
                  Layer 3 & 4: Semantic Depth
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading uppercase mt-1">THE MEMORY BANK ({memories.length})</h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono bg-ink text-bg px-3 py-1.5 border border-ink">
                <Lock className="w-4 h-4 text-brand" />
                <span>Supabase Cloud Sync Enabled</span>
              </div>
            </div>

            <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
              The core depth mechanism. Add specific memories anytime. During your closure sessions, our engine automatically retrieves only the memories most relevant to what you just typed!
            </p>

            {/* Add Memory Box */}
            <div className="bg-bg p-5 border-4 border-ink space-y-4">
              <h3 className="font-heading text-lg uppercase flex items-center gap-2">
                <Plus className="w-5 h-5 text-ink" /> Add New Memory Entry
              </h3>

              <Textarea
                placeholder="Describe the memory or exact words... e.g., 'The night we argued in the kitchen because you promised to come to my family dinner but canceled at the last minute...'"
                value={newMemContent}
                onChange={(e) => setNewMemContent(e.target.value)}
                className="min-h-[90px] border-3 border-ink bg-white font-sans text-sm p-3"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase">Topic Tags (comma-separated)</label>
                  <Input
                    placeholder="e.g. argument, family, broken promise"
                    value={newMemTags}
                    onChange={(e) => setNewMemTags(e.target.value)}
                    className="h-10 text-xs border-2 border-ink bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase">Emotional Weight</label>
                  <select
                    value={newMemWeight}
                    onChange={(e: any) => setNewMemWeight(e.target.value)}
                    className="w-full h-10 border-2 border-ink bg-white font-mono text-xs px-2"
                  >
                    <option value="hurt">💔 Hurt / Painful</option>
                    <option value="fond">✨ Fond / Nostalgic</option>
                    <option value="angry">🔥 Angry / Unresolved</option>
                    <option value="confusing">❓ Confusing / Mixed</option>
                    <option value="neutral">💬 Neutral Context</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  className="h-11 px-6 bg-purple hover:bg-purple/90 text-ink font-bold uppercase text-xs shadow-sm"
                  onClick={handleAddMemoryEntry}
                  disabled={!newMemContent.trim()}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Store in Memory Bank
                </Button>
              </div>
            </div>

            {/* Memories List */}
            <div className="space-y-3 pt-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-ink/70">
                Stored Memories ({memories.length})
              </h4>

              {memories.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-ink/30 font-mono text-xs opacity-60">
                  NO MEMORIES STORED YET. ADD A FEW ABOVE TO INCREASE SIMULATION FIDELITY.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {memories.map((m) => (
                    <div key={m.id} className="p-4 border-3 border-ink bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("px-2 py-0.5 border font-mono font-bold text-[10px] uppercase",
                            m.emotional_weight === 'hurt' && "bg-accent/20 border-accent text-accent",
                            m.emotional_weight === 'fond' && "bg-brand/30 border-ink text-ink",
                            m.emotional_weight === 'angry' && "bg-orange-500/20 border-orange-600 text-orange-700",
                            m.emotional_weight === 'confusing' && "bg-purple/20 border-purple text-ink",
                            m.emotional_weight === 'neutral' && "bg-bg border-ink text-ink/70"
                          )}>
                            {m.emotional_weight}
                          </span>

                          {m.source === 'correction' && (
                            <span className="bg-ink text-bg px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                              ⚡ Feedback Correction
                            </span>
                          )}

                          {m.topic_tags.map((t, idx) => (
                            <span key={idx} className="font-mono text-[10px] bg-bg px-2 py-0.5 border border-ink/40 text-ink/80">
                              #{t}
                            </span>
                          ))}
                        </div>

                        <p className="font-sans text-sm sm:text-base text-ink leading-relaxed pt-1">
                          "{m.content}"
                        </p>
                      </div>

                      <button
                        onClick={() => deleteMemory(m.id)}
                        className="p-2 border-2 border-transparent hover:border-ink hover:bg-bg transition-colors text-ink/40 hover:text-accent self-end sm:self-center shrink-0"
                        title="Delete memory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy Note */}
            <div className="p-4 bg-ink text-bg font-mono text-xs flex items-center gap-3">
              <Lock className="w-6 h-6 text-brand shrink-0" />
              <span>
                <strong>Privacy Guarantee:</strong> The Memory Bank stores specific, detailed personal information indefinitely for your private healing only. This data is protected by Row Level Security in your Supabase cloud database.
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
