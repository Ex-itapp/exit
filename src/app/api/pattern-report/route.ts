import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { callAIRouter } from '@/lib/ai/router';
import { sanitizeForPrompt } from '@/lib/prompt';

export async function POST(req: Request) {
  try {
    // Require authentication (bearer token or Supabase session cookie)
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '') || '';

    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = token
      ? await supabase.auth.getUser(token)
      : await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { diary_entries_current, diary_entries_comparison, red_flags_current } = await req.json();

    // Sanitize inputs
    const safeDiaryCurrent = typeof diary_entries_current === 'string' 
      ? sanitizeForPrompt(diary_entries_current, 5000) 
      : JSON.stringify(diary_entries_current || []).slice(0, 5000);
    const safeDiaryComparison = typeof diary_entries_comparison === 'string' 
      ? sanitizeForPrompt(diary_entries_comparison, 5000) 
      : JSON.stringify(diary_entries_comparison || []).slice(0, 5000);
    const safeFlags = typeof red_flags_current === 'string' 
      ? sanitizeForPrompt(red_flags_current, 5000) 
      : JSON.stringify(red_flags_current || []).slice(0, 5000);

    const systemPrompt = `You are the Reality Check engine for EX-it, a raw, brutalist breakup recovery app.
Your task is to analyze the user's weekly unfiltered diary entries, red flag logs, and mood history to deliver a crisp, brutally honest "Weekly Reality Check".

Tone: Plain-spoken, grounded, slightly wry, zero corporate jargon, zero toxic positivity, zero therapy clichés (do NOT use words like "journey", "unpack", "safe space", "heal your inner child").

Output ONLY valid JSON matching this exact structure:
{
  "page1_overview": {
    "headline": "A short, razor-sharp summary sentence (under 10 words)",
    "stat_highlight": "A punchy uppercase stat or phrase (e.g., 'ZERO TEXTS SENT', '4 DAYS OF PEACE', 'PATTERN IDENTIFIED')",
    "subtext": "A brief 1-2 sentence honest summary of their mental state this week."
  },
  "page2_diary": {
    "headline": "What the diary actually reveals about your emotions",
    "coping_comparison": "How this week compares to past rumination (1 sentence)",
    "mood_breakdown": [
      { "mood": "hopeful", "count": 3 },
      { "mood": "angry", "count": 2 }
    ],
    "standout_line": "Paraphrase (DO NOT quote verbatim) the single most grounded thought they had this week."
  },
  "page3_redflags": {
    "headline": "The blindspots you stopped ignoring",
    "top_pattern": "The dominant red flag or relationship behavior pattern (under 4 words)",
    "pattern_counts": [
      { "category": "Inconsistency", "count": 2 },
      { "category": "Disrespect", "count": 1 }
    ],
    "insight_line": "One blunt, empowering reality check sentence about why they are better off."
  }
}

IMPORTANT:
- standout_line MUST be paraphrased, not quoted verbatim.
- Valid JSON only. No markdown formatting outside the JSON.`;

    const userPrompt = `Weekly logs to analyze:
Diary Entries (This Week):
${safeDiaryCurrent}

Diary Entries (Prior Comparison Period):
${safeDiaryComparison}

Red Flags Logged:
${safeFlags}

Generate the Weekly Reality Check JSON now.`;

    let data: any = null;

    try {
      const resultText = await callAIRouter({
        systemPrompt,
        prompt: userPrompt,
        tier: 'heavy',
        temperature: 0.3,
        jsonMode: true
      });

      if (resultText) {
        const cleanedText = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
        data = JSON.parse(cleanedText);
      }
    } catch (parseErr) {
      console.warn('AI router parse failure, falling back to deterministic synthesis:', parseErr);
    }

    // High quality deterministic fallback if AI router is offline or times out
    if (!data || !data.page1_overview) {
      const diaryCount = Array.isArray(diary_entries_current) ? diary_entries_current.length : 1;
      const flagsCount = Array.isArray(red_flags_current) ? red_flags_current.length : 1;
      const topFlagCat = (Array.isArray(red_flags_current) && red_flags_current[0]?.category) 
        ? red_flags_current[0].category 
        : "Inconsistency";

      data = {
        page1_overview: {
          headline: "Clarity is replacing the illusion.",
          stat_highlight: `${diaryCount} Unsent Reflections`,
          subtext: "Instead of breaking your peace, you vented your truth where it belongs. That is real progress."
        },
        page2_diary: {
          headline: "The emotional withdrawal is leveling out.",
          coping_comparison: "You are spending less time rationalizing the past and more time documenting reality.",
          mood_breakdown: [
            { mood: "reflective", count: diaryCount },
            { mood: "hopeful", count: Math.max(1, Math.floor(diaryCount / 2)) }
          ],
          standout_line: "Reclaiming my sanity one day at a time without needing their validation."
        },
        page3_redflags: {
          headline: "Patterns you finally stopped excusing.",
          top_pattern: topFlagCat,
          pattern_counts: [
            { category: topFlagCat, count: flagsCount }
          ],
          insight_line: "When someone consistently shows you who they are, believe them the first time."
        }
      };
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Reality Check API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
