export interface AIOptions {
  prompt?: string;
  systemPrompt?: string;
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  tier?: 'fast' | 'heavy' | 'embed' | 'classifier' | 'persona';
  temperature?: number;
  jsonMode?: boolean;
}

export type AIProvider = 'openai' | 'deepseek' | 'anthropic' | 'gemini';

const ACTIVE_PROVIDER: AIProvider = 'gemini';

export async function callAIRouter(options: AIOptions): Promise<string | null> {
  const {
    prompt,
    systemPrompt,
    messages = [],
    temperature = 0.7,
    jsonMode = false,
  } = options;

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (!apiKey) {
    console.error(`AI API Key is missing for provider ${ACTIVE_PROVIDER}. Please set GEMINI_API_KEY in your environment.`);
    return null;
  }

  // Model selection based on tier
  let model = 'gemini-3.6-flash';
  if (options.tier === 'heavy') {
    model = 'gemini-3.1-pro-preview';
  } else if (options.tier === 'classifier') {
    model = 'gemini-3.5-flash-lite';
  }

  // Build Gemini-format contents array
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  if (messages.length > 0) {
    for (const m of messages) {
      // Gemini uses "user" and "model" roles (not "assistant")
      // System messages get folded into systemInstruction below
      if (m.role === 'system') continue;
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      });
    }
  } else if (prompt) {
    contents.push({ role: 'user', parts: [{ text: prompt }] });
  }

  // Build system instruction from systemPrompt + any system messages
  let fullSystemInstruction = systemPrompt || '';
  const systemMessages = messages.filter(m => m.role === 'system');
  if (systemMessages.length > 0) {
    fullSystemInstruction = systemMessages.map(m => m.content).join('\n\n') + (fullSystemInstruction ? '\n\n' + fullSystemInstruction : '');
  }

  try {
    console.log(`[AI Router Request - ${ACTIVE_PROVIDER}]`, {
      model,
      contentsCount: contents.length,
      temperature,
      jsonMode,
      hasSystemInstruction: !!fullSystemInstruction,
    });

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
      console.error(`[AI Router API Error - ${ACTIVE_PROVIDER}]`, {
        status: res.status,
        statusText: res.statusText,
        model,
        errorBody: errorText
      });
      return null;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;

  } catch (e) {
    console.error(`[AI Router Exception - ${ACTIVE_PROVIDER}]`, {
      errorMessage: e instanceof Error ? e.message : String(e)
    });
    return null;
  }
}

/**
 * Generate text embedding
 */
export async function generateEmbedding(_text: string): Promise<number[] | null> {
  return null;
}
