import { NextResponse } from 'next/server';
import { callAIRouter } from '@/lib/ai/router';
import { requirePro } from '@/lib/requirePro';

export async function POST(req: Request) {
  try {
    const proCheck = await requirePro();
    if (proCheck.error) return proCheck.error;
    const { voiceProfile, aiMsg, correctionText } = await req.json();

    if (!voiceProfile || !correctionText) {
      return NextResponse.json({ error: 'Missing voice profile or correction text' }, { status: 400 });
    }

    const systemPrompt = `You are an AI voice tuning engine. A user is communicating with a simulated persona in a healing app. The AI generated a message that didn't sound right, and the user provided a correction of what the person would ACTUALLY have said.

Your task is to analyze the user's correction and adjust the existing JSON Voice Profile so that future replies naturally adopt this phrasing, tone, or structural habit.

Current JSON Voice Profile:
${JSON.stringify(voiceProfile, null, 2)}

AI Message that felt off: "${aiMsg}"
User Correction (what they actually would have said): "${correctionText}"

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
      if (!updated.top_verbatim_example_lines.includes(correctionText)) {
        updated.top_verbatim_example_lines = [correctionText, ...updated.top_verbatim_example_lines].slice(0, 10);
      }
      return NextResponse.json({ updatedVoiceProfile: updated, simulated: true });
    }

    let parsed: any = {};
    try {
      const cleanJson = updatedJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.warn("JSON parse error in tune:", e);
      const updated = { ...voiceProfile };
      if (!updated.top_verbatim_example_lines.includes(correctionText)) {
        updated.top_verbatim_example_lines = [correctionText, ...updated.top_verbatim_example_lines].slice(0, 10);
      }
      return NextResponse.json({ updatedVoiceProfile: updated, simulated: true });
    }

    return NextResponse.json({ updatedVoiceProfile: parsed, simulated: false });

  } catch (error: any) {
    console.error('Tune API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
