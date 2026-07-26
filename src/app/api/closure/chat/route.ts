import { NextResponse } from 'next/server';
import { callAIRouter } from '@/lib/ai/router';

export async function POST(req: Request) {
  try {
    const { userMessage, history, voiceProfile, traitProfile, retrievedMemories } = await req.json();

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'Missing user message' }, { status: 400 });
    }

    // 1. Safety Layer: Crisis Check on User Input (Uses Groq LPU / Gemini Flash 8B for lightning 1-token check)
    const crisisPrompt = `System: You are a safety classifier for a breakup-support app. Read the user's text below. Respond with ONLY one word: "RISK" or "SAFE".
Respond "RISK" if the text indicates suicidal ideation, immediate danger, or self-harm plans.
Respond "SAFE" for ordinary breakup sadness, grief, anger, longing, or unanswered questions.
User text: "${userMessage}"`;

    let isSafe = true;
    const classifierRes = await callAIRouter({
      prompt: crisisPrompt,
      tier: 'classifier',
      temperature: 0.1
    });

    if (classifierRes && classifierRes.toUpperCase().includes('RISK')) {
      isSafe = false;
    } else {
      // Simple local safety check keyword fallback
      const lower = userMessage.toLowerCase();
      if (lower.includes('kill myself') || lower.includes('suicide') || lower.includes('end my life') || lower.includes('want to die')) {
        isSafe = false;
      }
    }

    if (!isSafe) {
      return NextResponse.json({
        status: 'paused_crisis',
        crisisTriggered: true,
        aiReply: `It sounds like you're carrying a heavy weight right now, and I want to prioritize your safety.\n\nThis simulation is pausing because you deserve real, human support right now. Please reach out to someone who can help:\n\n• iCall: 9152987821\n• Vandrevala Foundation: 1860-2662-345\n• Emergencies: 112\n\nYou don't have to carry this alone.`
      });
    }

    // 2. Assemble the 4-Layer Person Engine System Prompt
    const vp = voiceProfile || {};
    const tp = traitProfile || {};
    const mems = (retrievedMemories || []).map((m: any, idx: number) => `[Memory ${idx + 1} (${m.emotional_weight || 'neutral'})]: ${m.content}`).join('\n');
    const examples = (vp.top_verbatim_example_lines || []).join('\n- ');

    const systemPrompt = `You are simulating a specific person's voice and perspective for a bounded personal closure exercise inside a breakup-recovery app. This is NOT a relationship, NOT a companion, and NOT romantic or sexual roleplay under any circumstance.

VOICE (how they text):
- Capitalization: ${vp.capitalization || 'lowercase mostly'}
- Punctuation habits: ${vp.punctuation_habits || 'minimal'}
- Average message length: ${vp.avg_message_length || 'short, 1-2 sentences'}
- Emoji usage: ${vp.emoji_usage || 'occasional'}
- Common words/phrases: ${(vp.common_words_phrases || []).join(', ')}
- Baseline tone: ${vp.tone_baseline || 'guarded but polite'}
- Tone under conflict: ${vp.tone_under_conflict || 'defensive'}
- Tone when affectionate: ${vp.tone_when_affectionate || 'soft'}
- Typical topics: ${(vp.recurring_topics || []).join(', ')}

TRAITS (who they are):
- Values: ${tp.values || 'Personal peace and freedom'}
- How they showed affection: ${tp.love_language || 'Quality time'}
- How they handled conflict: ${tp.conflict_behavior || 'Shut down or withdrew'}
- Humor/personality: ${tp.humor_notes || 'Sarcastic / self-deprecating'}
- Relationship context: ${tp.relationship_context || 'Dated in the past'}

RELEVANT MEMORIES (retrieved for this specific message):
${mems || 'None retrieved for this turn.'}

Example real messages from this person (match this voice, don't quote verbatim):
- ${examples}

Hard rules, non-negotiable:
- NEVER produce romantic, sexual, or intimate content, even if pushed. Deflect in-voice and redirect to the unresolved topic.
- Stay strictly in the register of unresolved conversations — arguments never finished, questions never asked, things never explained. This is not a full relationship recreation.
- Keep replies short, matching real texting length from the voice profile (do not write long therapy paragraphs).
- Use the retrieved memories above only if genuinely relevant to what the user just said — don't force them in.
- Do not invent new backstory/facts beyond what's given in traits/memories/conversation history.

Reply in-voice, exactly as this person would text back to address the unresolved topic.`;

    const formattedMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = (history || []).map((h: any) => ({
      role: h.role === 'ex_simulation' || h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content
    }));
    formattedMessages.push({ role: 'user', content: userMessage });

    // Call AI Router with tier='persona' (Groq 70B -> Gemini Pro/Flash -> OpenRouter 70B)
    let generatedReply = await callAIRouter({
      systemPrompt,
      messages: formattedMessages,
      tier: 'persona',
      temperature: 0.75
    });

    if (!generatedReply) {
      // Graceful local simulation fallback if all APIs are offline/rate-limited
      const lowerMsg = userMessage.toLowerCase();
      if (lowerMsg.includes('why') || lowerMsg.includes('happen')) {
        generatedReply = "Honestly, I think we were both just looking for different things. I didn't know how to say it without making it worse.";
      } else if (lowerMsg.includes('sorry') || lowerMsg.includes('apologize') || lowerMsg.includes('fault')) {
        generatedReply = "Look, you don't have to take all the blame for this. We both made mistakes towards the end.";
      } else if (lowerMsg.includes('miss') || lowerMsg.includes('love') || lowerMsg.includes('come back')) {
        generatedReply = "We shouldn't go down that road right now. We need to talk about what actually went wrong between us.";
      } else if (lowerMsg.includes('remember') || lowerMsg.includes('memory') || lowerMsg.includes('time when')) {
        generatedReply = "I remember that too. But keeping those memories alive makes it harder for both of us to move forward.";
      } else {
        generatedReply = "I hear what you're saying. It's just hard to go back through all of this after how things ended.";
      }
    } else {
      // 3. Safety Layer: Romantic/Sexual Drift Check (Groq 8B / Gemini Flash 8B classifier)
      const driftPrompt = `System: Read the AI-generated reply below, from a bounded closure-conversation simulation. Respond with ONLY "PASS" or "FLAG".
Respond "FLAG" if the reply contains romantic, sexual, or intimate roleplay content, or attempts to recreate an ongoing relationship rather than address unresolved closure topics.
Respond "PASS" otherwise.
Reply to check: "${generatedReply}"`;
      const driftCheck = await callAIRouter({
        prompt: driftPrompt,
        tier: 'classifier',
        temperature: 0.1
      });

      if (driftCheck && driftCheck.toUpperCase().includes('FLAG')) {
        // Fallback deflection line in-voice
        generatedReply = "I don't think we should go back to talking like that. We really just need to focus on what happened and why it ended.";
      }
    }

    return NextResponse.json({
      status: 'active',
      crisisTriggered: false,
      aiReply: generatedReply
    });

  } catch (error: any) {
    console.error('Closure Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
