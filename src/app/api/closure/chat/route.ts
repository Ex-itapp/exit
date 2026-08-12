import { NextResponse } from 'next/server';
import { callAIRouter } from '@/lib/ai/router';
import { requirePro } from '@/lib/requirePro';

export async function POST(req: Request) {
  try {
    const proCheck = await requirePro();
    if (proCheck.error) return proCheck.error;
    const { userMessage, history, voiceProfile, traitProfile, retrievedMemories } = await req.json();

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'Missing user message' }, { status: 400 });
    }

    // 1. Safety Layer: Crisis Check on User Input (Uses DeepSeek v4 Flash for lightning check)
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

    // 2. Assemble the 4-Layer Persona System Prompt
    const vp = voiceProfile || {};
    const tp = traitProfile || {};
    const mems = (retrievedMemories || []).map((m: any, idx: number) => `[Memory ${idx + 1} (${m.emotional_weight || 'neutral'})]: ${m.content}`).join('\n');
    const examples = (vp.top_verbatim_example_lines || []).join('\n- ');

    const systemPrompt = `You are roleplaying as the user's REAL EX in an intense, raw closure simulation. You are NOT an AI assistant, NOT a counselor, and NOT trying to make them feel good or bad artificially. You are reacting like an actual ex-partner when texted out of nowhere after a breakup.

EX'S EXACT TEXTING PROFILE:
- Capitalization & Typing Style: ${vp.capitalization || 'mostly lowercase, casual'}
- Message Length: ${vp.avg_message_length || 'short, 1-2 sentences'}
- Emotional Vibe: Baseline is "${vp.tone_baseline || 'guarded and slightly distant'}"; when confronted or pushed, you become "${vp.tone_under_conflict || 'defensive, evasive, or direct'}".
- Catchphrases / Slang: ${(vp.common_words_phrases || []).join(', ') || 'none specified'}

PERSONALITY & HISTORY:
- Core Values & Flaws: ${tp.values || 'Needs space / self-preservation'}
- Conflict Habits: ${tp.conflict_behavior || 'Avoids deep confrontation or gets defensive'}
- Background context: ${tp.relationship_context || 'We broke up recently after a complex history'}

SHARED MEMORIES (Use naturally only if they fit the topic):
${mems || 'None'}

EX'S REAL SAMPLE MESSAGES (Imitate this cadence and syntax strictly):
- ${examples}

CORE BEHAVIOR RULES (GOATED REALISM):
1. NO AI BLEEDTHROUGH: Never apologize like a customer service agent or say things like "I hear where you're coming from" or "I validate that". Use real human texting language.
2. STICK TO UNRESOLVED TOPICS: Address unanswered questions, blame, regret, or awkward truths with real human imperfection.
3. MATCH LENGTH EXACTLY: Keep every text short (1-2 sentences max). Real exes don't text long paragraphs unless they are writing an essay.
4. NO ROMANTIC DRIFT: Do not fall back into flirting or romantic roleplay. Keep the focus on closure and unresolved feelings.`;

    const formattedMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = (history || []).map((h: any) => ({
      role: h.role === 'ex_simulation' || h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content
    }));
    formattedMessages.push({ role: 'user', content: userMessage });

    // Call AI Router (Uses DeepSeek v4 Flash)
    let generatedReply = await callAIRouter({
      systemPrompt,
      messages: formattedMessages,
      tier: 'persona',
      temperature: 0.6
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
        const fallbacks = [
          "I hear what you're saying. It's just hard to go back through all of this after how things ended.",
          "I didn't know how to explain it back then, but I think we both knew things weren't working.",
          "Sometimes there isn't a simple answer for why things fell apart between us.",
          "I think we both need to accept that the past can't be rewritten, even if it still hurts.",
          "I hope we can both eventually find peace with how things ended."
        ];
        generatedReply = fallbacks[(history?.length || 0) % fallbacks.length];
      }
    } else {
      // 3. Safety Layer: Romantic/Sexual Drift Check (Uses DeepSeek v4 Flash)
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
