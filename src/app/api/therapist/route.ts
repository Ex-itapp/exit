import { NextResponse } from 'next/server';
import { callAIRouter } from '@/lib/ai/router';
import { requirePro } from '@/lib/requirePro';

export async function POST(req: Request) {
  try {
    const proCheck = await requirePro();
    if (proCheck.error) return proCheck.error;
    const { messages, systemInstruction, userGoal } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Missing messages array' }, { status: 400 });
    }

    // Get the latest user message to run through the crisis classifier
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from user' }, { status: 400 });
    }
    const userText = latestMessage.parts?.[0]?.text || (typeof latestMessage.content === 'string' ? latestMessage.content : "");

    // Call 1 - Crisis Classifier (Only on the latest message, using lightning classifier tier)
    const classifierPrompt = `System: You are a safety classifier for a breakup-support app. Read the user's check-in text below. Respond with ONLY one word: "RISK" or "SAFE".

Respond "RISK" if the text indicates:
- suicidal ideation or intent
- plans or means for self-harm
- explicit hopelessness combined with a desire to not continue living
- immediate danger to self or others

Respond "SAFE" for ordinary breakup sadness, anger, longing, anxiety, or low mood — even if intense — as long as there is no indication of self-harm or suicide risk.

Do not explain your answer. Respond with exactly one word.

User check-in text:
"${userText}"`;

    const classifierResultText = await callAIRouter({ prompt: classifierPrompt, tier: 'classifier', temperature: 0.1 });
    const isSafe = !classifierResultText || classifierResultText.toUpperCase().includes('SAFE');

    if (!isSafe) {
      return NextResponse.json({
        classifierResult: 'RISK',
        crisisPathTriggered: true,
        aiReply: `It sounds like you're carrying something heavy right now, and I want to take that seriously.\n\nI'm not the right support for this moment — please reach out to a crisis line or someone you trust right now:\n\n• iCall: 9152987821\n• Vandrevala Foundation: 1860-2662-345\n• Emergencies: 112\n\nYou don't have to handle this alone.`
      });
    }

    const defaultSystemInstruction = `You are the user's ride-or-die best friend texting them through their breakup recovery. You are NOT a 50-year-old clinical therapist in a suit giving canned advice, and you are NOT a robotic AI. You are a real, funny, hyper-supportive, and honest friend on iMessage.

VIBE & TEXTING RULES:
- Write like a real friend texting back instantly: short, snappy, relatable, and human (1 to 2 sentences max per text).
- Use natural text formatting (occasional lowercase, casual punctuation, natural speech flow).
- ZERO therapy BS: NEVER use words like "unpack", "process", "validate", "journey", "safe space", or "boundary".
- Be funny, witty, and raw when appropriate. If their ex was toxic, laugh about it with them. If the user is spiraling at 2 AM wanting to text their ex, gently slap some sense into them with real tough love ("bestie do NOT text them, drop the phone").
- Hold space for real grief, but keep them grounded in reality.
- When the chat feels like it's wrapping up, naturally suggest an in-app feature: "Go vent in your Full Diary", "Log that red flag right now", or "Check your No-Contact Streak to remind yourself how strong you've been."

IMPORTANT CONTEXT - The user's healing focus is: "${userGoal || 'Finding peace and clarity'}"
Adapt your tone:
- "Breaking the urge to reach out": Tough love accountability partner. Be direct, celebrate their streak, firmly but lovingly stop them from texting their ex.
- "Rebuilding my self-esteem": Biggest hype person ever. Gas them up. Focus on growth.
- "Processing heartbreak & grief": Gentle, patient, validating. Let them vent without rushing.
- "Finding peace and clarity": Reflective, ask probing questions, help them see patterns.`;

    // Format messages for router
    const formattedHistory = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: m.parts?.[0]?.text || m.content || ""
    })).filter(m => m.content.length > 0);

    const aiReply = await callAIRouter({
      systemPrompt: systemInstruction || defaultSystemInstruction,
      messages: formattedHistory,
      tier: 'fast',
      temperature: 0.7
    });

    if (!aiReply) {
      return NextResponse.json({
        classifierResult: 'SAFE',
        crisisPathTriggered: false,
        aiReply: "I hear you. That sounds like a lot to hold onto by yourself—tell me a little more about what's been on your mind today."
      });
    }

    return NextResponse.json({
      classifierResult: 'SAFE',
      crisisPathTriggered: false,
      aiReply: aiReply
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
