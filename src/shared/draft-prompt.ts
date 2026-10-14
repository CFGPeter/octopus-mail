// Writing instructions for AI reply drafts. Shared so Settings can show the built-in default;
// the engine re-exports it from core/ai/features.ts.

/** Max length of the user's own writing instructions. */
export const MAX_DRAFT_PROMPT = 4000

/** Built-in writing instructions: short and numbered, so small models follow them. */
export const DEFAULT_DRAFT_PROMPT = `Rules for the reply:
1. Answer every question asked in the last message.
2. Start with a short greeting that fits the conversation.
3. Be brief and clear. Use plain sentences.
4. Never invent facts, dates or amounts. If something is missing, write [to fill in].
5. No subject line, no quoted text, no signature.`
