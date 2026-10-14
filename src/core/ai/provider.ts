// LLM access: local Ollama by default, Anthropic Claude when the user adds an API key.
import Anthropic from '@anthropic-ai/sdk'
import { t } from '../../shared/i18n'
import type { AiResult } from '../../shared/types'
import { claudeKeyName, openaiKeyName, getSecret, setSecret, deleteSecret } from '../secrets'
import { getSettings } from '../settings'

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface CompleteOptions {
  system: string
  messages: ChatTurn[]
  maxTokens?: number
  json?: boolean
  onDelta?: (text: string) => void
  /** Claude effort level; small tasks (classification, quick replies) use 'low' */
  effort?: 'low' | 'medium' | 'high'
  signal?: AbortSignal
  provider?: 'ollama' | 'claude' | 'openai'
}

export function claudeModels(): { id: string; label: string }[] {
  return [
    { id: 'claude-opus-5-5', label: `Claude Opus 5.5 (${t('default, best')})` },
    { id: 'claude-sonnet-5-5', label: `Claude Sonnet 5.5 (${t('faster, cheaper')})` },
    { id: 'claude-haiku-5-5', label: `Claude Haiku 5.5 (${t('cheapest')})` },
    { id: 'claude-fable-5-1', label: `Claude Fable 5.1 (${t('most capable, most expensive')})` },
  ]
}

export function setClaudeKey(key: string | null): void {
  if (key) setSecret(claudeKeyName, key.trim())
  else deleteSecret(claudeKeyName)
}

export function hasClaudeKey(): boolean {
  return !!(getSecret(claudeKeyName) || process.env.ANTHROPIC_API_KEY)
}

function claudeClient(): Anthropic {
  const key = getSecret(claudeKeyName) || process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error(t('No Claude API key — add it in Settings → AI.'))
  return new Anthropic({ apiKey: key })
}

export function setOpenaiKey(key: string | null): void {
  if (key) setSecret(openaiKeyName, key.trim())
  else deleteSecret(openaiKeyName)
}

export function hasOpenaiKey(): boolean {
  return !!getSecret(openaiKeyName)
}

export function activeProvider(): 'ollama' | 'claude' | 'openai' | 'off' {
  return getSettings().ai.provider
}

export async function complete(opts: CompleteOptions): Promise<AiResult> {
  const provider = opts.provider || activeProvider()
  if (provider === 'off') throw new Error(t('AI features are turned off (Settings → AI).'))
  if (provider === 'claude') return completeClaude(opts)
  if (provider === 'openai') return completeOpenai(opts)
  return completeOllama(opts)
}

async function completeClaude(opts: CompleteOptions): Promise<AiResult> {
  const client = claudeClient()
  const model = getSettings().ai.claudeModel || 'claude-opus-5-5'
  const params = {
    model,
    max_tokens: opts.maxTokens ?? 16000,
    system: opts.system,
    messages: opts.messages,
    output_config: { effort: opts.effort ?? 'medium' },
    // on a safety decline the API retries on a suitable fallback model inside the same call
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default' as const,
  }
  let message: Anthropic.Beta.BetaMessage
  try {
    if (opts.onDelta) {
      const stream = client.beta.messages.stream(params, { signal: opts.signal })
      stream.on('text', (delta) => opts.onDelta!(delta))
      message = await stream.finalMessage()
    } else {
      message = await client.beta.messages.create(params, { signal: opts.signal })
    }
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error(t('Invalid Claude API key.'))
    if (e instanceof Anthropic.RateLimitError) throw new Error(t('Claude API rate limit reached — try again in a moment.'))
    if (e instanceof Anthropic.APIError) throw new Error(`Claude API (${e.status}): ${e.message}`)
    throw e
  }
  if (message.stop_reason === 'refusal') throw new Error(t('The model declined to do this task.'))
  const text = message.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
  return { text, provider: 'claude', model: message.model }
}

