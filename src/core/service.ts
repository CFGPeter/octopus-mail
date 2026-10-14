// One API surface for the desktop UI (IPC), the `octo` CLI and the MCP server.
// Agent actors (cli/mcp) are checked against each account's access level, like Spark's
// Settings → AI Agents: read < triage (drafts, actions) < send (sending, calendar writes).
import fs from 'node:fs'
import path from 'node:path'
import { t } from '../shared/i18n'
import type {
  AccountInput, AgentAccess, AppSettings, Category, DraftInput, EventInput, Folder, MailboxRef, Rule, SmartFolder,
} from '../shared/types'
import * as accounts from './accounts'
import * as A from './actions'
import * as ai from './ai/features'
import { claudeModels, hasClaudeKey, hasOpenaiKey, ollamaModels, setClaudeKey, setOpenaiKey } from './ai/provider'
import * as cal from './calendar'
import { syncAllContacts } from './contacts-sync'
import { all, get, inList, insert, now, run, update } from './db'
import * as drafts from './drafts'
import { bus } from './events'
import { listHistory, record } from './history'
import { type OAuthProvider, startOAuth } from './oauth'
import { pendingOps, processOps } from './ops'
import { tmpDir } from './paths'
import { secretStoreName } from './secrets'
import { discover, presets } from './providers'
import * as Q from './queries'
import * as rules from './rules'
import { searchMessages, searchThreads, threadsForMessages } from './search'
import { getKV, getSettings, setKV, updateSettings } from './settings'
import * as smart from './smart'
import { sync } from './sync'

export type ServiceActor = 'ui' | 'cli' | 'mcp'
const LEVEL: Record<AgentAccess, number> = { none: 0, read: 1, triage: 2, send: 3 }

export class AccessError extends Error {}

function accountsOfThreads(threadIds: number[]): number[] {
  if (!threadIds.length) return []
  return all<{ account_id: number }>(`SELECT DISTINCT account_id FROM threads WHERE id IN (${inList(threadIds)})`, ...threadIds).map((r) => r.account_id)
}

function accountsOfMessages(ids: number[]): number[] {
  if (!ids.length) return []
  return all<{ account_id: number }>(`SELECT DISTINCT account_id FROM messages WHERE id IN (${inList(ids)})`, ...ids).map((r) => r.account_id)
}

