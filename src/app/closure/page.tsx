"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { MessageSquare, AlertTriangle } from "lucide-react";

export default function Closure() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-5xl font-heading tracking-tighter">TALK TO THEM</h1>
          <Badge variant="default" className="text-lg py-1 px-3 bg-ink text-bg">2 SESSIONS REMAINING</Badge>
        </div>
        <p className="font-mono text-ink/70">CLOSURE IS A BOUNDED EXERCISE. NOT A HANGOUT.</p>
      </header>

      <div className="bg-accent/10 border-4 border-accent p-6 flex gap-4">
        <AlertTriangle className="w-8 h-8 text-accent shrink-0" />
        <div className="space-y-2">
          <h3 className="font-heading uppercase text-accent text-xl">Rules of Engagement</h3>
          <p className="text-sm font-mono leading-relaxed">
            THIS IS A STRICTLY BOUNDED SIMULATION FOR UNANSWERED QUESTIONS. NO ROLEPLAY. NO RECREATING THE RELATIONSHIP. EACH SESSION REQUIRES A MANDATORY REFLECTION AFTERWARD.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start a Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <p className="text-lg">
            What is the one thing you need to say or ask to get closure today? Be specific.
          </p>
          <Textarea placeholder="I need to know why you..." />
        </CardContent>
        <CardFooter className="justify-end bg-ink text-bg">
          <Button variant="secondary">
            <MessageSquare className="w-4 h-4 mr-2" />
            Initiate Session
          </Button>
        </CardFooter>
      </Card>
      
      <div className="pt-8 space-y-4">
        <h2 className="text-2xl font-heading tracking-tighter">PAST SESSIONS</h2>
        <div className="text-center py-12 border-4 border-dashed border-ink/20 opacity-50">
          <p className="font-mono">NO SESSIONS RECORDED.</p>
        </div>
      </div>
    </div>
  );
}
