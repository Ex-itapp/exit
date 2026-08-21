"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useDiary } from "@/lib/useDiary";
import { useFlags } from "@/lib/useFlags";
import { useCheckins } from "@/lib/useCheckins";
import { usePro } from "@/lib/usePro";
import { useUser } from '@/lib/useUser';
import { ProGateModal } from "@/components/ProGateModal";
import { ArrowLeft, Sparkles, MessageSquare, Send, BookOpen, Flag, Zap } from "lucide-react";
import { triggerPWAActivity } from "@/lib/usePWAInstall";
import { motion } from "framer-motion";

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function TherapistPage() {
  const navigate = useRouter();
  const { isPro } = usePro();
  const [showProGate, setShowProGate] = useState<string | null>(null);
  const { entries } = useDiary();
  const { flags } = useFlags();
  const { checkins } = useCheckins();
  const { userGoal, userName, streakDays } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const startAnalysisMode = async () => {
    setIsLoading(true);
    
    // Build context
    const recentEntries = entries.slice(0, 5).map((e, i) => 
      `${i + 1}. [${e.moods.join(', ')}] ${e.content.substring(0, 150)}${e.content.length > 150 ? '...' : ''}`
    ).join('\n');

    const recentFlags = flags
      .filter(f => (new Date().getTime() - new Date(f.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000)
      .map(f => f.category)
      .join(', ') || 'none logged';

    const recentCheckins = checkins.slice(0, 3).map((c, i) => 
      `${i + 1}. ${c.content.substring(0, 100)}`
    ).join('\n');

    const initialSystemInstruction = `You are a deeply empathetic, very human-sounding companion analyzing the user's recent history to kick off a text conversation. 

About the user:
- Name: ${userName || 'Friend'}
- On Day ${streakDays} of no contact
- Their primary healing focus: "${userGoal}"

ADAPT YOUR PERSONALITY based on their healing focus:
- If "Breaking the urge to reach out": Be a tough-love accountability partner. Be direct, motivating, slightly sarcastic. Celebrate their streak hard. If they mention wanting to text their ex, be firm but loving.
- If "Rebuilding my self-esteem": Be their biggest hype person. Gas them up constantly. Remind them of their worth. Focus on growth and self-love.
- If "Processing heartbreak & grief": Be gentle, patient, validating. Let them vent. Don't rush them. Acknowledge the pain is real.
- If "Finding peace and clarity": Be reflective and thoughtful. Ask probing questions. Help them see patterns. Guide them toward insight.

Here is their recent data:
Diary Entries:
${recentEntries || 'none'}

Recent Red Flags: ${recentFlags}

Recent Check-ins:
${recentCheckins || 'none'}

Your first message should NOT be a robotic summary. Instead, casually bring up a pattern you noticed in a warm, comforting way (1-3 sentences max). Don't sound like a therapist giving a diagnosis, just sound like a friend checking in.`;

    const initialUserMessage = "Please analyze my recent history and start our conversation.";
    
    // Send a silent initial payload to get the first response
    const payloadMessages: Message[] = [
      { role: 'user', parts: [{ text: initialUserMessage }] }
    ];

    try {
      const res = await fetch('/api/therapist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages, systemInstruction: initialSystemInstruction })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.crisisPathTriggered) {
        setIsCrisis(true);
      }

      setMessages([
        { role: 'model', parts: [{ text: data.aiReply }] }
      ]);
    } catch (error: any) {
      console.error(error);
      setErrorBanner(`We couldn't connect right now: ${error.message}`);
      setTimeout(() => setErrorBanner(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const startPresetChat = async (presetMessage: string) => {
    setIsLoading(true);
    
    // Add user message to UI immediately
    const userMessage: Message = { role: 'user', parts: [{ text: presetMessage }] };
    const initialMessages = [userMessage];
    setMessages(initialMessages);

    try {
      const res = await fetch('/api/therapist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: initialMessages, userGoal })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.crisisPathTriggered) {
        setIsCrisis(true);
      }

      setMessages([
        userMessage,
        { role: 'model', parts: [{ text: data.aiReply }] }
      ]);
    } catch (error: any) {
      console.error(error);
      setErrorBanner(`We couldn't connect right now: ${error.message}`);
      setTimeout(() => setErrorBanner(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || isCrisis) return;
    if (!isPro) { setShowProGate("Healing Companion"); return; }
    
    const userMessage: Message = { role: 'user', parts: [{ text: inputText }] };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/therapist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, userGoal })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.crisisPathTriggered) {
        setIsCrisis(true);
      }

      setMessages([...updatedMessages, { role: 'model', parts: [{ text: data.aiReply }] }]);
      // Trigger PWA install prompt after first chat message
      triggerPWAActivity();
    } catch (error: any) {
      console.error(error);
      setErrorBanner(`We couldn't reach your companion right now: ${error.message}`);
      setTimeout(() => setErrorBanner(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-bg fixed inset-0 z-[100] animate-in fade-in pb-safe">
      {/* HEADER */}
      <div className="flex items-center gap-4 shrink-0 p-3 sm:p-4 border-b-2 border-ink/10">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={() => navigate.push('/')}
          className="rounded-full w-12 h-12 brutalist-shadow-sm border-2 border-ink"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="font-heading tracking-tighter text-2xl sm:text-3xl md:text-4xl uppercase">Healing Companion</h1>
      </div>

      {errorBanner && (
        <div className="bg-danger text-white border-2 border-ink brutalist-shadow-sm p-2 sm:p-3 m-2 sm:m-4 font-mono text-[10px] sm:text-xs uppercase font-bold animate-in fade-in shrink-0">
          ⚠️ {errorBanner}
        </div>
      )}

      {/* CHAT MODE */}
      <div className="flex-1 flex flex-col bg-bg min-h-0 relative overflow-hidden">
        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth flex flex-col">
          {messages.length === 0 && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-50">
               <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center border-2 border-ink brutalist-shadow-sm">
                  <Sparkles className="w-8 h-8 text-ink" />
               </div>
               <p className="font-mono text-xs uppercase font-bold text-center max-w-xs">Your healing companion is ready. Send a message to start, or pick a prompt below.</p>
            </div>
          )}

          {messages.map((msg, i) => {
              const lowerText = msg.parts[0].text.toLowerCase();
              const isModel = msg.role === 'model';
              const showDiary = isModel && lowerText.includes('diary');
              const showFlags = isModel && (lowerText.includes('red flag') || lowerText.includes('flag'));
              const showStreak = isModel && lowerText.includes('streak');
              const hasActions = showDiary || showFlags || showStreak;

              return (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-4 border-2 border-ink brutalist-shadow-sm ${
                      msg.role === 'user' ? 'bg-ink text-bg' : 'bg-brand text-ink'
                    }`}
                  >
                    {msg.role === 'model' && <p className="font-mono text-xs opacity-50 uppercase font-bold mb-2">Your Companion</p>}
                    <div className="font-sans text-[15px] leading-relaxed whitespace-pre-wrap">
                      {msg.parts[0].text}
                    </div>

                    {hasActions && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t-2 border-ink/20">
                        {showDiary && (
                          <Button onClick={() => navigate.push('/diary')} size="sm" variant="secondary" className="brutalist-shadow-sm border-2 border-ink text-xs h-8 bg-white hover:bg-white/90 text-ink">
                            <BookOpen className="w-3 h-3 mr-1" /> Open Diary
                          </Button>
                        )}
                        {showFlags && (
                          <Button onClick={() => navigate.push('/flags')} size="sm" variant="secondary" className="brutalist-shadow-sm border-2 border-ink text-xs h-8 bg-white hover:bg-white/90 text-ink">
                            <Flag className="w-3 h-3 mr-1" /> Log Red Flag
                          </Button>
                        )}
                        {showStreak && (
                          <Button onClick={() => navigate.push('/streak')} size="sm" variant="secondary" className="brutalist-shadow-sm border-2 border-ink text-xs h-8 bg-white hover:bg-white/90 text-ink">
                            <Zap className="w-3 h-3 mr-1" /> View Streak
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-brand text-ink max-w-[85%] p-4 border-2 border-ink brutalist-shadow-sm">
                  <div className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Start Pills (Wrapped for mobile) */}
          {messages.length === 0 && !isLoading && !isCrisis && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full py-3 px-3 sm:px-4 shrink-0 border-t-2 border-ink/10 bg-white/40"
            >
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={startAnalysisMode}
                  className="rounded-full px-4 py-2 h-auto brutalist-shadow-sm bg-brand text-ink hover:bg-brand/90 border-2 border-ink transition-transform hover:-translate-y-1"
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" />
                  <span className="font-mono text-[10px] sm:text-[11px] uppercase font-bold text-left leading-tight">Analyze my past week</span>
                </Button>
                <Button 
                  onClick={() => startPresetChat("I'm feeling an intense urge to reach out right now.")}
                  className="rounded-full px-4 py-2 h-auto brutalist-shadow-sm bg-white text-ink hover:bg-ink/5 border-2 border-ink transition-transform hover:-translate-y-1"
                >
                  <Flag className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0 text-danger" />
                  <span className="font-mono text-[10px] sm:text-[11px] uppercase font-bold text-left leading-tight">I want to text them</span>
                </Button>
                <Button 
                  onClick={() => startPresetChat("I just need to vent and talk about something else.")}
                  className="rounded-full px-4 py-2 h-auto brutalist-shadow-sm bg-white text-ink hover:bg-ink/5 border-2 border-ink transition-transform hover:-translate-y-1"
                >
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" />
                  <span className="font-mono text-[10px] sm:text-[11px] uppercase font-bold text-left leading-tight">I need a distraction</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Chat Input */}
          {!isCrisis && (
            <div className="shrink-0 p-3 sm:p-4 bg-white border-t-2 border-ink flex gap-2 sm:gap-4 items-end">
              <Textarea 
                placeholder="Type your message..." 
                className="flex-1 min-h-[48px] max-h-[120px] resize-none border-2 border-ink text-sm sm:text-base p-3 rounded-2xl bg-bg"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <Button 
                className="h-12 w-12 rounded-full shrink-0 brutalist-shadow-sm border-2 border-ink bg-blue hover:bg-blue/90 text-ink flex items-center justify-center p-0 transition-transform hover:scale-105 active:scale-95"
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Send className="w-5 h-5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      {showProGate && <ProGateModal feature={showProGate} onClose={() => setShowProGate(null)} />}
    </div>
  );
}