/** OpenAI-compatible chat completions (Mammouth, OpenRouter, LM Studio, …). */
async function completeOpenai(opts: CompleteOptions): Promise<AiResult> {
  const s = getSettings().ai
  const base = s.openaiUrl.trim().replace(/\/+$/, '')
  const key = getSecret(openaiKeyName)
  if (!base || !s.openaiModel.trim()) throw new Error(t('Set the API address and the model in Settings → AI.'))
  if (!key) throw new Error(t('No API key — add it in Settings → AI.'))
  const model = s.openaiModel.trim()
  const stream = !!opts.onDelta
  const body = (json: boolean) => ({
    model,
    stream,
    temperature: opts.json ? 0.1 : 0.4,
    max_tokens: opts.maxTokens ?? 2048,
    response_format: json ? { type: 'json_object' } : undefined,
    messages: [{ role: 'system', content: opts.system }, ...opts.messages],
  })
  const call = (json: boolean) =>
    fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body(json)),
      signal: opts.signal,
    })
  let r = await call(!!opts.json)
  // some providers reject response_format: retry once without it (parseJsonLoose copes with prose)
  if (r.status === 400 && opts.json) r = await call(false)
  if (r.status === 401 || r.status === 403) throw new Error(t('Invalid API key.'))
  if (r.status === 429) throw new Error(t('API rate limit or credit limit reached — try again later.'))
  if (!r.ok) throw new Error(`API (${r.status}): ${(await r.text()).slice(0, 300)}`)
  if (!stream) {
    const j = (await r.json()) as { choices?: { message?: { content?: string } }[] }
    return { text: stripThink(j.choices?.[0]?.message?.content || ''), provider: 'openai', model }
  }
  let text = ''
  const reader = r.body!.getReader()
  const dec = new TextDecoder()
  let buf = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let nl: number
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim()
      buf = buf.slice(nl + 1)
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (!data || data === '[DONE]') continue
      try {
        const piece = (JSON.parse(data) as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content || ''
        if (piece) {
          text += piece
          opts.onDelta?.(piece)
        }
      } catch {
        /* partial line */
      }
    }
  }
  return { text: stripThink(text), provider: 'openai', model }
}

export async function ollamaModels(): Promise<{ name: string; size: number }[]> {
  const base = getSettings().ai.ollamaUrl.replace(/\/$/, '')
  try {
    const r = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(4000) })
    if (!r.ok) return []
    const j = (await r.json()) as { models?: { name: string; size: number }[] }
    return (j.models || []).map((m) => ({ name: m.name, size: m.size }))
  } catch {
    return []
  }
}

async function completeOllama(opts: CompleteOptions): Promise<AiResult> {
  const s = getSettings().ai
  const base = s.ollamaUrl.replace(/\/$/, '')
  let model = s.ollamaModel
  const installed = await ollamaModels()
  if (!installed.length) throw new Error(t('Ollama is not responding at {url}. Start Ollama or switch AI to Claude.', { url: base }))
  if (!installed.some((m) => m.name === model)) {
    const pick = installed.find((m) => /gemma3:12b|qwen3:8b|qwen3\.5|gemma/.test(m.name)) || installed[0]
    model = pick.name
  }
  const body = {
    model,
    stream: !!opts.onDelta,
    think: false,
    format: opts.json ? 'json' : undefined,
    options: { temperature: opts.json ? 0.1 : 0.4, num_ctx: 16384, num_predict: opts.maxTokens ?? 2048 },
    messages: [{ role: 'system', content: opts.system }, ...opts.messages],
  }
  const r = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: opts.signal,
  })
  if (!r.ok) {
    const err = await r.text()
    // older models reject "think": retry once without it
    if (/think/i.test(err)) {
      const r2 = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, think: undefined }),
        signal: opts.signal,
      })
      if (!r2.ok) throw new Error(`Ollama: ${await r2.text()}`)
      return readOllama(r2, !!opts.onDelta, opts.onDelta, model)
    }
    throw new Error(`Ollama: ${err}`)
  }
  return readOllama(r, !!opts.onDelta, opts.onDelta, model)
}

async function readOllama(r: Response, streaming: boolean, onDelta: ((t: string) => void) | undefined, model: string): Promise<AiResult> {
  if (!streaming) {
    const j = (await r.json()) as { message?: { content?: string } }
    return { text: stripThink(j.message?.content || ''), provider: 'ollama', model }
  }
  let text = ''
  const reader = r.body!.getReader()
  const dec = new TextDecoder()
  let buf = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let nl: number
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim()
      buf = buf.slice(nl + 1)
      if (!line) continue
      try {
        const j = JSON.parse(line) as { message?: { content?: string } }
        const piece = j.message?.content || ''
        if (piece) {
          text += piece
          onDelta?.(piece)
        }
      } catch {
        /* partial line */
      }
    }
  }
  return { text: stripThink(text), provider: 'ollama', model }
}

function stripThink(s: string): string {
  return s.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
}

/** Parse JSON from a model reply that may be wrapped in prose or code fences. */
export function parseJsonLoose<T>(text: string, fallback: T): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.search(/[[{]/)
  if (start < 0) return fallback
  const open = candidate[start]
  const close = open === '{' ? '}' : ']'
  const end = candidate.lastIndexOf(close)
  if (end <= start) return fallback
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T
  } catch {
    return fallback
  }
}
