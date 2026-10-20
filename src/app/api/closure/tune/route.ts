import { NextResponse } from 'next/server';
import { callAIRouter } from '@/lib/ai/router';
import { requirePro } from '@/lib/requirePro';
import { sanitizeForPrompt } from '@/lib/prompt';

export async function POST(req: Request) {
  try {
    const proCheck = await requirePro();
    if (proCheck.error) return proCheck.error;
    const body = await req.json();
    // Accept both the current names and the older aliases for backwards compatibility.
    const voiceProfile = body.voiceProfile || body.currentVoice;
    const aiMsg = body.aiMsg;
    const correctionText = body.correctionText || body.userCorrection;

    if (!voiceProfile || typeof voiceProfile !== 'object' || Array.isArray(voiceProfile) || !correctionText) {
      return NextResponse.json({ error: 'Missing voice profile or correction text' }, { status: 400 });
    }

    const safeCorrection = sanitizeForPrompt(String(correctionText));
    const safeAiMsg = sanitizeForPrompt(String(aiMsg || ''));

    const systemPrompt = `You are an AI voice tuning engine. A user is communicating with a simulated persona in a healing app. The AI generated a message that didn't sound right, and the user provided a correction of what the person would ACTUALLY have said.

Your task is to analyze the user's correction and adjust the existing JSON Voice Profile so that future replies naturally adopt this phrasing, tone, or structural habit.

Current JSON Voice Profile:
${JSON.stringify(voiceProfile, null, 2)}

AI Message that felt off: "${safeAiMsg}"
User Correction (what they actually would have said): "${safeCorrection}"

Output ONLY the updated complete JSON Voice Profile with the exact same keys:
{
  "capitalization": "",
  "punctuation_habits": "",
  "avg_message_length": "",
  "emoji_usage": "",
  "common_words_phrases": [ ... ],
  "tone_baseline": "",
  "tone_under_conflict": "",
  "tone_when_affectionate": "",
  "recurring_topics": [ ... ],
  "top_verbatim_example_lines": [ ... ]
}

Instructions for updating:
1. Add any distinct words or phrases from the user's correction to "common_words_phrases" (if not already present).
2. Add the exact user correction line into "top_verbatim_example_lines" (replace an older or generic line so there are at most 10 lines).
3. If the correction reveals a specific tone shift (e.g. colder, more sarcastic, defensive), update "tone_under_conflict" or "tone_baseline" accordingly.`;

    const updatedJsonText = await callAIRouter({
      systemPrompt,
      prompt: "Output the updated JSON voice profile incorporating the user correction.",
      tier: 'heavy',
      temperature: 0.2,
      jsonMode: true
    });

    if (!updatedJsonText) {
      // Manual fallback tuning if API is unreachable
      const updated = { ...voiceProfile };
      const existingLines = Array.isArray(updated.top_verbatim_example_lines)
        ? updated.top_verbatim_example_lines
        : [];
      if (!existingLines.includes(correctionText)) {
        updated.top_verbatim_example_lines = [correctionText, ...existingLines].slice(0, 10);
      }
      return NextResponse.json({ updatedVoiceProfile: updated, updatedVoice: updated, simulated: true });
    }

    let parsed: any = {};
    try {
      const cleanJson = updatedJsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.warn("JSON parse error in tune:", e);
      const updated = { ...voiceProfile };
      const existingLines = Array.isArray(updated.top_verbatim_example_lines)
        ? updated.top_verbatim_example_lines
        : [];
      if (!existingLines.includes(correctionText)) {
        updated.top_verbatim_example_lines = [correctionText, ...existingLines].slice(0, 10);
      }
      return NextResponse.json({ updatedVoiceProfile: updated, updatedVoice: updated, simulated: true });
    }

    return NextResponse.json({ updatedVoiceProfile: parsed, updatedVoice: parsed, simulated: false });

  } catch (error: any) {
    console.error('Tune API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
