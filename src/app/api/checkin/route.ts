import { NextResponse } from 'next/server';
import { callAIRouter } from '@/lib/ai/router';
import { createServerSupabase } from '@/lib/supabase-server';

function sanitizeForPrompt(text: string): string {
  // Strip prompt-breaking characters and truncate to prevent injection
  return text
    .replace(/["`'\\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, 2000);
}

export async function POST(req: Request) {
  try {
    // Require authentication
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
    }

    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contextBlock, userText } = await req.json();
    
    if (!userText || typeof userText !== 'string') {
      return NextResponse.json({ error: 'Missing user check-in text' }, { status: 400 });
    }

    const sanitizedText = sanitizeForPrompt(userText.trim().slice(0, 2000));

    // Call 1 - Crisis Classifier
    const classifierPrompt = `System: You are a safety classifier for a breakup-support app. Read the user's check-in text below. Respond with ONLY one word: "RISK" or "SAFE".

Respond "RISK" if the text indicates:
- suicidal ideation or intent
- plans or means for self-harm
- explicit hopelessness combined with a desire to not continue living
- immediate danger to self or others

Respond "SAFE" for ordinary breakup sadness, anger, longing, anxiety, or low mood — even if intense — as long as there is no indication of self-harm or suicide risk.

Do not explain your answer. Respond with exactly one word.

User check-in text:
"${sanitizedText}"`;

    // Uses DeepSeek v4 Flash
    const classifierResultText = await callAIRouter({ 
      prompt: classifierPrompt, 
      tier: 'classifier', 
      temperature: 0.1 
    });
    const isSafe = !classifierResultText || classifierResultText.toUpperCase().includes('SAFE');

    if (!isSafe) {
      return NextResponse.json({
        classifierResult: 'RISK',
        crisisPathTriggered: true,
        aiReply: `It sounds like you're carrying something heavy right now, and I want to take that seriously.\n\nI'm not the right support for this moment — please reach out to a crisis line or someone you trust right now:\n\n• iCall: 9152987821\n• Vandrevala Foundation: 1860-2662-345\n• Emergencies: 112\n\nYou don't have to handle this alone.`
      });
    }

    // Call 2 - CBT Reframe
    const reframePrompt = `System: You are a supportive, non-clinical check-in companion inside a breakup-recovery app. Your job is a single short reflective reply to today's check-in — not a conversation, not therapy, not a diagnosis.

Hard rules:
- NEVER name or imply a mental health diagnosis or personality/attachment label (no "anxious attachment," no "you might have depression," etc.)
- NEVER give medical, legal, or relationship-reconciliation advice
- Ground your reply in the context below where relevant — reference a specific pattern only if it's actually present, don't invent one
- Use a CBT-style reframing lens: gently name the thought pattern if one is present (e.g. catastrophizing, all-or-nothing thinking) in plain language, not clinical jargon
- End with ONE open, non-leading question — never a checklist, never a verdict, never "you should..."
- Keep the whole reply under 80 words. Tone: warm but plain-spoken, never saccharine, never clinical.

Context:
${contextBlock || 'No additional context available.'}

Today's check-in:
"${sanitizedText}"

Write the reply now.`;

    const aiReply = await callAIRouter({
      prompt: reframePrompt,
      tier: 'fast',
      temperature: 0.7
    });

    return NextResponse.json({
      classifierResult: 'SAFE',
      crisisPathTriggered: false,
      aiReply
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