export function createService(actor: ServiceActor) {
  const agent = actor !== 'ui'

  function need(level: Exclude<AgentAccess, 'none'>, accountIds: number[] | 'any'): void {
    if (!agent) return
    const list = accountIds === 'any' ? accounts.listAccounts().map((a) => a.id) : accountIds
    for (const id of list) {
      const acc = accounts.getAccount(id)
      if (LEVEL[acc.agent_access] < LEVEL[level]) {
        const names: Record<string, string> = { read: t('read'), triage: t('triage'), send: t('send') }
        throw new AccessError(
          t('Account {email} has agent access level “{current}”, but this operation needs “{needed}”. Change it in Octopus Mail → Settings → AI agents & CLI.', {
            email: acc.email,
            current: names[acc.agent_access] || t('no access'),
            needed: names[level],
          }),
        )
      }
    }
  }

  /** Accounts an agent may read from (others are filtered out of results). */
  function readable(): Set<number> {
    return new Set(accounts.listAccounts().filter((a) => !agent || LEVEL[a.agent_access] >= 1).map((a) => a.id))
  }

  const threads = (ids: number[]) => accountsOfThreads(ids)

  return {
    actor,

    // ---------- accounts ----------
    listAccounts: () => accounts.listAccounts().filter((a) => !agent || readable().has(a.id)),
    presets: () => presets(),
    discover: (email: string) => discover(email),
    testConnection: (cfg: Parameters<typeof accounts.testConnection>[0]) => accounts.testConnection(cfg),
    async addAccount(input: AccountInput & { oauthProvider?: OAuthProvider }) {
      if (agent) throw new AccessError(t('Accounts can only be added in the app.'))
      const acc = await accounts.addAccount(input)
      sync.ensure(acc.id)
      if (acc.auth === 'oauth-google') void cal.ensureGoogleCalendarSources().catch(() => undefined)
      return acc
    },
    async oauthLogin(provider: OAuthProvider, email?: string) {
      if (agent) throw new AccessError(t('OAuth sign-in only in the app.'))
      const { url, done } = await startOAuth(provider, email)
      return { url, done }
    },
    async updateAccount(id: number, patch: Record<string, unknown>) {
      if (agent) throw new AccessError(t('Account settings can only be changed in the app.'))
      const acc = accounts.updateAccount(id, patch)
      if ('password' in patch || 'imap_host' in patch || 'enabled' in patch || 'username' in patch) await sync.restart(id)
      return acc
    },
    async removeAccount(id: number) {
      if (agent) throw new AccessError(t('Accounts can only be removed in the app.'))
      await sync.remove(id)
      accounts.removeAccount(id)
    },
    setAgentAccess(id: number, level: AgentAccess) {
      if (agent) throw new AccessError(t('Agent access can only be changed in the app.'))
      record('ui', 'agent-access', id, { level })
      return accounts.setAgentAccess(id, level)
    },
    listIdentities: (accountId?: number) => accounts.listIdentities(accountId),
    addIdentity(accountId: number, email: string, name?: string) {
      need('triage', [accountId])
      accounts.addIdentity(accountId, email, name)
    },
    removeIdentity: (id: number) => {
      if (agent) throw new AccessError(t('Only in the app.'))
      accounts.removeIdentity(id)
    },

    // ---------- folders & sync ----------
    listFolders(accountId?: number) {
      const ok = readable()
      const rows = accountId
        ? all('SELECT * FROM folders WHERE account_id = ? ORDER BY path', accountId)
        : all('SELECT f.* FROM folders f JOIN accounts a ON a.id = f.account_id ORDER BY a.sort, a.id, f.path')
      return rows.filter((f) => ok.has(f.account_id)) as unknown as Folder[]
    },
    createFolder(accountId: number, name: string) {
      need('triage', [accountId])
      return sync.get(accountId).createFolder(name)
    },
    renameFolder(folderId: number, newName: string) {
      const f = get('SELECT * FROM folders WHERE id = ?', folderId)!
      need('triage', [f.account_id])
      const newPath = f.parent_path ? `${f.parent_path}${f.delimiter || '/'}${newName}` : newName
      return sync.get(f.account_id).renameFolder(f.path, newPath)
    },
    deleteFolder(folderId: number) {
      const f = get('SELECT * FROM folders WHERE id = ?', folderId)!
      need('triage', [f.account_id])
      if (f.role) throw new Error(t('A system folder cannot be deleted'))
      return sync.get(f.account_id).deleteFolder(f.path)
    },
    setFolderSync(folderId: number, mode: 'auto' | 'always' | 'never') {
      run('UPDATE folders SET sync_mode = ? WHERE id = ?', mode, folderId)
    },
    syncNow: (accountId?: number) => sync.syncNow(accountId),
    syncFolder: (folderId: number) => sync.syncFolder(folderId),
    loadOlder(folderId: number) {
      const f = get<{ account_id: number }>('SELECT account_id FROM folders WHERE id = ?', folderId)
      return f ? sync.get(f.account_id).loadOlder(folderId) : 0
    },
    syncStatus: () => sync.statuses(),

    // ---------- reading ----------
    listThreads(ref: MailboxRef, opts: Q.ListOptions = {}) {
      if (ref.kind === 'search') return searchThreads(ref.query, opts).threads
      if (ref.kind === 'smartfolder') {
        const sf = get<{ query: string }>('SELECT query FROM smart_folders WHERE id = ?', ref.id)
        return sf ? searchThreads(sf.query, opts).threads : []
      }
      const ok = readable()
      return Q.listThreads(ref, opts).filter((t) => ok.has(t.account_id))
    },
    counts: () => Q.counts(),
    getThread(threadId: number) {
      const t = Q.getThread(threadId)
      if (t) need('read', [t.thread.account_id])
      return t
    },
    getMessage(id: number) {
      const m = Q.getMessage(id)
      if (m) need('read', [m.account_id])
      return m
    },
    async fetchBody(messageId: number) {
      const m = get<{ account_id: number; body_state: number }>('SELECT account_id, body_state FROM messages WHERE id = ?', messageId)
      if (!m) throw new Error(t('Message does not exist'))
      need('read', [m.account_id])
      if (m.body_state !== 1) await sync.get(m.account_id).fetchBody(messageId)
      return Q.getMessage(messageId)
    },
    /** Make sure every message body of a thread is downloaded (thread view). */
    async fetchThreadBodies(threadId: number) {
      const rows = all<{ id: number; account_id: number }>('SELECT id, account_id FROM messages WHERE thread_id = ? AND body_state != 1 AND hidden = 0', threadId)
      for (const r of rows) {
        need('read', [r.account_id])
        try {
          await sync.get(r.account_id).fetchBody(r.id)
        } catch (e) {
          run('UPDATE messages SET body_state = 2 WHERE id = ?', r.id)
          throw e
        }
      }
      return Q.getThread(threadId)
    },
    async downloadAttachment(attId: number) {
      const a = get<{ message_id: number }>('SELECT message_id FROM attachments WHERE id = ?', attId)
      if (!a) throw new Error(t('Attachment does not exist'))
      const acc = accountsOfMessages([a.message_id])
      need('read', acc)
      return sync.get(acc[0]).downloadAttachment(attId)
    },
    async messageSource(messageId: number) {
      const acc = accountsOfMessages([messageId])
      need('read', acc)
      return (await sync.get(acc[0]).downloadSource(messageId)).toString('utf8')
    },
    search(q: string, opts: { accountId?: number | null; limit?: number; offset?: number; order?: 'asc' | 'desc' } = {}) {
      const r = searchThreads(q, opts)
      const ok = readable()
      return { ...r, threads: r.threads.filter((t) => ok.has(t.account_id)) }
    },
    searchMessages(q: string, opts: { accountId?: number | null; limit?: number; offset?: number; order?: 'asc' | 'desc' } = {}) {
      const ok = readable()
      return searchMessages(q, opts).filter((m) => ok.has(m.account_id))
    },
    threadsForMessages,

    // ---------- actions ----------
    archive: (ids: number[]) => (need('triage', threads(ids)), A.archive(ids, actor)),
    moveToInbox: (ids: number[]) => (need('triage', threads(ids)), A.moveToInbox(ids, actor)),
    trash: (ids: number[]) => (need('triage', threads(ids)), A.trash(ids, actor)),
    deleteForever: (ids: number[]) => (need('triage', threads(ids)), A.deleteForever(ids, actor)),
    spam: (ids: number[]) => (need('triage', threads(ids)), A.spam(ids, actor)),
    notSpam: (ids: number[]) => (need('triage', threads(ids)), A.notSpam(ids, actor)),
    moveToFolder: (ids: number[], folderId: number, from?: number[]) => (need('triage', threads(ids)), A.moveToFolder(ids, folderId, actor, from)),
    copyToFolder: (ids: number[], folderId: number) => (need('triage', threads(ids)), A.copyToFolder(ids, folderId, actor)),
    setLabel: (ids: number[], label: string, on: boolean) => (need('triage', threads(ids)), A.setLabel(ids, label, on, actor)),
    markRead: (ids: number[], read: boolean) => (need('triage', threads(ids)), A.markRead(ids, read, actor)),
    markMessagesRead: (ids: number[], read: boolean) => (need('triage', accountsOfMessages(ids)), A.markMessagesRead(ids, read, actor)),
    pin: (ids: number[], on: boolean) => (need('triage', threads(ids)), A.pin(ids, on, actor)),
    snooze: (ids: number[], until: number | null) => (need('triage', threads(ids)), A.snooze(ids, until, actor)),
    setAside: (ids: number[], on: boolean) => (need('triage', threads(ids)), A.setAside(ids, on, actor)),
    mute: (ids: number[], on: boolean) => (need('triage', threads(ids)), A.mute(ids, on, actor)),
    priority: (ids: number[], on: boolean) => (need('triage', threads(ids)), A.priority(ids, on, actor)),
    remind: (ids: number[], at: number | null, kind: 'manual' | 'no-reply' = 'manual') => (need('triage', threads(ids)), A.remind(ids, at, kind, actor)),
    acceptSenders: (emails: string[]) => (need('triage', 'any'), A.acceptSenders(emails, actor)),
    blockSenders: (emails: string[]) => (need('triage', 'any'), A.blockSenders(emails, actor)),
    unblockSenders: (emails: string[]) => (need('triage', 'any'), A.unblockSenders(emails, actor)),
    changeSenderCategory: (emails: string[], category: Category) => (need('triage', 'any'), A.changeSenderCategory(emails, category, actor)),
    prioritySender: (emails: string[], on: boolean) => (need('triage', 'any'), A.prioritySender(emails, on, actor)),
    sendersOfThreads: (ids: number[]) => A.sendersOfThreads(ids),
    unsubscribe: (ids: number[]) => (need('triage', threads(ids)), A.unsubscribe(ids, actor)),
    undo: (token: string) => A.undo(token),

    // ---------- drafts & sending ----------
    saveDraft(input: DraftInput) {
      const accId = input.id ? drafts.getDraft(input.id).account_id : input.account_id ?? (input.from_email ? accounts.findAccount(input.from_email)?.id : undefined)
      if (accId) need('triage', [accId])
      else if (agent && (input.reply_to_message_id || input.forward_of_message_id)) need('triage', accountsOfMessages([(input.reply_to_message_id || input.forward_of_message_id)!]))
      else if (agent) need('triage', 'any')
      const d = drafts.saveDraft({ ...input, source: input.source || actor })
      if (!agent) drafts.scheduleRemoteDraftSave(d.id)
      else record(actor, input.id ? 'draft-edit' : 'draft-create', d.id, { subject: d.subject })
      return d
    },
    getDraft: (id: number) => {
      const d = drafts.getDraft(id)
      need('read', [d.account_id])
      return d
    },
    listDrafts: (status?: string[]) => drafts.listDrafts(status).filter((d) => readable().has(d.account_id)),
    deleteDraft(id: number) {
      need('triage', [drafts.getDraft(id).account_id])
      drafts.deleteDraft(id)
      record(actor, 'draft-delete', id)
    },
    sendDraft(id: number, opts: { sendAt?: number; remindAt?: number } = {}) {
      need('send', [drafts.getDraft(id).account_id])
      return drafts.sendDraft(id, { ...opts, actor, immediate: agent && !opts.sendAt })
    },
    cancelSend(id: number) {
      need('send', [drafts.getDraft(id).account_id])
      return drafts.cancelSend(id, actor)
    },
    scheduled: () => drafts.scheduledDrafts().filter((d) => readable().has(d.account_id)),
    adoptServerDraft: (messageId: number) => (need('triage', accountsOfMessages([messageId])), drafts.adoptServerDraft(messageId)),
    /** Save pasted/dropped bytes as a temporary file the draft can reference. */
    stageAttachment(filename: string, data: Uint8Array) {
      const dir = path.join(tmpDir(), String(now()))
      fs.mkdirSync(dir, { recursive: true })
      const file = path.join(dir, filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_'))
      fs.writeFileSync(file, data)
      return { filename: path.basename(file), path: file, size: data.byteLength }
    },

    // ---------- templates & signatures ----------
    listTemplates: () => drafts.listTemplates(),
    getTemplate: (ref: number | string) => drafts.getTemplate(ref),
    saveTemplate: (t: Parameters<typeof drafts.saveTemplate>[0]) => (agent && need('triage', 'any'), drafts.saveTemplate(t)),
    deleteTemplate: (id: number) => (agent && need('triage', 'any'), drafts.deleteTemplate(id)),
    placeholderKind: (name: string) => drafts.placeholderKind(name),
    listSignatures: () => drafts.listSignatures(),
    saveSignature: (s: { id?: number; name: string; html: string }) => drafts.saveSignature(s),
    deleteSignature: (id: number) => drafts.deleteSignature(id),
    setDefaultSignature: (accountId: number, sigId: number | null) => drafts.setDefaultSignature(accountId, sigId),

    // ---------- contacts ----------
    listContacts: (q?: string, limit?: number, offset?: number) => smart.listContacts(q, limit, offset),
    suggestContacts: (prefix: string) => smart.suggestContacts(prefix),
    getContact: (email: string) => smart.getContact(email),
    upsertContact: (c: Parameters<typeof smart.upsertContact>[0]) => (agent && need('triage', 'any'), smart.upsertContact(c)),
    listBlocked: () => smart.listBlocked(),
    syncContacts: () => syncAllContacts(),
    contactStats(email: string) {
      const recent = searchMessages(`with:${email}`, { limit: 10 })
      return { contact: smart.getContact(email), recent }
    },

    // ---------- rules & smart folders ----------
    listRules: () => rules.listRules(),
    saveRule: (r: Parameters<typeof rules.saveRule>[0]) => (agent && need('triage', 'any'), rules.saveRule(r)),
    deleteRule: (id: number) => (agent && need('triage', 'any'), rules.deleteRule(id)),
    testRule: (r: Pick<Rule, 'match' | 'conditions'>) => rules.testRule(r),
    applyRule: (id: number) => (need('triage', 'any'), rules.applyRuleToExisting(id)),
    listSmartFolders: () => all('SELECT * FROM smart_folders ORDER BY sort, id') as SmartFolder[],
    saveSmartFolder(sf: { id?: number; name: string; query: string; icon?: string }) {
      if (sf.id) update('smart_folders', sf.id, { name: sf.name, query: sf.query, icon: sf.icon ?? null })
      else insert('smart_folders', { name: sf.name, query: sf.query, icon: sf.icon ?? null, created_at: now() })
      bus.emitEvent({ type: 'mailbox-changed' })
    },
    deleteSmartFolder: (id: number) => {
      run('DELETE FROM smart_folders WHERE id = ?', id)
      bus.emitEvent({ type: 'mailbox-changed' })
    },

    // ---------- AI ----------
    aiSummarize: (threadId: number, force?: boolean, onDelta?: (t: string) => void) => (need('read', threads([threadId])), ai.summarizeThread(threadId, { force, onDelta })),
    aiDraftReply: (threadId: number, o: { instructions?: string; tone?: ai.ReplyTone } = {}, onDelta?: (t: string) => void) => (need('read', threads([threadId])), ai.draftReply(threadId, { ...o, onDelta })),
    aiRewrite: (text: string, mode: ai.RewriteMode, custom?: string, onDelta?: (t: string) => void) => ai.rewrite(text, mode, custom, onDelta),
    aiTranslate: (messageId: number, target?: string, onDelta?: (t: string) => void) => (need('read', accountsOfMessages([messageId])), ai.translateMessage(messageId, target, onDelta)),
    aiQuickReplies: (threadId: number) => (need('read', threads([threadId])), ai.quickReplies(threadId)),
    aiCompose: (prompt: string, accountId?: number, onDelta?: (t: string) => void) => ai.composeFromPrompt(prompt, accountId, onDelta),
    aiAsk: (q: string, onDelta?: (t: string) => void) => (need('read', 'any'), ai.askInbox(q, onDelta)),
    async aiStatus() {
      const s = getSettings().ai
      return { provider: s.provider, ollamaModels: await ollamaModels(), claudeModels: claudeModels(), hasClaudeKey: hasClaudeKey(), hasOpenaiKey: hasOpenaiKey() }
    },
    setClaudeKey: (key: string | null) => {
      if (agent) throw new AccessError(t('Only in the app.'))
      setClaudeKey(key)
    },
    setOpenaiKey: (key: string | null) => {
      if (agent) throw new AccessError(t('Only in the app.'))
      setOpenaiKey(key)
    },

    // ---------- calendar ----------
    listCalendars: () => cal.listCalendars(),
    listCalendarSources: () => cal.listCalendarSources(),
    addCalendarSource: (input: Parameters<typeof cal.addCalendarSource>[0]) => {
      if (agent) throw new AccessError(t('Calendars can only be added in the app.'))
      return cal.addCalendarSource(input)
    },
    removeCalendarSource: (id: number) => {
      if (agent) throw new AccessError(t('Only in the app.'))
      return cal.removeCalendarSource(id)
    },
    syncCalendars: (sourceId?: number) => cal.syncCalendars(sourceId),
    listEvents: (from: number, to: number, calendarIds?: number[]) => cal.listEvents(from, to, calendarIds),
    getEvent: (id: number) => cal.getEvent(id),
    createEvent: (input: EventInput) => (need('send', 'any'), cal.createEvent(input, actor)),
    updateEvent: (id: number, patch: Partial<EventInput>, opts: { occurrence_start?: number | null } = {}) => (need('send', 'any'), cal.updateEvent(id, patch, actor, opts)),
    deleteEvent: (id: number, opts: { occurrence_start?: number | null } = {}) => (need('send', 'any'), cal.deleteEvent(id, actor, opts)),
    parseInvite: (messageId: number) => (need('read', accountsOfMessages([messageId])), cal.parseInvite(messageId)),
    rsvpInvite: (messageId: number, response: 'ACCEPTED' | 'TENTATIVE' | 'DECLINED', comment?: string) =>
      (need('send', accountsOfMessages([messageId])), cal.rsvpInvite(messageId, response, { comment, actor })),
    rsvpEvent: (eventId: number, response: 'ACCEPTED' | 'TENTATIVE' | 'DECLINED') => (need('send', 'any'), cal.rsvpEvent(eventId, response, actor)),
    availability: (opts: Parameters<typeof cal.findAvailability>[0]) => cal.findAvailability(opts),

    // ---------- settings & misc ----------
    getSettings: () => getSettings(),
    updateSettings(patch: Partial<AppSettings>) {
      if (agent) throw new AccessError(t('Settings can only be changed in the app.'))
      if (patch.gatekeeper === 'on' && getSettings().gatekeeper !== 'on') smart.acceptAllKnownSenders()
      return updateSettings(patch)
    },
    getKV: <T>(key: string, fallback: T) => getKV<T>(key, fallback),
    setKV(key: string, value: unknown) {
      if (agent) throw new AccessError(t('Only in the app.'))
      setKV(key, value)
    },
    history: (limit?: number, who?: string) => listHistory(limit, who),
    platform: () => ({ os: process.platform, secretStore: secretStoreName() }),
    pendingOps: () => pendingOps(),
    processOps: () => processOps(),
  }
}

export type Service = ReturnType<typeof createService>
