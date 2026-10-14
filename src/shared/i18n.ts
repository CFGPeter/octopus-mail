// Tiny i18n shared by the app, the engine, the CLI and the home server.
// English source strings are the keys: t('New message') returns the text from locales/<lang>
// (pl, fr, es) when the UI language is that language, and the English text otherwise.
//
//   t('Snoozed until {when}', { when })          placeholders in {braces}
//   tp(n, '{n} message', '{n} messages')          plurals ({n} is filled in; plural arrays are [one, few, many])
//
// Never call t() at module scope in engine/main/CLI code: the language is set at startup,
// after modules are loaded. (The renderer loads the UI after choosing the language.)
import es from './locales/es'
import fr from './locales/fr'
import pl from './locales/pl'

export type Lang = 'en' | 'pl' | 'fr' | 'es'
export type LangSetting = 'auto' | Lang

export const LANGUAGES: { value: LangSetting; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polski' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
]

export interface Dictionary {
  strings: Record<string, string>
  /**
   * keyed by the English singular form: [one, few, many].
   * Polish uses all three. French and Spanish have two forms: index 0 is the singular, indices 1 and 2
   * both hold the plural (tp() picks 0 or 2).
   */
  plurals: Record<string, [string, string, string]>
}

const DICTS: Partial<Record<Lang, Dictionary>> = { pl, fr, es }
const LANG_CODES: readonly string[] = ['en', 'pl', 'fr', 'es']
const isLang = (v: unknown): v is Lang => typeof v === 'string' && LANG_CODES.includes(v)

let lang: Lang = 'en'
let systemLocale = 'en-US'

/** System locale such as "pl-PL" or "fr-CA" → UI language (English for everything else). */
export function detectLang(locale: string | undefined | null): Lang {
  const l = (locale || '').toLowerCase()
  if (/^pl\b/.test(l)) return 'pl'
  if (/^fr\b/.test(l)) return 'fr'
  if (/^es\b/.test(l)) return 'es'
  return 'en'
}

/** Pick the UI language from the setting, the OCTO_LANG override and the system locale. */
export function initLang(setting: LangSetting | undefined, locale: string | undefined | null): Lang {
  if (locale) systemLocale = locale
  const env = typeof process !== 'undefined' ? process.env?.OCTO_LANG : undefined
  const forced = isLang(env) ? env : null
  lang = forced ?? (isLang(setting) ? setting : detectLang(locale))
  return lang
}

export function setLang(l: Lang): void {
  lang = l
}

export function getLang(): Lang {
  return lang
}

/** Locale for dates and numbers: pl-PL, fr-FR, es-ES; English UI → the system's English variant or en-GB. */
export function dateLocale(): string {
  if (lang === 'pl') return 'pl-PL'
  if (lang === 'fr') return 'fr-FR'
  if (lang === 'es') return 'es-ES'
  return /^en\b/i.test(systemLocale) ? systemLocale : 'en-GB'
}

function fill(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m))
}

export function t(en: string, vars?: Record<string, string | number>): string {
  return fill(DICTS[lang]?.strings[en] ?? en, vars)
}

/** Index into the [one, few, many] array of a plural entry. */
function pluralIndex(l: Lang, n: number): 0 | 1 | 2 {
  if (l === 'fr') return n < 2 ? 0 : 2 // 0 and 1 are singular
  if (l === 'es') return n === 1 ? 0 : 2
  if (n === 1) return 0
  const m10 = n % 10
  const m100 = n % 100
  return m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 1 : 2
}

export function tp(n: number, one: string, other: string, vars?: Record<string, string | number>): string {
  const all = { n, ...vars }
  const forms = DICTS[lang]?.plurals[one]
  if (forms) return fill(forms[pluralIndex(lang, Math.abs(n))], all)
  return fill(Math.abs(n) === 1 ? one : other, all)
}
