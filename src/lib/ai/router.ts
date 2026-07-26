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

  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

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
        console.warn(`Groq API Error (${res.status}): ${await res.text()}`);
        return null;
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) {
      console.warn('Groq API Exception:', e);
      return null;
    }
  };

  // Helper 2: Call OpenRouter API (OpenAI-compatible)
  const callOpenRouter = async (model = 'meta-llama/llama-3.3-70b-instruct'): Promise<string | null> => {
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
        console.warn(`OpenRouter API Error (${res.status}): ${await res.text()}`);
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
        console.warn(`Gemini API Error (${res.status}): ${await res.text()}`);
        return null;
      }
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch (e) {
      console.warn('Gemini API Exception:', e);
      return null;
    }
  };

  // ROUTING LOGIC BASED ON TIER
  if (tier === 'persona') {
    // 1. Try Groq 70B (High psychological fidelity, super fast)
    let reply = await callGroq('llama-3.3-70b-versatile');
    if (reply) return reply;

    // 2. Fallback to Gemini Pro / Flash (1M context, exceptional roleplay instruction adherence)
    reply = await callGemini('gemini-1.5-pro') || await callGemini('gemini-1.5-flash');
    if (reply) return reply;

    // 3. Fallback to OpenRouter 70B
    return await callOpenRouter('meta-llama/llama-3.3-70b-instruct');
  }

  if (tier === 'fast') {
    // 1. Try Groq LPU (Ultra fast ~300+ t/s)
    let reply = await callGroq('llama-3.3-70b-versatile');
    if (reply) return reply;

    // 2. Fallback to Groq 8B instant
    reply = await callGroq('llama-3.1-8b-instant');
    if (reply) return reply;

    // 3. Fallback to Gemini Flash
    reply = await callGemini('gemini-1.5-flash');
    if (reply) return reply;

    // 4. Fallback to OpenRouter
    return await callOpenRouter('meta-llama/llama-3.3-70b-instruct');
  }

  if (tier === 'heavy') {
    // 1. Try OpenRouter (Deep analytical instruction following)
    let reply = await callOpenRouter('mistralai/mistral-large-2411');
    if (reply) return reply;

    // 2. Fallback to Groq 70B
    reply = await callGroq('llama-3.3-70b-versatile');
    if (reply) return reply;

    // 3. Fallback to Gemini Pro/Flash
    return await callGemini('gemini-1.5-pro') || await callGemini('gemini-1.5-flash');
  }

  if (tier === 'classifier' || tier === 'embed') {
    // 1. Try Groq 8B instant (Lightning fast 1-token checks)
    let reply = await callGroq('llama-3.1-8b-instant');
    if (reply) return reply;

    // 2. Fallback to Gemini Flash 8B / Flash
    return await callGemini('gemini-1.5-flash-8b') || await callGemini('gemini-1.5-flash');
  }

  // Default fallback chain
  return await callGroq() || await callGemini() || await callOpenRouter();
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
