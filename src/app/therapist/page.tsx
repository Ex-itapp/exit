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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const startAnalysisMode = async () => {
    if (!isPro && messages.length >= 3) {
      setShowProGate("chat_limit");
      return;
    }

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
    if (!isPro && messages.length >= 3) {
      setShowProGate("chat_limit");
      return;
    }

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
    if (!inputText.trim()) return;
    
    if (!isPro && messages.length >= 5) {
      setShowProGate("chat_limit");
      return;
    }

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
            <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-brand" />
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
        
        {isCrisis && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-red-500 text-sm font-sans">
              It sounds like you might be in crisis. Please consider reaching out to a helpline or emergency services in your area. You don't have to go through this alone.
            </p>
          </div>
        )}
      </div>
      
      {messages.length === 0 && !isLoading && !isScreenshotMode && !isCrisis && (
        <div className="px-4 pb-2 w-full max-w-3xl mx-auto">
          <QuickActions 
            onSelect={startPresetChat}
            visible={true}
            onOpenGames={() => router.push('/play')}
          />
        </div>
      )}
      
      {!isScreenshotMode && !isCrisis && (
        <div className="shrink-0 p-4 pb-6 sm:pb-8 max-w-3xl mx-auto w-full flex flex-col gap-3">
          {(() => {
            if (messages.length === 0 || isLoading) return null;
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role !== 'model') return null;
            
            const content = lastMessage.parts?.[0]?.text?.toLowerCase() || '';
            
            if (content.includes('diary') || content.includes('journal') || content.includes('dump')) {
              return (
                <button 
                  onClick={() => router.push('/diary')}
                  className="self-center bg-brand text-brand-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-bottom-2 hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-4 h-4" />
                  Open Diary
                </button>
              );
            }
            if (content.includes('play hub') || content.includes('game') || content.includes('distract')) {
              return (
                <button 
                  onClick={() => router.push('/play')}
                  className="self-center bg-brand text-brand-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-bottom-2 hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-4 h-4" />
                  Open Play Hub
                </button>
              );
            }
            if (content.includes('streak') || content.includes('no-contact') || content.includes('no contact')) {
              return (
                <button 
                  onClick={() => router.push('/home')}
                  className="self-center bg-brand text-brand-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-bottom-2 hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-4 h-4" />
                  Check Streak
                </button>
              );
            }
            return null;
          })()}
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
          onClose={() => setShowProGate(null)}
          feature={showProGate}
        />
      )}
    </div>
  );
};

export { TherapistPage as default };
