import { NextResponse } from 'next/server';
import { callAIRouter } from '@/lib/ai/router';
import { requirePro } from '@/lib/requirePro';

export async function POST(req: Request) {
  try {
    const proCheck = await requirePro();
    if (proCheck.error) return proCheck.error;
    const { messages, systemInstruction } = await req.json();
    
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

    // Call 2 - The Chat Response
    const defaultSystemInstruction = `You are a deeply empathetic, very human-sounding companion in a breakup-recovery app. You are texting with the user.

Hard rules:
- NEVER sound like a robotic AI. Use natural, conversational language. Avoid overly clinical therapy speak or long-winded paragraphs.
- Keep your replies VERY short and punchy, like a real text message conversation (1-3 sentences max).
- NEVER name or imply a mental health diagnosis.
- NEVER give medical, legal, or relationship-reconciliation advice.
- Instead of just asking questions forever, recognize when the conversation reaches a natural conclusion. 
- When wrapping up, gently suggest the user use another feature in the app to help them cope (e.g., "Maybe try logging a Red Flag to get it out of your system", "Why don't you check your Streak to see how far you've come?", "Drop this into your Full Diary so you can look back on it later").`;

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
