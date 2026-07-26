export interface AIOptions {
  prompt?: string;
  systemPrompt?: string;
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  tier?: 'fast' | 'heavy' | 'embed' | 'classifier' | 'persona';
  temperature?: number;
  jsonMode?: boolean;
}

/**
 * Multi-Provider AI Router Helper
 * Routes requests across Groq, OpenRouter, and Google Gemini based on task tier
 * to optimize for speed (Groq LPUs), heavy reasoning (OpenRouter/Gemini Pro), and rate limit resilience.
 */
export async function callAIRouter(options: AIOptions): Promise<string | null> {
  const {
    prompt,
    systemPrompt,
    messages = [],
    tier = 'fast',
    temperature = 0.7,
    jsonMode = false,
  } = options;

  const groqKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  // Build standard messages array
  const formattedMessages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }
  if (messages.length > 0) {
    formattedMessages.push(...messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
      content: m.content
    })));
  } else if (prompt) {
    formattedMessages.push({ role: 'user', content: prompt });
  }

  // Helper 1: Call Groq API (OpenAI-compatible /v1/chat/completions)
  const callGroq = async (model = 'llama-3.3-70b-versatile'): Promise<string | null> => {
    if (!groqKey) return null;
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
        }),
      });
      if (!res.ok) {
        console.warn(`Groq API Error (${res.status} on ${model}): ${await res.text()}`);
        return null;
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) {
      console.warn('Groq API Exception:', e);
      return null;
    }
  };

  // Helper 2: Call OpenRouter API (OpenAI-compatible) - uses :free suffix to prevent 402 on free keys
  const callOpenRouter = async (model = 'meta-llama/llama-3.3-70b-instruct:free'): Promise<string | null> => {
    if (!openRouterKey) return null;
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://unsent.app',
          'X-Title': 'UNSENT Breakup App'
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
        }),
      });
      if (!res.ok) {
        console.warn(`OpenRouter API Error (${res.status} on ${model}): ${await res.text()}`);
        return null;
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) {
      console.warn('OpenRouter API Exception:', e);
      return null;
    }
  };

  // Helper 3: Call Google Gemini API
  const callGemini = async (model = 'gemini-1.5-flash'): Promise<string | null> => {
    if (!geminiKey) return null;
    try {
      const geminiContents: any[] = [];
      let sysInst: any = undefined;

      formattedMessages.forEach(m => {
        if (m.role === 'system') {
          sysInst = { parts: [{ text: m.content }] };
        } else {
          geminiContents.push({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          });
        }
      });

      if (geminiContents.length === 0) return null;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey,
        },
        body: JSON.stringify({
          ...(sysInst ? { system_instruction: sysInst } : {}),
          contents: geminiContents,
          generationConfig: {
            temperature,
            ...(jsonMode ? { responseMimeType: 'application/json' } : {})
          }
        }),
      });
      if (!res.ok) {
        console.warn(`Gemini API Error (${res.status} on ${model}): ${await res.text()}`);
        return null;
      }
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch (e) {
      console.warn('Gemini API Exception:', e);
      return null;
    }
  };

  // ROUTING LOGIC BASED ON TIER (Strict order prioritizing Google Gemini)
  if (tier === 'persona') {
    return await callGemini('gemini-1.5-flash') ||
      await callGemini('gemini-2.0-flash') ||
      await callOpenRouter('google/gemini-2.0-flash-lite-preview-02-05:free') ||
      await callOpenRouter('google/gemini-2.0-pro-exp-02-05:free') ||
      await callGroq('llama-3.3-70b-versatile') ||
      await callGroq('llama-3.1-8b-instant') ||
      await callOpenRouter('meta-llama/llama-3.3-70b-instruct:free') ||
      await callGroq('mixtral-8x7b-32768') ||
      await callOpenRouter('mistralai/mistral-7b-instruct:free');
  }

  if (tier === 'fast') {
    return await callGemini('gemini-1.5-flash') ||
      await callGemini('gemini-2.0-flash') ||
      await callOpenRouter('google/gemini-2.0-flash-lite-preview-02-05:free') ||
      await callGroq('llama-3.1-8b-instant') ||
      await callGroq('llama-3.3-70b-versatile');
  }

  if (tier === 'heavy') {
    return await callGemini('gemini-1.5-pro') ||
      await callGemini('gemini-1.5-flash') ||
      await callOpenRouter('google/gemini-2.0-pro-exp-02-05:free') ||
      await callOpenRouter('meta-llama/llama-3.3-70b-instruct:free') ||
      await callGroq('llama-3.3-70b-versatile');
  }

  if (tier === 'classifier' || tier === 'embed') {
    return await callGemini('gemini-1.5-flash') ||
      await callOpenRouter('google/gemini-2.0-flash-lite-preview-02-05:free') ||
      await callGroq('llama-3.1-8b-instant');
  }

  // Default fallback chain
  return await callGemini('gemini-1.5-flash') ||
    await callOpenRouter('google/gemini-2.0-flash-lite-preview-02-05:free') ||
    await callGroq('llama-3.3-70b-versatile') ||
    await callOpenRouter('meta-llama/llama-3.3-70b-instruct:free');
}

/**
 * Generate 768-dimensional text embedding for Memory Bank semantic similarity search
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || !text.trim()) return null;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey,
      },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: text.trim() }] }
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.embedding?.values || null;
  } catch (e) {
    console.warn('Embedding generation error:', e);
    return null;
  }
}
