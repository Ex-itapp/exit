"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { 
  MessageSquare, AlertTriangle, Send, Sparkles, BrainCircuit, 
  CheckCircle2, RefreshCw, Trash2, 
  Lock, ArrowRight, X, Heart, Plus,
  FileText, Upload, Sliders, ArrowLeft, Settings, ChevronRight, Clock
} from "lucide-react";
import { useClosure, type MemoryBankEntry, type VoiceProfile, type TraitProfile } from "@/lib/useClosure";
import { useDiary } from "@/lib/useDiary";
import { useAuth } from "@/lib/useAuth";
import { usePro } from "@/lib/usePro";
import { ProGateModal } from "@/components/ProGateModal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";

export default function ClosurePage() {
  const router = useRouter();
  const {
    profile, memories, sessions, messages, sessionsUsedCount,
    saveProfile, updateVoiceProfile,
    addMemory, deleteMemory, getActiveSession, createSession, addMessage, endSession,
    retrieveRelevantMemories
  } = useClosure();

  const { addEntry } = useDiary();
  const { user, signInAnonymously, signInWithEmail } = useAuth();

  // Active UI Navigation Tab: 'sessions' | 'engine' | 'memories'
  const [activeTab, setActiveTab] = useState<'sessions' | 'engine' | 'memories'>('sessions');
  const [inChatView, setInChatView] = useState(false);
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);

  // Persona Interactive Onboarding Step: 1 to 4
  const [engineStep, setEngineStep] = useState<number>(1);

  // Chat State
  const activeSession = getActiveSession();
  const allChronologicalMsgs = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
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

  // Persona Intake Form State
  const [sampleText, setSampleText] = useState("");
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [personLabel, setPersonLabel] = useState(profile?.label || "My Ex");
  const [voiceForm, setVoiceForm] = useState<VoiceProfile>(profile?.voice_profile || {
    capitalization: "",
    punctuation_habits: "",
    avg_message_length: "",
    emoji_usage: "",
    common_words_phrases: [],
    tone_baseline: "",
    tone_under_conflict: "",
    tone_when_affectionate: "",
    recurring_topics: [],
    top_verbatim_example_lines: []
  });

  const [traitForm, setTraitForm] = useState<TraitProfile>(profile?.trait_profile || {
    values: "",
    love_language: "",
    conflict_behavior: "",
    humor_notes: "",
    relationship_context: ""
  });

  // Memory Bank New Entry Form State
  const [newMemContent, setNewMemContent] = useState("");
  const [newMemTags, setNewMemTags] = useState("");
  const [newMemWeight, setNewMemWeight] = useState<MemoryBankEntry['emotional_weight']>('hurt');

  const { isPro } = usePro();
  const [showProGate, setShowProGate] = useState<string | null>(null);

  // Auth Email state
  const [authEmail, setAuthEmail] = useState("");
  const [authSent, setAuthSent] = useState(false);

  useEffect(() => {
    if (profile) {
      setPersonLabel(profile.label || "My Ex");
      setVoiceForm(profile.voice_profile);
      setTraitForm(profile.trait_profile);
    }
  }, [profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allChronologicalMsgs.length, isLoading]);

  const handleStartSession = async () => {
    if (!profile) {
      setActiveTab('engine');
      setEngineStep(1);
      return;
    }
    const res = await createSession();
    if (res.error) {
      setTuneToast("Error: " + res.error);
      setTimeout(() => setTuneToast(null), 4000);
    } else {
      setInChatView(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMsg.trim() || isLoading) return;
    if (!isPro) { setShowProGate("AI Closure"); return; }

    let currentSessId = activeSession?.id;
    if (!currentSessId) {
      const res = await createSession();
      if (res.session) {
        currentSessId = res.session.id;
      } else {
        return;
      }
    }

    const userText = inputMsg.trim();
    setInputMsg("");
    await addMessage(currentSessId, 'user', userText);

    setIsLoading(true);
    try {
      const relevantMems = retrieveRelevantMemories(userText, 3);
      const res = await fetch('/api/closure/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
          history: [...allChronologicalMsgs, { role: 'user', content: userText }],
          voiceProfile: profile?.voice_profile || voiceForm,
          traitProfile: profile?.trait_profile || traitForm,
          retrievedMemories: relevantMems
        })
      });

      const data = await res.json();

      if (data.status === 'paused_crisis') {
        await addMessage(currentSessId, 'system_scripted', data.aiReply);
        await endSession(currentSessId, "Paused due to crisis path trigger", 'paused_crisis');
        setIsLoading(false);
        return;
      }

      const aiText = data.aiReply || "I don't know what to say...";
      await addMessage(currentSessId, 'ex_simulation', aiText);

    } catch (err) {
      console.error(err);
      await addMessage(currentSessId, 'ex_simulation', "I just think it's hard to talk about this right now...");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishReflection = async () => {
    if (!activeSession) return;
    if (reflectionText.trim()) {
      await addEntry(
        `[Closure Reflection]\n\n${reflectionText.trim()}`,
        ["Closure Session", "Reflection", "Persona"],
        true
      );
    }
    await endSession(activeSession.id, reflectionText.trim() || "Completed without reflection", 'completed');
    setShowReflectionCard(false);
    setReflectionText("");
    setInChatView(false);
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
    try {
      const res = await fetch('/api/closure/tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiMsg,
          userCorrection: correctionText,
          currentVoice: voiceForm
        })
      });
      const data = await res.json();
      if (data.updatedVoice) {
        setVoiceForm(data.updatedVoice);
        await updateVoiceProfile(data.updatedVoice);
        setTuneToast("✨ We gently analyzed that and attuned their communication rhythm!");
        setTimeout(() => setTuneToast(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setTuneToast("Error updating style profile.");
      setTimeout(() => setTuneToast(null), 4000);
    } finally {
      setIsTuning(false);
      setCorrectingMsgId(null);
      setCorrectionText("");
    }
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
        setTuneToast("✨ We gently analyzed those text samples and attuned the conversation style!");
        setTimeout(() => setTuneToast(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setTuneToast("Error analyzing samples. Using current settings.");
      setTimeout(() => setTuneToast(null), 4000);
    } finally {
      setIsAnalyzingVoice(false);
    }
  };

  const handleSaveEngineProfile = async () => {
    setIsCreatingPersona(true);
    const newProf = {
      id: profile?.id || crypto.randomUUID(),
      label: personLabel || "Them",
      voice_profile: voiceForm,
      trait_profile: traitForm,
      created_at: profile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await saveProfile(newProf);
    setTimeout(() => {
      setIsCreatingPersona(false);
      setActiveTab('sessions');
      setInChatView(false);
      setTuneToast("✨ Persona profile attuned and ready!");
      setTimeout(() => setTuneToast(null), 4000);
    }, 2800);
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
      setTuneToast("Auth Error: " + error.message);
      setTimeout(() => setTuneToast(null), 4000);
    } else {
      setAuthSent(true);
    }
  };



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
        <div className="flex items-start sm:items-center gap-4">
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={() => router.push('/')}
            className="rounded-full w-12 h-12 brutalist-shadow-sm border-2 border-ink shrink-0 mt-1 sm:mt-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
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
              A gentle, private space to express what was left unsaid and find closure.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          <div className="p-3 bg-white border-4 border-ink brutalist-shadow-sm flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-brand shrink-0" />
            <div>
              <div className="font-mono text-[10px] font-bold uppercase opacity-70">Total Conversations</div>
              <div className="font-heading text-lg leading-none uppercase">
                {sessionsUsedCount} Completed
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
              <h4 className="font-heading uppercase text-sm">Enable Secure Cloud Backup</h4>
              <p className="font-mono text-[11px] text-ink/70">
                Log in to securely save and sync your persona profile, memories, and conversations across devices.
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
                <h2 className="text-3xl font-heading uppercase tracking-tight">Persona Profile Not Set Up Yet</h2>
                <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
                  Before you can start a conversation, let's set up a gentle profile so the space understands their exact tone, words, and communication boundaries.
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <Button 
                  className="h-14 px-8 text-lg bg-brand hover:bg-brand/90 text-ink shadow-md font-bold uppercase"
                  onClick={() => { setActiveTab('engine'); setEngineStep(1); }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Set Up Their Persona Profile
                </Button>
              </div>
            </Card>
          ) : !inChatView ? (
            /* INSTAGRAM DM STYLE INBOX */
            <div className="space-y-8 animate-in fade-in">
              {/* Top Action Header */}
              <div className="bg-white border-4 border-ink brutalist-shadow p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold uppercase bg-brand text-ink px-2.5 py-1 border border-ink">
                    Unsent Conversations
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-heading uppercase tracking-tight mt-1">TALK TO THEM</h2>
                  <p className="font-sans text-sm sm:text-base text-ink/80 mt-0.5">
                    A gentle, private space to express what was left unsaid and find closure.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    className="h-11 px-4 text-xs font-bold uppercase bg-bg border-2 border-ink hover:bg-ink hover:text-white transition-all flex items-center gap-2"
                    onClick={() => setActiveTab('memories')}
                  >
                    <BrainCircuit className="w-4 h-4 text-brand" />
                    <span>Memory Bank ({memories.length})</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="icon"
                    className="w-11 h-11 rounded-none border-2 border-ink bg-white hover:bg-brand transition-all flex items-center justify-center shrink-0"
                    onClick={() => { setActiveTab('engine'); setEngineStep(1); }}
                    title="Alter Persona Settings or Reset"
                  >
                    <Settings className="w-5 h-5 text-ink" />
                  </Button>
                </div>
              </div>

              {/* Singular DM Card (Instagram Style) */}
              <div className="space-y-2">
                <div className="font-mono text-xs font-bold uppercase text-ink/70 tracking-wider px-1">
                  Your Private Message Thread
                </div>

                <div
                  onClick={handleStartSession}
                  className="group bg-white border-4 border-ink brutalist-shadow p-5 sm:p-6 hover:translate-x-1 hover:-translate-y-1 hover:bg-brand/10 transition-all duration-200 cursor-pointer flex items-center gap-4 sm:gap-6"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 border-ink bg-purple/30 flex items-center justify-center font-heading text-2xl sm:text-3xl uppercase text-ink shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    {profile?.label?.[0]?.toUpperCase() || "T"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-lg sm:text-2xl uppercase text-ink tracking-tight truncate">
                          {profile?.label || "Them"}
                        </h3>
                        <span className="text-[10px] font-mono uppercase bg-ink/10 px-2 py-0.5 border border-ink/20 text-ink shrink-0 hidden sm:inline-block">
                          Private DM
                        </span>
                      </div>
                      {allChronologicalMsgs.length > 0 && (
                        <span className="font-mono text-[10px] sm:text-xs text-ink/50 shrink-0">
                          {new Date(allChronologicalMsgs[allChronologicalMsgs.length - 1].created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      {allChronologicalMsgs.length > 0 ? (
                        <p className="font-sans text-sm sm:text-base text-ink/80 truncate font-medium">
                          <strong className="font-bold text-ink/90">
                            {allChronologicalMsgs[allChronologicalMsgs.length - 1].role === 'user' ? 'You: ' : `${profile?.label || 'Them'}: `}
                          </strong>
                          {allChronologicalMsgs[allChronologicalMsgs.length - 1].content}
                        </p>
                      ) : (
                        <p className="font-sans text-sm sm:text-base text-ink/60 italic truncate">
                          Tap to open message thread and start conversation...
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="w-10 h-10 border-2 border-ink bg-bg flex items-center justify-center shrink-0 group-hover:bg-ink group-hover:text-white transition-colors">
                    <ChevronRight className="w-6 h-6 text-ink group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>

              {/* Reflections Section Below */}
              <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between border-b-3 border-ink pb-3">
                  <h3 className="text-xl sm:text-2xl font-heading uppercase tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-brand" /> Your Reflections & Insights
                  </h3>
                  <span className="font-mono text-xs bg-ink/10 px-2.5 py-1 border border-ink/20">
                    {sessions.filter(s => s.reflection_response && s.reflection_response !== "Completed without reflection" && s.reflection_response !== "User exited to hub").length} Recorded
                  </span>
                </div>

                {sessions.filter(s => s.reflection_response && s.reflection_response !== "Completed without reflection" && s.reflection_response !== "User exited to hub").length === 0 ? (
                  <div className="text-center py-12 px-6 border-4 border-dashed border-ink/20 bg-white/50 space-y-2">
                    <p className="font-heading text-lg text-ink/70 uppercase">No Reflections Recorded Yet</p>
                    <p className="font-sans text-sm text-ink/60 max-w-md mx-auto">
                      When you complete a conversation session and write a reflection, your healing insights and reflections will be saved here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessions.filter(s => s.reflection_response && s.reflection_response !== "Completed without reflection" && s.reflection_response !== "User exited to hub").map((s) => (
                      <Card key={s.id} className="border-3 border-ink p-5 bg-white brutalist-shadow-sm space-y-3">
                        <div className="flex justify-between items-center border-b-2 border-ink/15 pb-2 font-mono text-xs">
                          <span className="font-bold uppercase text-ink/80 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-brand" />
                            {new Date(s.started_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="px-2 py-0.5 border font-bold uppercase text-[10px] bg-positive/20 border-positive text-ink">
                            Reflection
                          </span>
                        </div>

                        <div className="bg-bg/60 p-3.5 border-2 border-ink/20">
                          <p className="font-sans text-xs sm:text-sm leading-relaxed italic text-ink/90">
                            "{s.reflection_response}"
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ACTIVE CHAT SCREEN */
            <div className="fixed inset-0 z-50 bg-bg flex flex-col w-full h-full overflow-hidden">
              
              {/* Minimal Clean Chat Header */}
              <div className="bg-white border-b-3 border-ink px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setInChatView(false)}
                    className="p-1.5 hover:bg-ink/10 transition-colors flex items-center gap-1 font-sans font-bold text-sm text-ink"
                    title="Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full border-2 border-ink bg-purple/30 flex items-center justify-center font-heading text-sm uppercase text-ink shrink-0">
                      {profile.label?.[0]?.toUpperCase() || "T"}
                    </div>
                    <h3 className="font-heading text-lg sm:text-xl uppercase text-ink leading-none">
                      {profile.label}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 bg-bg custom-scrollbar max-w-4xl mx-auto w-full">
                {allChronologicalMsgs.length === 0 ? (
                  <div className="text-center py-16 px-6 max-w-md mx-auto space-y-3">
                    <div className="w-16 h-16 rounded-full bg-brand/20 border-3 border-ink flex items-center justify-center mx-auto">
                      <MessageSquare className="w-8 h-8 text-ink" />
                    </div>
                    <h4 className="font-heading text-lg uppercase text-ink">Your Thread Is Ready</h4>
                    <p className="font-sans text-sm text-ink/70">
                      Say whatever you've been holding back. Everything you write and receive here is permanently saved in your confidential thread.
                    </p>
                  </div>
                ) : (
                  allChronologicalMsgs.map((m) => {
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
                  })
                )}

                {isLoading && (
                  <div className="flex items-center gap-2 text-ink/60 font-mono text-xs p-3 bg-white/60 border-2 border-ink/40 w-fit">
                    <Sparkles className="w-4 h-4 animate-spin text-brand" />
                    <span>Simulating voice via multi-provider router...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-2 sm:p-4 bg-white border-t-4 border-ink flex gap-2 sm:gap-3 shrink-0 max-w-4xl mx-auto w-full shadow-lg">
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
                  className="min-h-[44px] sm:min-h-[50px] max-h-[100px] border-3 border-ink font-sans text-xs sm:text-base p-2 sm:p-3 resize-y"
                />
                <Button 
                  className="h-auto px-4 sm:px-6 bg-brand hover:bg-brand/90 text-ink border-3 border-ink shrink-0 shadow-md"
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMsg.trim()}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
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
                        placeholder="Write your reflection here... We will automatically save this into your Diary and recovery space."
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
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Persona
            </Button>
          )}

          {isCreatingPersona ? (
            <motion.div
              key="creating-animation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-4 border-ink brutalist-shadow py-16 px-6 text-center space-y-8 max-w-2xl mx-auto my-6"
            >
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-brand/30 rounded-full animate-ping" />
                <div className="relative w-24 h-24 bg-ink text-bg rounded-full border-4 border-brand flex items-center justify-center shadow-lg">
                  <Sparkles className="w-12 h-12 text-brand animate-spin" style={{ animationDuration: '6s' }} />
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-3">
                <span className="font-mono text-xs font-bold uppercase bg-brand text-ink px-3 py-1 border border-ink">
                  Attuning Connection
                </span>
                <h3 className="text-2xl sm:text-3xl font-heading uppercase tracking-tight">
                  PRESERVING PERSONA PROFILE...
                </h3>
                <p className="font-sans text-sm sm:text-base text-ink/75 leading-relaxed">
                  We are gently weaving together their tone, habits, and emotional boundaries so your space feels authentic and safe.
                </p>
              </div>

              {/* Animated progress bar */}
              <div className="w-full max-w-xs mx-auto space-y-2">
                <div className="h-4 bg-bg border-3 border-ink overflow-hidden p-0.5">
                  <motion.div
                    className="h-full bg-brand"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.6, ease: "easeInOut" }}
                  />
                </div>
                <div className="font-mono text-[10px] text-ink/60 uppercase animate-pulse">
                  Securing private memory vault...
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white border-4 border-ink brutalist-shadow p-6 sm:p-10 space-y-8">
              <div className="border-b-4 border-ink pb-6 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold uppercase bg-brand text-ink px-2 py-0.5 border border-ink">
                    Persona Profile Setup • Step {engineStep} of 4
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-heading uppercase mt-1">PERSONA PROFILE SETUP</h2>
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

              {/* STEP 1: COMMUNICATION STYLE & NAMING */}
              {engineStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center gap-2 font-heading text-xl sm:text-2xl uppercase border-b-2 border-ink/10 pb-2">
                    <Upload className="w-6 h-6 text-brand" />
                    <span>Step 1: Communication Style & Naming</span>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
                    To make this space feel authentic and familiar, you can paste examples of their past messages or writing style. We will gently analyze their tone and patterns without keeping the raw text.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-mono text-xs font-bold uppercase block">Their Name or Initials</label>
                      <Input
                        value={personLabel}
                        onChange={(e) => setPersonLabel(e.target.value)}
                        placeholder="e.g. Dad, S, Former Partner"
                        className="h-12 border-3 border-ink text-base bg-white font-sans font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono text-xs font-bold uppercase block">Paste Past Message Examples (Optional)</label>
                      <div className="flex gap-2">
                        <Textarea
                          value={sampleText}
                          onChange={(e) => setSampleText(e.target.value)}
                          placeholder="Paste a few old texts, emails, or messages here..."
                          className="min-h-[80px] border-3 border-ink text-xs p-2 bg-white font-mono"
                        />
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full bg-ink text-bg hover:bg-brand hover:text-ink transition-all font-mono text-xs uppercase"
                        onClick={handleAnalyzeVoiceSamples}
                        disabled={isAnalyzingVoice || !sampleText.trim()}
                      >
                        {isAnalyzingVoice ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1 text-brand" />}
                        {isAnalyzingVoice ? "Analyzing Style..." : "Analyze & Extract Communication Style"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t-2 border-ink/20">
                    <h4 className="font-heading text-lg uppercase">Style Profile Settings</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] font-bold uppercase opacity-70">Capitalization Habits</label>
                        <Input
                          value={voiceForm.capitalization}
                          onChange={(e) => setVoiceForm({ ...voiceForm, capitalization: e.target.value })}
                          placeholder="e.g. all lowercase, proper grammar, random CAPS"
                          className="h-10 text-xs border-2 border-ink bg-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] font-bold uppercase opacity-70">Punctuation & Emojis</label>
                        <Input
                          value={voiceForm.punctuation_habits}
                          onChange={(e) => setVoiceForm({ ...voiceForm, punctuation_habits: e.target.value })}
                          placeholder="e.g. lots of ellipses..., exclamation marks, no periods"
                          className="h-10 text-xs border-2 border-ink bg-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] font-bold uppercase opacity-70">Average Message Length</label>
                        <Input
                          value={voiceForm.avg_message_length}
                          onChange={(e) => setVoiceForm({ ...voiceForm, avg_message_length: e.target.value })}
                          placeholder="e.g. short 1-line replies, long paragraphs"
                          className="h-10 text-xs border-2 border-ink bg-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] font-bold uppercase opacity-70">Common Words or Phrases</label>
                        <Input
                          value={voiceForm.common_words_phrases.join(', ')}
                          onChange={(e) => setVoiceForm({ ...voiceForm, common_words_phrases: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          placeholder="e.g. honestly, whatever, take care, tbh"
                          className="h-10 text-xs border-2 border-ink bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button className="h-14 px-8 bg-brand hover:bg-brand/90 text-ink shadow-md font-bold uppercase" onClick={() => setEngineStep(2)}>
                      Next Step: Tone & Behavior <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: EMOTIONAL TONE & CONFLICT BEHAVIOR */}
              {engineStep === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center gap-2 font-heading text-xl sm:text-2xl uppercase border-b-2 border-ink/10 pb-2">
                    <Sliders className="w-6 h-6 text-brand" />
                    <span>Step 2: Emotional Tone & Conflict Behavior</span>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
                    How did they express affection, and how did they react when conversations became difficult or emotional?
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold uppercase block">Everyday Tone</label>
                      <Textarea
                        value={voiceForm.tone_baseline}
                        onChange={(e) => setVoiceForm({ ...voiceForm, tone_baseline: e.target.value })}
                        placeholder="e.g. Casual, warm, slightly distant, practical, intellectual..."
                        className="min-h-[70px] border-3 border-ink text-sm p-3 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold uppercase block">When Affectionate or Kind</label>
                      <Textarea
                        value={voiceForm.tone_when_affectionate}
                        onChange={(e) => setVoiceForm({ ...voiceForm, tone_when_affectionate: e.target.value })}
                        placeholder="e.g. Uses nicknames, sends supportive reminders, very gentle..."
                        className="min-h-[70px] border-3 border-ink text-sm p-3 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold uppercase block">Under Conflict or Emotional Stress</label>
                      <Textarea
                        value={voiceForm.tone_under_conflict}
                        onChange={(e) => setVoiceForm({ ...voiceForm, tone_under_conflict: e.target.value })}
                        placeholder="e.g. Withdraws into silence, gets defensive, over-explains logically, changes the subject..."
                        className="min-h-[70px] border-3 border-ink text-sm p-3 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="secondary" className="h-14 px-6 text-sm uppercase" onClick={() => setEngineStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button className="h-14 px-8 bg-brand hover:bg-brand/90 text-ink shadow-md font-bold uppercase" onClick={() => setEngineStep(3)}>
                      Next Step: Relationship Dynamics <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: RELATIONSHIP DYNAMICS */}
              {engineStep === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center gap-2 font-heading text-xl sm:text-2xl uppercase border-b-2 border-ink/10 pb-2">
                    <Heart className="w-6 h-6 text-brand" />
                    <span>Step 3: Relationship Dynamics</span>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
                    Sharing a little context helps the conversation space understand the unspoken bond and emotional boundaries between you.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold uppercase block">Who were they to you?</label>
                      <Input
                        value={traitForm.relationship_context}
                        onChange={(e) => setTraitForm({ ...traitForm, relationship_context: e.target.value })}
                        placeholder="e.g. My older brother, my college best friend, my parent..."
                        className="h-12 border-3 border-ink text-sm bg-white font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold uppercase block">What mattered most to them?</label>
                      <Textarea
                        value={traitForm.values}
                        onChange={(e) => setTraitForm({ ...traitForm, values: e.target.value })}
                        placeholder="e.g. Honesty, hard work, family tradition, personal independence..."
                        className="min-h-[70px] border-3 border-ink text-sm p-3 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold uppercase block">Shared Humor or Jokes</label>
                      <Textarea
                        value={traitForm.humor_notes}
                        onChange={(e) => setTraitForm({ ...traitForm, humor_notes: e.target.value })}
                        placeholder="e.g. Dry sarcastic wit, dad jokes, self-deprecating humor..."
                        className="min-h-[70px] border-3 border-ink text-sm p-3 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="secondary" className="h-14 px-6 text-sm uppercase" onClick={() => setEngineStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button className="h-14 px-8 bg-brand hover:bg-brand/90 text-ink shadow-md font-bold uppercase" onClick={() => setEngineStep(4)}>
                      Next Step: Memory Vault <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: ADD KEY MEMORIES */}
              {engineStep === 4 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center gap-2 font-heading text-xl sm:text-2xl uppercase border-b-2 border-ink/10 pb-2">
                    <BrainCircuit className="w-6 h-6 text-positive" />
                    <span>Step 4: Add A Key Memory</span>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
                    You can add a specific memory, phrase, or topic that you might bring up. When you mention this during your conversation, they will remember and respond with awareness.
                  </p>

                  <div className="p-4 bg-bg border-3 border-ink space-y-4">
                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold uppercase block">Memory or Unsaid Thought</label>
                      <Textarea
                        placeholder="e.g. Remember that rainy afternoon when we finally talked about moving to New York..."
                        value={newMemContent}
                        onChange={(e) => setNewMemContent(e.target.value)}
                        className="min-h-[80px] border-2 border-ink bg-white text-sm p-3"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        onClick={handleAddMemoryEntry}
                        disabled={!newMemContent.trim()}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Save Memory Now
                      </Button>
                    </div>
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
                      Save & Activate Profile
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEMORY BANK */}
      {activeTab === 'memories' && (
        <div className="space-y-6 animate-in fade-in">
          {profile && (
            <Button
              variant="secondary"
              onClick={() => setActiveTab('sessions')}
              className="font-mono font-bold text-xs uppercase bg-white border-2 border-ink h-10 px-4 hover:bg-ink hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Persona
            </Button>
          )}
          <div className="bg-white border-4 border-ink brutalist-shadow p-6 sm:p-10 space-y-8">
            <div className="border-b-4 border-ink pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase bg-brand text-ink px-2 py-0.5 border border-ink">
                  Personal History & Depth
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading uppercase mt-1">THE MEMORY BANK ({memories.length})</h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono bg-ink text-bg px-3 py-1.5 border border-ink">
                <Lock className="w-4 h-4 text-brand" />
                <span>Secure Backup Enabled</span>
              </div>
            </div>

            <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed">
              Add specific memories anytime. During your conversations, this space automatically remembers only the moments most relevant to what you just typed!
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
                  NO MEMORIES STORED YET. ADD A FEW ABOVE TO IMPROVE CHAT ACCURACY.
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
                <strong>Privacy Guarantee:</strong> The Memory Bank stores specific, detailed personal information indefinitely for your private healing only. This data is protected and encrypted in your private account storage.
              </span>
            </div>
          </div>
        </div>
      )}

      {showProGate && <ProGateModal feature={showProGate} onClose={() => setShowProGate(null)} />}

    </div>
  );
}
