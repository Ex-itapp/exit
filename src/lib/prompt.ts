/**
 * Sanitize free-form user text before interpolating it into an AI prompt.
 *
 * Quotes/backticks/backslashes are escaped rather than stripped so prompts
 * keep natural punctuation (apostrophes, contractions) while preventing a
 * user message from breaking out of its quoted context. Input is also
 * length-capped to bound prompt size.
 */
export function sanitizeForPrompt(text: string, maxLength = 2000): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, maxLength);
}
