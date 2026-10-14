// Smart Inbox: sender-based categorisation (people / notifications / newsletters),
// the contact book that backs it, and GateKeeper (new-sender screening).
import type { Address, Category, Contact } from '../shared/types'
import { all, get, now, run, type Row } from './db'

export interface CategorizeInput {
  fromEmail: string | null
  fromName?: string | null
  listUnsubscribe?: string | null
  listId?: string | null
  precedence?: string | null
  autoSubmitted?: string | null
  isOutgoing?: boolean
  gmailCategory?: string | null
  headersHint?: string | null
}

const NOTIFY_LOCAL =
  /^(no-?reply|do-?not-?reply|donotreply|noreply-[\w-]+|notifications?|notify|alerts?|alert-?\w*|mailer-daemon|postmaster|bounces?|automated|auto|system|robot|security|account(s)?|accounts-noreply|billing|invoices?|receipts?|orders?|order-update|shipping|support|helpdesk|service|calendar-notification|reminders?|status|updates?|verify|verification|confirm|password|admin|info-noreply|steam|github|jira|confluence|notification-\w+|powiadomieni[ae]|powiadamianie|nie-?odpowiadaj|brak-?odpowiedzi|faktur[ay]?|e-?faktur[ay]?|rachunki|platnosci|zamowieni[ae]|wysylk[ai]|przesylki|bok|obsluga|obsluga-klienta|kontakt-noreply|konto|bezpieczenstwo|automat|ne-?pas-?repondre|ne-?pas-?repondez|nepasrepondre|alertes?|factures?|facturation|commandes?|livraisons?|expeditions?|suivi|confirmations?|compte|comptes|securite|paiements?|recus?|service-?clients?|assistance|rappels?|reservations?|billetterie|no-?contestar|no-?responder|noresponder|notificaci[oó]n(es)?|notificacion(es)?|alertas?|facturas?|facturaci[oó]n|facturacion|pedidos?|envios?|cuenta|seguridad|pagos?|recibos?|soporte|atencion-?al-?cliente|recordatorios?|reservas?|confirmaci[oó]n|confirmacion)([+._-].*)?$/i
const NEWS_LOCAL =
  /^(news|newsletters?|marketing|hello|hi|hey|team|digest|weekly|daily|monthly|promo(tions)?|offers?|deals|sales?|shop|store|community|events?|editor(s)?|editorial|insider|members?|club|rewards|campaigns?|oferty?|promocje|nowosci|aktualnosci|sklep|biuletyn|actualit[eé]s?|actualites?|nouveaut[eé]s?|nouveautes?|offres?|promotions?|soldes|boutique|magasin|lettre-?info|infolettre|abonn[eé]s?|communaut[eé]|communaute|[eé]v[eé]nements?|evenements?|bons-?plans|bonjour|novedades|ofertas?|promociones|bolet[ií]n|boletin|noticias|tienda|comunidad|eventos|rebajas|suscriptores|hola)([+._-].*)?$/i
const NOTIFY_DOMAINS =
  /(^|\.)(github\.com|gitlab\.com|bitbucket\.org|atlassian\.net|steampowered\.com|steamcommunity\.com|accounts\.google\.com|google\.com|facebookmail\.com|linkedin\.com|slack\.com|discord\.com|paypal\.(com|pl)|stripe\.com|apple\.com|microsoft\.com|amazon\.(com|pl|de)|allegro\.pl|inpost\.pl|dpd\.(com|pl)|ups\.com|fedex\.com|dhl\.(com|pl)|zoom\.us|calendly\.com|notion\.so|figma\.com|trello\.com|asana\.com|youtube\.com|twitch\.tv|epicgames\.com|itch\.io|humblebundle\.com|patreon\.com|kickstarter\.com|mbank\.pl|pkobp\.pl|ing\.pl|santander\.pl|revolut\.com|wise\.com|gouv\.fr|gob\.es|laposte\.fr|colissimo\.fr|chronopost\.fr|sncf(-connect)?\.com|ameli\.fr|caf\.fr|edf\.fr|engie\.fr|boursorama\.com|boursobank\.com|credit-agricole\.fr|lcl\.fr|societegenerale\.fr|bnpparibas\.com|cdiscount\.com|fnac\.com|leboncoin\.fr|vinted\.(fr|com)|doctolib\.fr|blablacar\.com|airbnb\.(com|fr)|booking\.com|uber\.com|deliveroo\.(fr|com)|infomaniak\.com|post\.ch|sbb\.ch|correos\.es|seur\.com|mrw\.es|cabify\.com|glovoapp\.com|wallapop\.com|elcorteingles\.es|bbva\.(com|es)|caixabank\.es|santander\.(com|es)|renfe\.com|iberia\.com|vueling\.com)$/i
