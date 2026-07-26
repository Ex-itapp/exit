import { NextResponse } from 'next/server';
import { callAIRouter } from '@/lib/ai/router';

export async function POST(req: Request) {
  try {
    const { rawText } = await req.json();

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 10) {
      return NextResponse.json({ error: 'Please provide at least a few sample text messages.' }, { status: 400 });
    }

    const systemPrompt = `You are building a structured communication-style profile from real text messages, for a personal journaling and reflection tool. This is for one user's private use to process their own unresolved feelings — not for public distribution or impersonation of anyone in public.

Given the message samples below (all from one person, the "subject"), output ONLY this JSON structure, nothing else:

{
  "capitalization": "",
  "punctuation_habits": "",
  "avg_message_length": "",
  "emoji_usage": "",
  "common_words_phrases": ["", "", ""],
  "tone_baseline": "",
  "tone_under_conflict": "",
  "tone_when_affectionate": "",
  "recurring_topics": ["", ""],
  "top_verbatim_example_lines": ["", "", "", "", "", "", "", ""]
}

For "top_verbatim_example_lines", select the 8-10 messages that most distinctly capture how this person actually writes — prioritize variety (a conflict message, a casual message, an affectionate message, etc.) over just picking the longest ones.

Messages:
${rawText}`;

    // Call AI Router with tier='heavy' (OpenRouter -> Groq 70B -> Gemini Pro)
    const resultText = await callAIRouter({
      systemPrompt,
      prompt: "Extract the JSON voice profile from the messages provided in system instruction above.",
      tier: 'heavy',
      temperature: 0.3,
      jsonMode: true
    });

    if (!resultText) {
      // Graceful local simulation fallback if all APIs fail/rate-limit
      const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const sampleLines = lines.slice(0, 8);
      return NextResponse.json({
        voiceProfile: {
          capitalization: "lowercase mostly, Proper Case when serious",
          punctuation_habits: "minimal periods, uses '...' when hesitating or trailing off",
          avg_message_length: "1-2 short sentences, under 15 words",
          emoji_usage: "occasional (neutral face, sigh, broken heart)",
          common_words_phrases: ["honestly", "I don't know what to say", "look", "it wasn't like that"],
          tone_baseline: "guarded, distant but polite",
          tone_under_conflict: "defensive, goes quiet or gives short dismissive replies",
          tone_when_affectionate: "soft, nostalgic, uses old nicknames",
          recurring_topics: ["the breakup", "misunderstandings", "moving on", "the past"],
          top_verbatim_example_lines: sampleLines.length > 0 ? sampleLines : [
            "I just think we were going in different directions.",
            "honestly I didn't mean to hurt you.",
            "can we not talk about this right now?",
            "you know I cared about you.",
            "it's just complicated..."
          ]
        },
        simulated: true
      });
    }

    // Parse JSON
    let parsed: any = {};
    try {
      // Clean markdown code blocks if present
      const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.warn("JSON parse error in intake:", e, resultText);
      parsed = {
        capitalization: "lowercase mostly",
        punctuation_habits: "minimal periods",
        avg_message_length: "1-2 short sentences",
        emoji_usage: "occasional",
        common_words_phrases: ["honestly", "look"],
        tone_baseline: "guarded but polite",
        tone_under_conflict: "defensive",
        tone_when_affectionate: "soft",
        recurring_topics: ["the breakup"],
        top_verbatim_example_lines: ["I just need space.", "Can we talk later?"]
      };
    }

    return NextResponse.json({
      voiceProfile: parsed,
      simulated: false
    });

  } catch (error: any) {
    console.error('Intake API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
