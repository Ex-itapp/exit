export interface AIOptions {
  prompt?: string;
  systemPrompt?: string;
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  tier?: 'fast' | 'heavy' | 'embed' | 'classifier' | 'persona';
  temperature?: number;
  jsonMode?: boolean;
}

/**
 * DeepSeek AI Router Helper
 * Routes requests to DeepSeek's latest models:
 * - deepseek-v4-pro for heavy tasks, persona simulations, and complex reasoning
 * - deepseek-v4-flash for lightning-fast responses and classification
 */
export async function callAIRouter(options: AIOptions): Promise<string | null> {
  const {
    prompt,
    systemPrompt,
    messages = [],
    temperature = 0.7,
    jsonMode = false,
  } = options;

  const deepseekKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  if (!deepseekKey) {
    console.error('DeepSeek API Key is missing. Please set DEEPSEEK_API_KEY in your environment.');
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

  // Always use the latest deepseek-v4-flash model for all tiers
  const model = 'deepseek-v4-flash';

  try {
    console.log('[DeepSeek Request Info]', {
      model,
      messagesCount: formattedMessages.length,
      temperature,
      jsonMode,
      systemPromptPreview: systemPrompt ? systemPrompt.substring(0, 100) + '...' : 'none',
      latestMessagePreview: formattedMessages.length > 0 
        ? formattedMessages[formattedMessages.length - 1].content.substring(0, 100) + '...'
        : 'none'
    });

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`,
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
      console.error('[DeepSeek API Error Response]', {
        status: res.status,
        statusText: res.statusText,
        model,
        errorBody: errorText
      });
      return null;
    }

    const data = await res.json();
    console.log('[DeepSeek Response Success]', {
      model,
      choicesCount: data.choices?.length,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens
    });

    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error('[DeepSeek API Exception]', {
      errorMessage: e instanceof Error ? e.message : String(e),
      errorStack: e instanceof Error ? e.stack : undefined,
      rawError: e
    });
    return null;
  }
}

/**
 * Generate text embedding (returns null as DeepSeek focuses on LLM chat models)
 */
export async function generateEmbedding(_text: string): Promise<number[] | null> {
  return null;
}