const NEWS_HEADER_HINT = /(mailchimp|sendgrid|mailgun|sendinblue|brevo|klaviyo|campaign|constantcontact|hubspot|substack|beehiiv|convertkit|mailerlite|getresponse|freshmail|salesmanago)/i

function localPart(email: string) {
  return email.split('@')[0] || ''
}
function domainOf(email: string) {
  return (email.split('@')[1] || '').toLowerCase()
}

/** Heuristic category for one incoming message. Contact overrides are applied by the caller. */
export function categorize(m: CategorizeInput): Category {
  if (m.isOutgoing) return 'people'
  const email = (m.fromEmail || '').toLowerCase()
  if (!email) return 'notification'

  const g = (m.gmailCategory || '').toLowerCase()
  if (g === 'promotions' || g === 'forums') return 'newsletter'
  if (g === 'updates' || g === 'social') return 'notification'

  const lp = localPart(email)
  const dom = domainOf(email)
  const auto = (m.autoSubmitted || '').toLowerCase()
  const prec = (m.precedence || '').toLowerCase()
  const isList = !!(m.listUnsubscribe || m.listId)
  const espHint = NEWS_HEADER_HINT.test(m.headersHint || '')

  if (auto && auto !== 'no') return 'notification'
  if (NOTIFY_LOCAL.test(lp)) {
    if (isList && NEWS_LOCAL.test(lp)) return 'newsletter'
    return 'notification'
  }
  if (isList || prec === 'bulk' || prec === 'list' || prec === 'junk' || espHint) {
    if (NOTIFY_DOMAINS.test(dom) && !NEWS_LOCAL.test(lp)) return 'notification'
    return 'newsletter'
  }
  if (NEWS_LOCAL.test(lp) && !m.fromName?.includes(' ')) return 'newsletter'
  if (NOTIFY_DOMAINS.test(dom)) return 'notification'
  return 'people'
}

// ---------- contacts ----------

export function rowToContact(r: Row): Contact {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    status: r.status,
    category: r.category,
    vip: !!r.vip,
    notes: r.notes,
    phone: r.phone,
    company: r.company,
    sent_count: r.sent_count,
    recv_count: r.recv_count,
    last_sent: r.last_sent,
    last_received: r.last_received,
    source: r.source,
  }
}

export function getContact(email: string): Contact | null {
  const r = get('SELECT * FROM contacts WHERE email = ? COLLATE NOCASE', email.toLowerCase())
  return r ? rowToContact(r) : null
}

/** Contact-level overrides: exact address first, then "@domain" rows. */
export function contactOverride(email: string): { category: Category | null; status: string } {
  const e = email.toLowerCase()
  const exact = get<{ category: Category | null; status: string }>(
    'SELECT category, status FROM contacts WHERE email = ? COLLATE NOCASE',
    e,
  )
  const dom = get<{ category: Category | null; status: string }>(
    'SELECT category, status FROM contacts WHERE email = ? COLLATE NOCASE',
    `@${domainOf(e)}`,
  )
  return {
    category: exact?.category || dom?.category || null,
    status: exact?.status === 'blocked' || dom?.status === 'blocked' ? 'blocked' : exact?.status || 'unknown',
  }
}

/**
 * Count an incoming message. `accept` is used for mail found during an account's first sync:
 * GateKeeper only screens senders who write for the first time after the account was added.
 */
export function noteIncoming(from: Address | null, date: number, accept = false): void {
  if (!from?.email) return
  run(
    `INSERT INTO contacts(email, name, recv_count, last_received, status, updated_at) VALUES (?, ?, 1, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       recv_count = recv_count + 1,
       last_received = MAX(COALESCE(last_received, 0), excluded.last_received),
       name = COALESCE(NULLIF(contacts.name, ''), excluded.name),
       status = CASE WHEN contacts.status = 'unknown' AND excluded.status = 'accepted' THEN 'accepted' ELSE contacts.status END,
       updated_at = excluded.updated_at`,
    from.email.toLowerCase(),
    from.name || null,
    date,
    accept ? 'accepted' : 'unknown',
    now(),
  )
}

/** Turning GateKeeper on accepts everyone who already wrote; only later newcomers are screened. */
export function acceptAllKnownSenders(): number {
  return run("UPDATE contacts SET status = 'accepted', updated_at = ? WHERE status = 'unknown' AND recv_count > 0", now()).changes
}

export function noteOutgoing(recipients: Address[], date: number): void {
  for (const r of recipients) {
    if (!r?.email) continue
    run(
      `INSERT INTO contacts(email, name, sent_count, last_sent, status, updated_at) VALUES (?, ?, 1, ?, 'accepted', ?)
       ON CONFLICT(email) DO UPDATE SET
         sent_count = sent_count + 1,
         last_sent = MAX(COALESCE(last_sent, 0), excluded.last_sent),
         status = CASE WHEN contacts.status = 'unknown' THEN 'accepted' ELSE contacts.status END,
         name = COALESCE(NULLIF(contacts.name, ''), excluded.name),
         updated_at = excluded.updated_at`,
      r.email.toLowerCase(),
      r.name || null,
      date,
      now(),
    )
  }
}

