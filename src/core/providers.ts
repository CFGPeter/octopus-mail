import dns from 'node:dns/promises'
import { t } from '../shared/i18n'
import type { AuthKind } from '../shared/types'

export interface ServerConfig {
  provider: string
  label: string
  imap_host: string
  imap_port: number
  imap_secure: boolean
  smtp_host: string
  smtp_port: number
  smtp_secure: boolean
  auth: AuthKind[]
  /** Short hint shown in the account wizard (e.g. "use an app password"). */
  hint?: string
  is_gmail?: boolean
}

const P = (
  provider: string,
  label: string,
  imap: string,
  smtp: string,
  smtpPort = 465,
  extra: Partial<ServerConfig> = {},
): ServerConfig => ({
  provider,
  label,
  imap_host: imap,
  imap_port: 993,
  imap_secure: true,
  smtp_host: smtp,
  smtp_port: smtpPort,
  smtp_secure: smtpPort === 465,
  auth: ['password'],
  ...extra,
})

/** Known providers. Hints are English source texts: use presets() / discover() for the UI language. */
export const PRESETS: Record<string, ServerConfig> = {
  gmail: P('gmail', 'Gmail / Google Workspace', 'imap.gmail.com', 'smtp.gmail.com', 465, {
    auth: ['password', 'oauth-google'],
    is_gmail: true,
    hint: 'Gmail: create an “app password” (myaccount.google.com → Security → App passwords) or sign in with Google OAuth.',
  }),
  outlook: P('outlook', 'Outlook / Hotmail / Microsoft 365', 'outlook.office365.com', 'smtp.office365.com', 587, {
    auth: ['oauth-microsoft', 'password'],
    hint: 'Microsoft usually requires OAuth sign-in; a password works only on accounts with IMAP/SMTP AUTH turned on.',
  }),
  yahoo: P('yahoo', 'Yahoo Mail', 'imap.mail.yahoo.com', 'smtp.mail.yahoo.com', 465, { hint: 'Yahoo: use an app password.' }),
  icloud: P('icloud', 'iCloud Mail', 'imap.mail.me.com', 'smtp.mail.me.com', 587, { hint: 'iCloud: use an app-specific password from appleid.apple.com.' }),
  aol: P('aol', 'AOL Mail', 'imap.aol.com', 'smtp.aol.com', 465),
  fastmail: P('fastmail', 'Fastmail', 'imap.fastmail.com', 'smtp.fastmail.com', 465),
  zoho: P('zoho', 'Zoho Mail', 'imap.zoho.eu', 'smtp.zoho.eu', 465),
  mailcom: P('mailcom', 'mail.com', 'imap.mail.com', 'smtp.mail.com', 587, {
    hint: 'mail.com: turn on POP3/IMAP access in the mailbox settings on mail.com.',
  }),
  infomaniak: P('infomaniak', 'Infomaniak', 'mail.infomaniak.com', 'mail.infomaniak.com', 465, {
    hint: 'Infomaniak: log in with the full address. With two-step verification on, create a device password (Infomaniak Manager → Mail → the mailbox → Device passwords).',
  }),
  gmx: P('gmx', 'GMX', 'imap.gmx.com', 'mail.gmx.com', 587),
  homepl: P('homepl', 'home.pl', '', '', 465, {
    hint: 'home.pl: the server is usually the domain name or serverXXXX.home.pl (home.pl panel → Mail).',
  }),
  wp: P('wp', 'WP Poczta', 'imap.wp.pl', 'smtp.wp.pl', 465, { hint: 'WP: turn on IMAP/SMTP access in the mail settings.' }),
  o2: P('o2', 'o2.pl', 'poczta.o2.pl', 'poczta.o2.pl', 465),
  onet: P('onet', 'Onet Poczta', 'imap.poczta.onet.pl', 'smtp.poczta.onet.pl', 465, { hint: 'Onet: turn on access for mail programs.' }),
  interia: P('interia', 'Interia', 'poczta.interia.pl', 'poczta.interia.pl', 465),
  yandex: P('yandex', 'Yandex', 'imap.yandex.com', 'smtp.yandex.com', 465),
  proton: P('proton', 'Proton Mail (Bridge)', '127.0.0.1', '127.0.0.1', 1025, {
    imap_port: 1143,
    imap_secure: false,
    smtp_secure: false,
    hint: 'Proton requires Proton Mail Bridge to be running.',
  }),
}

/** A preset with its hint in the UI language. */
function localized(cfg: ServerConfig): ServerConfig {
  return cfg.hint ? { ...cfg, hint: t(cfg.hint) } : { ...cfg }
}

/** All presets for the account wizard (hints in the UI language). */
export function presets(): Record<string, ServerConfig> {
  return Object.fromEntries(Object.entries(PRESETS).map(([k, v]) => [k, localized(v)]))
}

