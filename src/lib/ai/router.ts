export interface AIOptions {
  prompt?: string;
  systemPrompt?: string;
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  tier?: 'fast' | 'heavy' | 'embed' | 'classifier' | 'persona';
  temperature?: number;
  jsonMode?: boolean;
}

export type AIProvider = 'openai' | 'deepseek' | 'anthropic' | 'gemini';

// Currently configured to use an OpenAI-compatible API (defaults to DeepSeek)
// This can be easily swapped when the new APIs are ready.
const ACTIVE_PROVIDER: AIProvider = 'deepseek';

export async function callAIRouter(options: AIOptions): Promise<string | null> {
  const {
    prompt,
    systemPrompt,
    messages = [],
    temperature = 0.7,
    jsonMode = false,
  } = options;

  // The API key structure can be adapted based on the chosen provider
  const apiKey = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1';

  if (!apiKey) {
    console.error(`AI API Key is missing for provider ${ACTIVE_PROVIDER}. Please set AI_API_KEY in your environment.`);
    return null;
  }

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

  // Model selection based on tier (can be configured per provider)
  let model = 'deepseek-chat';
  
  if (ACTIVE_PROVIDER === 'deepseek') {
    model = 'deepseek-chat'; // Or deepseek-reasoner based on tier, keeping simple for now
  } else if (ACTIVE_PROVIDER === 'openai') {
    model = options.tier === 'heavy' ? 'gpt-4o' : 'gpt-4o-mini';
  }

  try {
    console.log(`[AI Router Request - ${ACTIVE_PROVIDER}]`, {
      model,
      messagesCount: formattedMessages.length,
      temperature,
      jsonMode,
    });

    // We assume an OpenAI-compatible endpoint structure for DeepSeek/OpenAI
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
      }),
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
    return data.choices?.[0]?.message?.content?.trim() || null;
    
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
