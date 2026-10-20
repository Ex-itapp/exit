export interface AIOptions {
  prompt?: string;
  systemPrompt?: string;
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  tier?: 'fast' | 'heavy' | 'embed' | 'classifier' | 'persona';
  temperature?: number;
  jsonMode?: boolean;
}

export type AIProvider = 'gemini' | 'groq' | 'openrouter';

/**
 * Call Groq (OpenAI-compatible) endpoint as a high-speed, reliable provider
 */
async function callGroq(options: AIOptions, apiKey: string): Promise<string | null> {
  const { prompt, systemPrompt, messages = [], temperature = 0.7, jsonMode = false } = options;

  const formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }

  for (const m of messages) {
    formattedMessages.push({
      role: m.role === 'system' ? 'system' : m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    });
  }

  if (prompt && messages.length === 0) {
    formattedMessages.push({ role: 'user', content: prompt });
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: formattedMessages,
        temperature,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
      })
    });

    if (!res.ok) {
      console.warn(`[Groq Error] status: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn('[Groq Exception]:', err);
    return null;
  }
}

/**
 * Call Gemini Generative Language API
 */
async function callGemini(options: AIOptions, apiKey: string): Promise<string | null> {
  const { prompt, systemPrompt, messages = [], temperature = 0.7, jsonMode = false } = options;

  let model = 'gemini-3.6-flash';
  if (options.tier === 'heavy') {
    model = 'gemini-3.1-pro-preview';
  } else if (options.tier === 'classifier') {
    model = 'gemini-3.5-flash-lite';
  }

  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  if (messages.length > 0) {
    for (const m of messages) {
      if (m.role === 'system') continue;
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      });
    }
  } else if (prompt) {
    contents.push({ role: 'user', parts: [{ text: prompt }] });
  }

  let fullSystemInstruction = systemPrompt || '';
  const systemMessages = messages.filter(m => m.role === 'system');
  if (systemMessages.length > 0) {
    fullSystemInstruction = systemMessages.map(m => m.content).join('\n\n') + (fullSystemInstruction ? '\n\n' + fullSystemInstruction : '');
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body: any = {
      contents,
      generationConfig: {
        temperature,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    };

    if (fullSystemInstruction) {
      body.systemInstruction = {
        parts: [{ text: fullSystemInstruction }]
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`[Gemini Error] status: ${res.status}, body: ${errorText.slice(0, 200)}`);
      return null;
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (err) {
    console.warn('[Gemini Exception]:', err);
    return null;
  }
}

/**
 * Universal Multi-Provider AI Router with automatic fallback
 */
export async function callAIRouter(options: AIOptions): Promise<string | null> {
  // 1. Try Gemini first if key exists
  const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (geminiKey) {
    const geminiRes = await callGemini(options, geminiKey);
    if (geminiRes) return geminiRes;
  }

  // 2. Automatic fallback to Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    console.log('[AI Router] Failing over to Groq...');
    const groqRes = await callGroq(options, groqKey);
    if (groqRes) return groqRes;
  }

  return null;
}

/**
 * Generate text embedding
 */
export async function generateEmbedding(_text: string): Promise<number[] | null> {
  return null;
}
