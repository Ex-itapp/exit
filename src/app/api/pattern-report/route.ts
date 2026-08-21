import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { callAIRouter } from '@/lib/ai/router';

function sanitizeForPrompt(text: string): string {
  return text
    .replace(/["`'\\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, 5000);
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

    const { diary_entries_current, diary_entries_comparison, red_flags_current } = await req.json();

    // Sanitize inputs
    const safeDiaryCurrent = typeof diary_entries_current === 'string' 
      ? sanitizeForPrompt(diary_entries_current) 
      : JSON.stringify(diary_entries_current || []).slice(0, 5000);
    const safeDiaryComparison = typeof diary_entries_comparison === 'string' 
      ? sanitizeForPrompt(diary_entries_comparison) 
      : JSON.stringify(diary_entries_comparison || []).slice(0, 5000);
    const safeFlags = typeof red_flags_current === 'string' 
      ? sanitizeForPrompt(red_flags_current) 
      : JSON.stringify(red_flags_current || []).slice(0, 5000);

    const systemPrompt = `You are analyzing personal diary and red-flag log data for a breakup-recovery app's periodic recap feature. Output ONLY valid JSON matching this exact schema — no prose, no markdown, no explanation outside the JSON.

Tone: warm but plain-spoken, a little wry, never clinical, never saccharine. Short lines — this text will be rendered in large typography on a mobile screen, not read as a paragraph.
IMPORTANT: standout_line MUST be paraphrased, not quoted verbatim. Do not use their exact words.`;

    const userPrompt = `Diary entries (current period):
${safeDiaryCurrent}

Diary entries (comparison period):
${safeDiaryComparison}

Red flags (current period):
${safeFlags}

Ensure the output is strictly valid JSON matching this schema format:
{
  "page1_overview": { "headline": "...", "stat_highlight": "...", "subtext": "..." },
  "page2_diary": { "headline": "...", "coping_comparison": "...", "mood_breakdown": [{"mood": "...", "count": 0}], "standout_line": "..." },
  "page3_redflags": { "headline": "...", "top_pattern": "...", "pattern_counts": [{"category": "...", "count": 0}], "insight_line": "..." }
}`;

    const resultText = await callAIRouter({
      systemPrompt,
      prompt: userPrompt,
      tier: 'heavy',
      temperature: 0.3,
      jsonMode: true
    });

    if (!resultText) {
      return NextResponse.json({ error: 'AI service unavailable. Please try again.' }, { status: 503 });
    }

    // Clean markdown code blocks if present and parse
    const cleanedText = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanedText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Pattern Report Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