const DOMAIN_MAP: Record<string, string> = {
  'gmail.com': 'gmail',
  'googlemail.com': 'gmail',
  'outlook.com': 'outlook',
  'hotmail.com': 'outlook',
  'live.com': 'outlook',
  'msn.com': 'outlook',
  'outlook.pl': 'outlook',
  'yahoo.com': 'yahoo',
  'icloud.com': 'icloud',
  'me.com': 'icloud',
  'mac.com': 'icloud',
  'aol.com': 'aol',
  'fastmail.com': 'fastmail',
  'zoho.com': 'zoho',
  'zohomail.eu': 'zoho',
  'mail.com': 'mailcom',
  'email.com': 'mailcom',
  'usa.com': 'mailcom',
  'ik.me': 'infomaniak',
  'ikmail.com': 'infomaniak',
  'etik.com': 'infomaniak',
  'infomaniak.ch': 'infomaniak',
  'gmx.com': 'gmx',
  'gmx.net': 'gmx',
  'gmx.de': 'gmx',
  'wp.pl': 'wp',
  'o2.pl': 'o2',
  'tlen.pl': 'o2',
  'onet.pl': 'onet',
  'op.pl': 'onet',
  'vp.pl': 'onet',
  'interia.pl': 'interia',
  'interia.eu': 'interia',
  'yandex.com': 'yandex',
  'proton.me': 'proton',
  'protonmail.com': 'proton',
}

const MX_MAP: [RegExp, string][] = [
  [/google(mail)?\.com$|googlemail\.com$/i, 'gmail'],
  [/outlook\.com$|protection\.outlook\.com$/i, 'outlook'],
  [/yahoodns\.net$/i, 'yahoo'],
  [/icloud\.com$|me\.com$/i, 'icloud'],
  [/messagingengine\.com$/i, 'fastmail'],
  [/zoho\.(com|eu)$/i, 'zoho'],
  [/mail\.com$|gmx\.(net|com)$/i, 'mailcom'],
  [/infomaniak\.(ch|com)$/i, 'infomaniak'],
  [/home\.pl$/i, 'homepl'],
]

async function fetchText(url: string, timeoutMs = 6000): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

/** Parse a Thunderbird autoconfig (ISPDB) XML document. */
function parseAutoconfig(xml: string, email: string): ServerConfig | null {
  const [local, domain] = email.split('@')
  const sub = (s: string) =>
    s.replace(/%EMAILADDRESS%/g, email).replace(/%EMAILLOCALPART%/g, local).replace(/%EMAILDOMAIN%/g, domain)
  const block = (type: 'incomingServer' | 'outgoingServer', proto: string) => {
    const re = new RegExp(`<${type}[^>]*type="${proto}"[^>]*>([\\s\\S]*?)</${type}>`, 'gi')
    const found: { host: string; port: number; socket: string }[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(xml))) {
      const body = m[1]
      const tag = (t: string) => (body.match(new RegExp(`<${t}>([^<]*)</${t}>`, 'i')) || [])[1]?.trim() || ''
      found.push({ host: sub(tag('hostname')), port: Number(tag('port')), socket: tag('socketType') })
    }
    return found.find((f) => f.socket === 'SSL') || found.find((f) => f.socket === 'STARTTLS') || found[0]
  }
  const imap = block('incomingServer', 'imap')
  const smtp = block('outgoingServer', 'smtp')
  if (!imap || !smtp) return null
  return {
    provider: 'autoconfig',
    label: (xml.match(/<displayName>([^<]*)<\/displayName>/i) || [])[1] || domain,
    imap_host: imap.host,
    imap_port: imap.port || 993,
    imap_secure: imap.socket === 'SSL',
    smtp_host: smtp.host,
    smtp_port: smtp.port || 465,
    smtp_secure: smtp.socket === 'SSL',
    auth: ['password'],
  }
}

async function mxHosts(domain: string): Promise<string[]> {
  try {
    const recs = await dns.resolveMx(domain)
    return recs.sort((a, b) => a.priority - b.priority).map((r) => r.exchange.toLowerCase())
  } catch {
    return []
  }
}

/** Best-effort discovery of IMAP/SMTP settings for an address. */
export async function discover(email: string): Promise<ServerConfig | null> {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return null
  const known = DOMAIN_MAP[domain]
  if (known) return localized(PRESETS[known])

  const mx = await mxHosts(domain)
  for (const host of mx) {
    const hit = MX_MAP.find(([re]) => re.test(host))
    if (hit) {
      const preset = localized(PRESETS[hit[1]])
      if (hit[1] === 'homepl') {
        // home.pl serves IMAP/SMTP for hosted domains on the domain name itself.
        preset.imap_host = domain
        preset.smtp_host = domain
      }
      return preset
    }
  }

  const candidates = [
    `https://autoconfig.${domain}/mail/config-v1.1.xml?emailaddress=${encodeURIComponent(email)}`,
    `https://${domain}/.well-known/autoconfig/mail/config-v1.1.xml`,
    `https://autoconfig.thunderbird.net/v1.1/${domain}`,
  ]
  for (const mxHost of mx) {
    const parts = mxHost.split('.')
    if (parts.length >= 2) candidates.push(`https://autoconfig.thunderbird.net/v1.1/${parts.slice(-2).join('.')}`)
  }
  for (const url of candidates) {
    const xml = await fetchText(url)
    if (xml && xml.includes('incomingServer')) {
      const cfg = parseAutoconfig(xml, email)
      if (cfg) return cfg
    }
  }

  return {
    provider: 'imap',
    label: domain,
    imap_host: `imap.${domain}`,
    imap_port: 993,
    imap_secure: true,
    smtp_host: `smtp.${domain}`,
    smtp_port: 465,
    smtp_secure: true,
    auth: ['password'],
  }
}
