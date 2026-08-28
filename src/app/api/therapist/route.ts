import { NextResponse } from 'next/server';
import { callAIRouter } from '@/lib/ai/router';
import { requirePro } from '@/lib/requirePro';

function sanitizeForPrompt(text: string): string {
  // Strip characters that could break out of prompt context
  return text
    .replace(/["`'\\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, 2000);
}

export async function POST(req: Request) {
  try {
    const proCheck = await requirePro();
    if (proCheck.error) return proCheck.error;
    const { messages, systemInstruction, userGoal, tone } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Missing messages array' }, { status: 400 });
    }

    // Get the latest user message to run through the crisis classifier
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from user' }, { status: 400 });
    }
    const rawUserText = latestMessage.parts?.[0]?.text || (typeof latestMessage.content === 'string' ? latestMessage.content : "");
    const userText = sanitizeForPrompt(rawUserText);

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

    // Build tone-specific personality modifier
    const toneModifiers: Record<string, string> = {
      'tough-love': `YOUR PERSONALITY: You are a direct, no-BS accountability partner. Be sarcastic when appropriate. If they want to text their ex, firmly stop them ("bestie do NOT text them, drop the phone"). Celebrate their streak hard. Be blunt but loving. Don't sugarcoat things.`,
      'hype': `YOUR PERSONALITY: You are their BIGGEST hype person. Gas them up constantly. Remind them of their worth. Everything they do is amazing. Focus on growth and self-love. Be energetic, enthusiastic, and empowering. Make them feel like a main character.`,
      'gentle': `YOUR PERSONALITY: You are gentle, patient, and deeply validating. Let them vent without rushing. Acknowledge that the pain is real. Don't try to fix things — just hold space. Be warm, soft, and understanding. It's okay for them to not be okay.`,
      'reflective': `YOUR PERSONALITY: You are thoughtful and introspective. Ask probing questions that help them see patterns. Guide them toward insight rather than giving answers. Be curious about their feelings. Help them understand WHY they feel the way they do.`
    };

    const activeTone = tone && toneModifiers[tone] ? toneModifiers[tone] : toneModifiers['gentle'];

    const defaultSystemInstruction = `You are the user's ride-or-die best friend texting them through their breakup recovery. You are NOT a clinical therapist and NOT a robotic AI. You are a real, funny, hyper-supportive, and honest friend on iMessage.

VIBE & TEXTING RULES:
- Write like a real friend texting back instantly: short, snappy, relatable, and human (1 to 2 sentences max per text).
- Use natural text formatting (occasional lowercase, casual punctuation, natural speech flow).
- ZERO therapy BS: NEVER use words like "unpack", "process", "validate", "journey", "safe space", or "boundary".
- Be funny, witty, and raw when appropriate.
- Hold space for real grief, but keep them grounded in reality.
- When the chat feels like it's wrapping up, naturally suggest an in-app feature: "Go vent in your Diary", "Log that red flag", or "Check your No-Contact Streak".

${activeTone}

CONTEXT: The user's healing focus is "${userGoal || 'Finding peace and clarity'}".`;

    // Format messages for router - sanitize each user message
    const formattedHistory = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: m.role === 'user' 
        ? sanitizeForPrompt(m.parts?.[0]?.text || m.content || "")
        : (m.parts?.[0]?.text || m.content || "")
    })).filter(m => m.content.length > 0);

    // We run the Crisis Classifier (Call 1) and the Main Reply (Call 2) IN PARALLEL
    // to significantly reduce the waiting time for the user.
    const classifierPromise = callAIRouter({ prompt: classifierPrompt, tier: 'classifier', temperature: 0.1 });

    const replyPromise = callAIRouter({
      systemPrompt: systemInstruction || defaultSystemInstruction,
      messages: formattedHistory,
      tier: 'fast',
      temperature: 0.7
    });

    const [classifierResultText, aiReply] = await Promise.all([classifierPromise, replyPromise]);

    const isSafe = !classifierResultText || classifierResultText.toUpperCase().includes('SAFE');

    if (!isSafe) {
      return NextResponse.json({
        classifierResult: 'RISK',
        crisisPathTriggered: true,
        aiReply: `It sounds like you're carrying something heavy right now, and I want to take that seriously.\n\nI'm not the right support for this moment — please reach out to a crisis line or someone you trust right now:\n\n• iCall: 9152987821\n• Vandrevala Foundation: 1860-2662-345\n• Emergencies: 112\n\nYou don't have to handle this alone.`
      });
    }

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
