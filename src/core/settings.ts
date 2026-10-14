import type { AppSettings } from '../shared/types'
import { all, run } from './db'
import { bus } from './events'

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  density: 'comfortable',
  language: 'auto',
  smartInbox: true,
  groupNewsletters: true,
  groupNotifications: true,
  gatekeeper: 'off',
  undoSendSeconds: 10,
  markReadOnOpen: true,
  loadRemoteImages: 'contacts',
  blockTrackers: true,
  notifications: true,
  notificationSound: true,
  launchAtLogin: false,
  minimizeToTray: true,
  ai: {
    provider: 'ollama',
    ollamaUrl: 'http://127.0.0.1:11434',
    ollamaModel: 'gemma3:12b',
    ollamaEmbedModel: '',
    claudeModel: 'claude-opus-5-5',
    openaiUrl: '',
    openaiModel: '',
    anthropicCompatUrl: '',
    anthropicCompatModel: '',
    smartCategorize: false,
    autoSummaries: false,
    replyLanguage: 'auto',
    persona: '',
  },
  snoozeMorningHour: 8,
  snoozeEveningHour: 18,
  weekStartsOn: 1,
  defaultAccountId: null,
  // this machine's zone (a home server should have its zone set: timedatectl / TZ)
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  swipeLeft: 'archive',
  swipeRight: 'pin',
  conversationOrder: 'newest-bottom',
  bodyPrefetchDays: 30,
}

let cache: AppSettings | null = null

function deepMerge<T>(base: T, over: unknown): T {
  if (!over || typeof over !== 'object' || Array.isArray(over)) return base
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
    const b = out[k]
    out[k] = b && typeof b === 'object' && !Array.isArray(b) && v && typeof v === 'object' ? deepMerge(b, v) : v
  }
  return out as T
}

export function getSettings(): AppSettings {
  if (cache) return cache
  const rows = all<{ key: string; value: string }>('SELECT key, value FROM settings')
  const stored: Record<string, unknown> = {}
  for (const r of rows) {
    try {
      stored[r.key] = JSON.parse(r.value)
    } catch {
      /* ignore broken value */
    }
  }
  cache = deepMerge(DEFAULT_SETTINGS, stored)
  return cache
}

export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const next = deepMerge(current, patch)
  for (const [k, v] of Object.entries(patch)) {
    run(
      'INSERT INTO settings(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      k,
      JSON.stringify((next as unknown as Record<string, unknown>)[k] ?? v),
    )
  }
  cache = next
  bus.emitEvent({ type: 'settings-changed' })
  return next
}

/** Drop the in-memory copy (another process may have changed settings). */
export function invalidateSettings(): void {
  cache = null
}

export function getKV<T>(key: string, fallback: T): T {
  const row = all<{ value: string }>('SELECT value FROM settings WHERE key = ?', `kv:${key}`)[0]
  if (!row) return fallback
  try {
    return JSON.parse(row.value) as T
  } catch {
    return fallback
  }
}

export function setKV(key: string, value: unknown): void {
  run(
    'INSERT INTO settings(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    `kv:${key}`,
    JSON.stringify(value),
  )
}
