"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDiary } from "@/lib/useDiary";
import { useFlags } from "@/lib/useFlags";
import { useCheckins } from "@/lib/useCheckins";
import { usePro } from "@/lib/usePro";
import { useUser } from "@/lib/useUser";
import { useTheme } from "@/lib/useTheme";
import { ProGateModal } from "@/components/ProGateModal";
import { triggerPWAActivity } from "@/lib/usePWAInstall";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { QuickActions } from "@/components/chat/QuickActions";
import { CompanionSettings } from "@/components/chat/CompanionSettings";
import { BrandWatermark } from "@/components/chat/BrandWatermark";

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const TherapistPage = () => {
  const router = useRouter();
  const { entries } = useDiary();
  const { flags } = useFlags();
  const { checkins } = useCheckins();
  const { isPro } = usePro();
  const { goal } = useUser();
  const { theme, changeTheme, tone, changeTone, isLoaded } = useTheme('companion');

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProGate, setShowProGate] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load local history on mount
  useEffect(() => {
    const saved = localStorage.getItem('unsent_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Save local history on update
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('unsent_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Lock behind Pro
  useEffect(() => {
    if (isPro === false) {
      setShowProGate("companion_chat");
    }
  }, [isPro]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const startAnalysisMode = async () => {
    if (!isPro) return;

    setIsLoading(true);
    setErrorBanner(null);

    const context = `Diary entries: ${JSON.stringify(entries)}\nFlags: ${JSON.stringify(flags)}\nCheckins: ${JSON.stringify(checkins)}`;
    const systemInstruction = `Analyze the user's data and provide helpful insights based on their goal: ${goal || "healing"}. Use the following context:\n${context}`;

    try {
      const res = await fetch("/api/therapist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: 'user', parts: [{ text: "Analyze my recent activity." }] }],
          systemInstruction,
          userGoal: goal,
          tone
        }),
      });

      if (!res.ok) throw new Error("Failed to get analysis");

      const data = await res.json();
      
      if (data.crisisPathTriggered) {
        setIsCrisis(true);
      }

      setMessages((prev) => [
        ...prev,
        { role: 'model', parts: [{ text: data.aiReply }] }
      ]);
      triggerPWAActivity();
    } catch (err) {
      setErrorBanner("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startPresetChat = async (prompt: string) => {
    if (!isPro) return;

    setIsLoading(true);
    setErrorBanner(null);
    setMessages([{ role: 'user', parts: [{ text: prompt }] }]);

    try {
      const res = await fetch("/api/therapist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: 'user', parts: [{ text: prompt }] }],
          userGoal: goal,
          tone
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();

      if (data.crisisPathTriggered) {
        setIsCrisis(true);
      }

      setMessages((prev) => [
        ...prev,
        { role: 'model', parts: [{ text: data.aiReply }] }
      ]);
      triggerPWAActivity();
    } catch (err) {
      setErrorBanner("Failed to connect. Please try again.");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !isPro) return;

    const newMessage: Message = { role: 'user', parts: [{ text: inputText.trim() }] };
    const updatedMessages = [...messages, newMessage];
    
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);
    setErrorBanner(null);

    try {
      const res = await fetch("/api/therapist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          userGoal: goal,
          tone: tone,
        })
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();

      if (data.crisisPathTriggered) {
        setIsCrisis(true);
      }

      setMessages((prev) => [
        ...prev,
        { role: 'model', parts: [{ text: data.aiReply }] }
      ]);
      triggerPWAActivity();
    } catch (err) {
      setErrorBanner("Failed to send message. Please try again.");
      setMessages(messages); // Revert
      setInputText(newMessage.parts[0].text); // Restore input
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className={cn("flex flex-col h-[100dvh] w-full fixed inset-0 z-[100] bg-bg text-ink transition-colors duration-300 pb-safe", theme)}>
      <ChatHeader 
        mood="companion"
        onBack={() => router.back()}
        onOpenSettings={() => setShowSettings(true)}
        isScreenshotMode={isScreenshotMode}
      />
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="flex-1 h-full flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-brand/10 rounded-none border border-brand/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-brand/70" />
            </div>
            <p className="font-sans text-sm text-ink/50 text-center max-w-xs">
              Your companion is here. Start a conversation or pick a prompt below.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble 
              key={i}
              message={msg}
              mood="companion"
              isScreenshotMode={isScreenshotMode}
            />
          ))
        )}
        
        {isLoading && <TypingIndicator mood="companion" />}
      </div>
      
      {messages.length === 0 && !isLoading && !isScreenshotMode && !isCrisis && (
        <div className="px-4 pb-2 w-full max-w-3xl mx-auto">
          <QuickActions 
            onSelect={startPresetChat}
            visible={true}
          />
        </div>
      )}
      
      {!isScreenshotMode && !isCrisis && (
        <div className="shrink-0 p-4 pb-6 sm:pb-8 max-w-3xl mx-auto w-full">
          <ChatInput 
            value={inputText}
            onChange={setInputText}
            onSend={sendMessage}
            disabled={isLoading}
            placeholder="Message Companion..."
          />
        </div>
      )}
      
      {isScreenshotMode && <BrandWatermark />}
      
      <CompanionSettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        onChangeTheme={changeTheme}
        tone={tone}
        onChangeTone={changeTone}
        isScreenshotMode={isScreenshotMode}
        onToggleScreenshotMode={() => setIsScreenshotMode(!isScreenshotMode)}
        onClearChat={() => setMessages([])}
      />
      
      {showProGate && (
        <ProGateModal 
          isOpen={true}
          onClose={() => router.push('/dashboard')}
          feature={showProGate}
        />
      )}

      {isCrisis && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-bg border-2 border-destructive/60 p-8 max-w-md w-full shadow-lg space-y-6">
            <h2 className="font-heading text-2xl text-destructive uppercase">We're Here For You</h2>
            <p className="font-sans text-ink/80 leading-relaxed">
              It sounds like you might be carrying something really heavy right now. You don't have to go through this alone.
            </p>
            <div className="space-y-4 font-mono text-sm bg-ink/3 p-4 border border-ink/10">
              <p><strong>iCall:</strong> 9152987821</p>
              <p><strong>Vandrevala Foundation:</strong> 1860-2662-345</p>
              <p><strong>Emergencies:</strong> 112</p>
            </div>
            <button 
              onClick={() => setIsCrisis(false)}
              className="w-full py-4 border-2 border-ink/20 font-bold uppercase tracking-widest hover:bg-ink hover:text-bg transition-colors"
            >
              I understand, return to chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { TherapistPage as default };
