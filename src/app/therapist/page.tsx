"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useDiary } from "@/lib/useDiary";
import { useFlags } from "@/lib/useFlags";
import { useCheckins } from "@/lib/useCheckins";
import { ArrowLeft, Sparkles, MessageSquare, Send } from "lucide-react";

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function TherapistPage() {
  const navigate = useRouter();
  const { entries } = useDiary();
  const { flags } = useFlags();
  const { checkins } = useCheckins();

  const [mode, setMode] = useState<'select' | 'chat'>('select');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const startAnalysisMode = async () => {
    setIsLoading(true);
    setMode('chat');
    
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

    const initialSystemInstruction = `You are an AI therapist analyzing the user's recent history to kick off a conversation. 
Here is their recent data:
Diary Entries:
${recentEntries || 'none'}

Recent Red Flags: ${recentFlags}

Recent Check-ins:
${recentCheckins || 'none'}

Your first message should NOT be a response to a specific prompt. Instead, you should proactively summarize their recent patterns (without being clinical), validate their feelings, and ask a single open-ended question about how they are doing right now to start the conversation.`;

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
      alert(`AI Failed: ${error.message}`);
      setMode('select');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChatMode = () => {
    setMode('chat');
    setMessages([
      { role: 'model', parts: [{ text: "I'm here. What's on your mind right now?" }] }
    ]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || isCrisis) return;
    
    const userMessage: Message = { role: 'user', parts: [{ text: inputText }] };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/therapist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.crisisPathTriggered) {
        setIsCrisis(true);
      }

      setMessages([...updatedMessages, { role: 'model', parts: [{ text: data.aiReply }] }]);
    } catch (error: any) {
      console.error(error);
      alert(`AI Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)] animate-in fade-in max-w-4xl mx-auto w-full pt-4 px-4 pb-24">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={() => navigate.push('/')}
          className="rounded-full w-12 h-12 brutalist-shadow-sm border-2 border-ink"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="font-heading tracking-tighter text-3xl md:text-4xl uppercase">AI Therapist</h1>
      </div>

      {mode === 'select' ? (
        /* SELECTION MODE */
        <div className="flex-1 flex flex-col justify-center gap-6 pb-20">
          <Button 
            className="flex-col gap-4 h-auto p-8 brutalist-shadow-sm bg-brand text-ink hover:bg-brand/90 border-4 border-ink transition-transform hover:-translate-y-1"
            onClick={startAnalysisMode}
          >
            <Sparkles className="w-12 h-12" />
            <div className="space-y-2">
              <h2 className="font-heading text-2xl uppercase">Analyze My History</h2>
              <p className="font-mono text-sm opacity-80 normal-case">
                Let the AI scan your last 5 diary entries and recent logs to uncover patterns and start a conversation.
              </p>
            </div>
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-[2px] flex-1 bg-ink/10"></div>
            <span className="font-mono text-xs uppercase font-bold text-ink/50">OR</span>
            <div className="h-[2px] flex-1 bg-ink/10"></div>
          </div>

          <Button 
            className="flex-col gap-4 h-auto p-8 brutalist-shadow-sm bg-white text-ink hover:bg-white/90 border-4 border-ink transition-transform hover:-translate-y-1"
            onClick={startNewChatMode}
          >
            <MessageSquare className="w-12 h-12" />
            <div className="space-y-2">
              <h2 className="font-heading text-2xl uppercase">Discuss Something New</h2>
              <p className="font-mono text-sm opacity-80 normal-case">
                Skip the history and just start venting or talking about something specific that happened today.
              </p>
            </div>
          </Button>
        </div>
      ) : (
        /* CHAT MODE */
        <div className="flex-1 flex flex-col bg-bg border-4 border-ink brutalist-shadow min-h-0 relative overflow-hidden">
          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-4 border-2 border-ink brutalist-shadow-sm ${
                    msg.role === 'user' ? 'bg-ink text-bg' : 'bg-brand text-ink'
                  }`}
                >
                  {msg.role === 'model' && <p className="font-mono text-xs opacity-50 uppercase font-bold mb-2">Therapist</p>}
                  <div className="font-sans text-[15px] leading-relaxed whitespace-pre-wrap">
                    {msg.parts[0].text}
                  </div>
                </div>
              </div>
            ))}
            
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

          {/* Chat Input */}
          {!isCrisis && (
            <div className="shrink-0 p-4 bg-white border-t-4 border-ink flex gap-4">
              <Textarea 
                placeholder="Type your message..." 
                className="flex-1 min-h-[60px] max-h-[120px] resize-none border-2 border-ink"
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
                className="h-auto w-[60px] shrink-0 brutalist-shadow-sm border-2 border-ink bg-blue hover:bg-blue/90 text-ink"
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Send className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
