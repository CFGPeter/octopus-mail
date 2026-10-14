// Sign-in page of the home server's web UI, shown in the browser's language (Accept-Language).
import { detectLang, getLang, setLang, t, type Lang } from '../shared/i18n'

/** Accept-Language header → the most preferred supported UI language; English when neither is listed. */
export function langFromAcceptLanguage(header: string | string[] | undefined | null): Lang {
  const raw = Array.isArray(header) ? header.join(',') : header || ''
  const prefs = raw
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.map((p) => p.trim().match(/^q=([\d.]+)$/i)).find(Boolean)
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q[1]) : 1, i }
    })
    .filter((p) => p.tag && p.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i)
  for (const p of prefs) {
    if (detectLang(p.tag) === 'pl') return 'pl'
    if (/^en\b/.test(p.tag)) return 'en'
  }
  return 'en'
}

/** Run synchronous code with the UI language switched for one request (restored afterwards). */
export function withLang<T>(lang: Lang, fn: () => T): T {
  const prev = getLang()
  setLang(lang)
  try {
    return fn()
  } finally {
    setLang(prev)
  }
}

/** Default name of a browser paired through the sign-in page, e.g. "Phone (192.168.1.20)". */
export function browserDeviceName(lang: Lang, userAgent: string, ip: string): string {
  return withLang(lang, () => {
    const kind = /iphone|android|mobile/i.test(userAgent) ? t('Phone') : t('Browser')
    return `${kind} (${ip})`
  })
}

export type LoginError = 'too-many' | 'bad-code'

export function loginPage(lang: Lang, error?: LoginError): string {
  return withLang(lang, () => {
    const err = error === 'too-many' ? t('Too many attempts — wait 10 minutes.') : error === 'bad-code' ? t('Invalid or expired code.') : ''
    return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t('Octopus Mail — sign in')}</title>
<link rel="manifest" href="/manifest.webmanifest"><link rel="apple-touch-icon" href="/icon-192.png"><meta name="theme-color" content="#15151b">
<style>
:root{color-scheme:light dark;--a:#5b4cf0}
body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:"Segoe UI",system-ui,sans-serif;background:#f4f4f7;color:#1c1c22}
@media (prefers-color-scheme:dark){body{background:#141418;color:#ececf2}.card{background:#1e1e24!important;border-color:#2e2e37!important}input{background:#141418;color:#ececf2;border-color:#2e2e37!important}}
.card{width:min(380px,calc(100vw - 32px));background:#fff;border:1px solid #e3e3ea;border-radius:18px;padding:28px;box-sizing:border-box;text-align:center}
img{width:64px;height:64px}h1{font-size:20px;margin:12px 0 4px}p{color:#6b6b78;font-size:13.5px;margin:0 0 18px}
input{width:100%;box-sizing:border-box;height:44px;border:1px solid #e3e3ea;border-radius:10px;font-size:20px;letter-spacing:3px;text-align:center;text-transform:uppercase}
button{margin-top:12px;width:100%;height:42px;border:0;border-radius:10px;background:var(--a);color:#fff;font-size:15px;font-weight:600}
.err{color:#d93a3a;font-size:13px;margin-top:10px}
code{font-size:12.5px}
</style></head><body><form class="card" method="post" action="/api/login">
<img src="/logo.svg" alt="" onerror="this.remove()"><h1>Octopus Mail</h1>
<p>${t('Enter the pairing code from your home server.')}<br>${t('New code:')} <code>octo server pair</code><br>${t('or ask from a paired device')}</p>
<input name="code" placeholder="XXXX-XXXX" autocomplete="one-time-code" autofocus required maxlength="9">
<button type="submit">${t('Connect')}</button>${err ? `<div class="err">${err}</div>` : ''}
</form></body></html>`
  })
}