export function setContactStatus(email: string, status: 'unknown' | 'accepted' | 'blocked'): void {
  run(
    `INSERT INTO contacts(email, status, source, updated_at) VALUES (?, ?, 'manual', ?)
     ON CONFLICT(email) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`,
    email.toLowerCase(),
    status,
    now(),
  )
}

/** Re-route a sender (or "@domain") to a category and re-categorise their existing mail. */
export function setSenderCategory(email: string, category: Category | null): number {
  const e = email.toLowerCase()
  run(
    `INSERT INTO contacts(email, category, source, updated_at) VALUES (?, ?, 'manual', ?)
     ON CONFLICT(email) DO UPDATE SET category = excluded.category, updated_at = excluded.updated_at`,
    e,
    category,
    now(),
  )
  const match = e.startsWith('@') ? `%${e}` : e
  const op = e.startsWith('@') ? 'LIKE' : '='
  const r = run(`UPDATE messages SET category = ? WHERE from_email ${op} ? AND is_outgoing = 0`, category ?? 'people', match)
  refreshThreadCategories()
  return r.changes
}

export function setVip(email: string, vip: boolean): void {
  run(
    `INSERT INTO contacts(email, vip, source, updated_at) VALUES (?, ?, 'manual', ?)
     ON CONFLICT(email) DO UPDATE SET vip = excluded.vip, updated_at = excluded.updated_at`,
    email.toLowerCase(),
    vip ? 1 : 0,
    now(),
  )
}

/** A thread is "people" if the user wrote in it, otherwise it takes its latest incoming message's category. */
export function refreshThreadCategories(threadIds?: number[]): void {
  const where = threadIds?.length ? `WHERE id IN (${threadIds.map(() => '?').join(',')})` : ''
  run(
    `UPDATE threads SET category = CASE
       WHEN EXISTS (SELECT 1 FROM messages m WHERE m.thread_id = threads.id AND m.is_outgoing = 1) THEN 'people'
       ELSE COALESCE((SELECT m.category FROM messages m WHERE m.thread_id = threads.id AND m.is_outgoing = 0
                      ORDER BY m.date DESC LIMIT 1), 'people')
     END ${where}`,
    ...(threadIds || []),
  )
}

export function listContacts(query = '', limit = 50, offset = 0): Contact[] {
  const q = `%${query.toLowerCase()}%`
  return all(
    `SELECT * FROM contacts WHERE email NOT LIKE '@%' AND (email LIKE ? OR LOWER(COALESCE(name,'')) LIKE ?)
     ORDER BY (sent_count * 3 + recv_count) DESC, COALESCE(last_sent, last_received, 0) DESC
     LIMIT ? OFFSET ?`,
    q,
    q,
    limit,
    offset,
  ).map(rowToContact)
}

export function listBlocked(): Contact[] {
  return all("SELECT * FROM contacts WHERE status = 'blocked' ORDER BY updated_at DESC").map(rowToContact)
}

/** Autocomplete for the composer: people the user actually corresponds with rank first. */
export function suggestContacts(prefix: string, limit = 8): Contact[] {
  const p = `${prefix.toLowerCase()}%`
  const w = `% ${prefix.toLowerCase()}%`
  return all(
    `SELECT * FROM contacts
     WHERE status != 'blocked' AND email NOT LIKE '@%'
       AND (email LIKE ? OR LOWER(COALESCE(name,'')) LIKE ? OR LOWER(COALESCE(name,'')) LIKE ?)
     ORDER BY sent_count DESC, recv_count DESC LIMIT ?`,
    p,
    p,
    w,
    limit,
  ).map(rowToContact)
}

export function upsertContact(c: Partial<Contact> & { email: string }): Contact {
  run(
    `INSERT INTO contacts(email, name, phone, company, notes, source, updated_at) VALUES (?, ?, ?, ?, ?, 'manual', ?)
     ON CONFLICT(email) DO UPDATE SET
       name = COALESCE(excluded.name, contacts.name), phone = COALESCE(excluded.phone, contacts.phone),
       company = COALESCE(excluded.company, contacts.company), notes = COALESCE(excluded.notes, contacts.notes),
       updated_at = excluded.updated_at`,
    c.email.toLowerCase(),
    c.name ?? null,
    c.phone ?? null,
    c.company ?? null,
    c.notes ?? null,
    now(),
  )
  return getContact(c.email)!
}
