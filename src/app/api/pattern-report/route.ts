import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zinput'; // Wait, let's use standard @google/genai or whatever they used.

// Let's use @google/genai as requested, or the standard fetch API for Gemini.
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const schema = {
  description: "Pattern report for the user's healing journey",
  type: "object",
  properties: {
    page1_overview: {
      type: "object",
      properties: {
        headline: { type: "string", description: "one short punchy line, max ~8 words, summarizing the period" },
        stat_highlight: { type: "string", description: "one standout number/stat as a short phrase, e.g. '6 entries this week'" },
        subtext: { type: "string", description: "one supporting line, max ~15 words" }
      },
      required: ["headline", "stat_highlight", "subtext"]
    },
    page2_diary: {
      type: "object",
      properties: {
        headline: { type: "string", description: "short line about their diary activity, max ~8 words" },
        coping_comparison: { type: "string", description: "one line comparing tone/coping now vs the earlier period, max ~20 words, specific not generic" },
        mood_breakdown: {
          type: "array",
          items: {
            type: "object",
            properties: {
              mood: { type: "string" },
              count: { type: "number" }
            },
            required: ["mood", "count"]
          }
        },
        standout_line: { type: "string", description: "a short paraphrased (not quoted verbatim) reflection of a theme from their own writing, max ~15 words" }
      },
      required: ["headline", "coping_comparison", "mood_breakdown", "standout_line"]
    },
    page3_redflags: {
      type: "object",
      properties: {
        headline: { type: "string", description: "short line, max ~8 words" },
        top_pattern: { type: "string", description: "the most frequently logged category this period" },
        pattern_counts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              count: { type: "number" }
            },
            required: ["category", "count"]
          }
        },
        insight_line: { type: "string", description: "one plain, non-vindictive insight, max ~20 words" }
      },
      required: ["headline", "top_pattern", "pattern_counts", "insight_line"]
    }
  },
  required: ["page1_overview", "page2_diary", "page3_redflags"]
};

export async function POST(req: Request) {
  try {
    const { diary_entries_current, diary_entries_comparison, red_flags_current } = await req.json();

    const prompt = `
System: You are analyzing personal diary and red-flag log data for a breakup-recovery app's periodic recap feature. Output ONLY valid JSON matching this exact schema — no prose, no markdown, no explanation outside the JSON.

Tone: warm but plain-spoken, a little wry, never clinical, never saccharine. Short lines — this text will be rendered in large typography on a mobile screen, not read as a paragraph.
IMPORTANT: standout_line MUST be paraphrased, not quoted verbatim. Do not use their exact words.

Diary entries (current period):
${JSON.stringify(diary_entries_current, null, 2)}

Diary entries (comparison period):
${JSON.stringify(diary_entries_comparison, null, 2)}

Red flags (current period):
${JSON.stringify(red_flags_current, null, 2)}

Ensure the output is strictly valid JSON matching the schema format:
{
  "page1_overview": { "headline": "...", "stat_highlight": "...", "subtext": "..." },
  "page2_diary": { "headline": "...", "coping_comparison": "...", "mood_breakdown": [{"mood": "...", "count": 0}], "standout_line": "..." },
  "page3_redflags": { "headline": "...", "top_pattern": "...", "pattern_counts": [{"category": "...", "count": 0}], "insight_line": "..." }
}
`;

    // Fallback logic for model selection
    let result;
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });
      result = await model.generateContent(prompt);
    } catch (e: any) {
      let errorMsg = e.message?.toLowerCase() || '';
      const isModelError = errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('503') || errorMsg.includes('500') || errorMsg.includes('unavailable') || errorMsg.includes('overloaded');

      if (isModelError) {
        console.warn(`Primary model failed (${e.message}). Fetching available models for fallback...`);
        
        // Fetch list of available models for this specific API key
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const modelsData = await modelsRes.json();
        
        if (!modelsRes.ok) {
          throw new Error("Failed to list models: " + JSON.stringify(modelsData));
        }

        // Get all valid gemini models that support text generation
        const validModels = modelsData.models?.filter((m: any) => 
          m.name.includes('gemini') && 
          !m.name.includes('2.5') &&
          !m.name.includes('vision') &&
          m.supportedGenerationMethods?.includes('generateContent')
        );

        if (!validModels || validModels.length === 0) {
          throw new Error("No Gemini models found for this API key. Available: " + JSON.stringify(modelsData.models?.map((m:any) => m.name)));
        }

        // Try models one by one until one succeeds
        let lastError = e;
        for (const m of validModels) {
          try {
            const cleanModelName = m.name.replace('models/', '');
            // skip the one that just failed to save time (Google aliases 1.5-flash to flash-latest sometimes)
            if (errorMsg.includes(cleanModelName.toLowerCase())) continue;
            
            console.log(`Trying fallback model: ${cleanModelName}`);
            const fallbackModel = genAI.getGenerativeModel({
              model: cleanModelName,
              generationConfig: { responseMimeType: "application/json" },
            });
            
            result = await fallbackModel.generateContent(prompt);
            console.log(`Success with fallback model: ${cleanModelName}`);
            lastError = null;
            break;
          } catch (fallbackErr: any) {
            console.warn(`Fallback ${m.name} failed:`, fallbackErr.message);
            lastError = fallbackErr;
          }
        }
        
        if (lastError) {
          throw lastError; // if we exhausted all models and none worked
        }
      } else {
        throw e;
      }
    }

    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown JSON block
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(cleanedText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Pattern Report Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
