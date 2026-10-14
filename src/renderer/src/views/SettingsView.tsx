import {
  Bell, Bot, CalendarDays, ChevronLeft, Server, Smartphone, Unplug, Copy, Inbox, Keyboard, Mail, Palette, PenLine, Plus, RefreshCw, Sparkles, Trash2, Wand2, Workflow, X, Info, FileText,
} from 'lucide-react'
import { Fragment, type ReactNode, useEffect, useState } from 'react'
import type { Account, AgentAccess, AppSettings, Rule, RuleAction, RuleCondition, Signature, Template } from '../../../shared/types'
import { getLang, LANGUAGES, t, tp } from '../../../shared/i18n'
import { api, errorText } from '../lib/api'
import { copyText, fullDate } from '../lib/format'
import { useNarrow } from '../lib/narrow'
import { useStore } from '../lib/store'
import AccountWizard from './AccountWizard'
import { Button, cx, Field, IconButton, inputCls, Modal, Select, Spinner, Toggle } from '../components/ui'
import { APP_VERSION } from '../../../shared/version'

type Tab = 'accounts' | 'server' | 'general' | 'inbox' | 'notifications' | 'signatures' | 'templates' | 'rules' | 'ai' | 'agents' | 'calendars' | 'shortcuts' | 'about'

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'accounts', label: t('Accounts'), icon: <Mail size={15} /> },
  { id: 'general', label: t('Appearance & general'), icon: <Palette size={15} /> },
  { id: 'inbox', label: t('Inbox & Gatekeeper'), icon: <Inbox size={15} /> },
  { id: 'notifications', label: t('Notifications'), icon: <Bell size={15} /> },
  { id: 'signatures', label: t('Signatures'), icon: <PenLine size={15} /> },
  { id: 'templates', label: t('Templates'), icon: <FileText size={15} /> },
  { id: 'rules', label: t('Rules'), icon: <Workflow size={15} /> },
  { id: 'ai', label: 'AI', icon: <Sparkles size={15} /> },
  { id: 'agents', label: t('AI agents & CLI'), icon: <Bot size={15} /> },
  { id: 'calendars', label: t('Calendars'), icon: <CalendarDays size={15} /> },
  { id: 'server', label: t('Home server'), icon: <Server size={15} /> },
  { id: 'shortcuts', label: t('Keyboard shortcuts'), icon: <Keyboard size={15} /> },
  { id: 'about', label: t('About'), icon: <Info size={15} /> },
]

/** Puts JSX (e.g. <code>) into the {slots} of an already translated text, so the translation decides the word order. */
function rich(text: string, slots: Record<string, ReactNode>): ReactNode {
  return text.split(/\{(\w+)\}/).map((part, i) => (i % 2 ? <Fragment key={i}>{slots[part]}</Fragment> : part))
}

function Section({ title, children, hint }: { title: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-1 text-[14px] font-semibold">{title}</div>
      {hint && <div className="mb-2 text-[12.5px] text-muted">{hint}</div>}
      <div className="rounded-xl border border-line bg-surface px-4 py-2">{children}</div>
    </div>
  )
}

function useSettings(): [AppSettings, (p: Partial<AppSettings>) => void] {
  const { settings, updateSettings } = useStore()
  return [settings!, (p) => void updateSettings(p)]
}

const ACCESS: { value: AgentAccess; label: string }[] = [
  { value: 'none', label: t('No access') },
  { value: 'read', label: t('Read only') },
  { value: 'triage', label: t('Triage (drafts, actions)') },
  { value: 'send', label: t('Send (+ calendar)') },
]

function AccountsTab() {
  const { accounts, sync, refreshMeta, toast } = useStore()
  const [adding, setAdding] = useState(false)
  const [edit, setEdit] = useState<Account | null>(null)
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [identities, setIdentities] = useState<{ id: number; account_id: number; email: string; name: string; signature_id: number | null; is_default: number }[]>([])
  const load = async () => {
    setSignatures(await api.listSignatures())
    setIdentities((await api.listIdentities()) as typeof identities)
  }
  useEffect(() => void load(), [accounts])
  return (
    <>
      <Section title={t('Mail accounts')} hint={t('Passwords are stored {where}, not in the app database.', { where: useStore.getState().secretStore })}>
        {accounts.map((a) => {
          const st = sync[a.id]
          const ids = identities.filter((i) => i.account_id === a.id)
          return (
            <div key={a.id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
              <span className="h-3 w-3 rounded-full" style={{ background: a.color || 'var(--accent)' }} />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{a.name} <span className="font-normal text-muted">&lt;{a.email}&gt;</span></div>
                <div className="text-[12px] text-muted">
                  {a.imap_host} · {a.auth === 'password' ? t('password') : 'OAuth'} · {st?.state === 'error' ? <span className="text-danger">{st.error}</span> : a.last_sync ? t('synced {when}', { when: fullDate(a.last_sync) }) : t('not synced yet')}
                </div>
                {ids.length > 1 && <div className="text-[12px] text-faint">{t('Aliases:')} {ids.filter((i) => !i.is_default).map((i) => i.email).join(', ')}</div>}
              </div>
              <select
                className="h-8 rounded-lg border border-line bg-surface px-2 text-[12.5px]"
                value={ids.find((i) => i.is_default)?.signature_id ?? ''}
                onChange={async (e) => (await api.setDefaultSignature(a.id, e.target.value ? Number(e.target.value) : null), void load())}
                title={t('Signature')}
              >
                <option value="">{t('No signature')}</option>
                {signatures.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Button size="sm" onClick={() => setEdit(a)}>{t('Edit')}</Button>
            </div>
          )
        })}
        <div className="py-2">
          <Button variant="ghost" size="sm" onClick={() => setAdding(true)}><Plus size={14} /> {t('Add account')}</Button>
        </div>
      </Section>
      <Section title={t('OAuth sign-in (optional)')} hint={t('Your own Google/Microsoft app IDs for signing in without a password and for Google Calendar access.')}>
        <OAuthClients />
      </Section>
      <Modal open={adding} onClose={() => setAdding(false)} title={t('Add account')} width={620}>
        <AccountWizard onDone={() => setAdding(false)} />
      </Modal>
      {edit && <EditAccount account={edit} onClose={() => (setEdit(null), void refreshMeta(), void load())} onError={(m) => toast({ level: 'error', message: m })} />}
    </>
  )
}

function OAuthClients() {
  const [g, setG] = useState({ clientId: '', clientSecret: '' })
  const [m, setM] = useState({ clientId: '' })
  const toast = useStore((s) => s.toast)
  useEffect(() => {
    void api.getKV('oauth.google', null).then((raw) => {
      const v = raw as { clientId?: string; clientSecret?: string } | null
      setG({ clientId: v?.clientId || '', clientSecret: v?.clientSecret || '' })
    })
    void api.getKV('oauth.microsoft', null).then((raw) => setM({ clientId: (raw as { clientId?: string } | null)?.clientId || '' }))
  }, [])
  return (
    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-4 py-1">
      <Field label="Google Client ID"><input className={inputCls} value={g.clientId} onChange={(e) => setG({ ...g, clientId: e.target.value })} /></Field>
      <Field label="Google Client secret"><input className={inputCls} type="password" value={g.clientSecret} onChange={(e) => setG({ ...g, clientSecret: e.target.value })} /></Field>
      <Field label="Microsoft Application (client) ID"><input className={inputCls} value={m.clientId} onChange={(e) => setM({ clientId: e.target.value })} /></Field>
      <div className="flex items-end pb-1.5">
        <Button size="sm" onClick={async () => {
          await api.setKV('oauth.google', g.clientId ? g : null)
          await api.setKV('oauth.microsoft', m.clientId ? m : null)
          toast({ level: 'success', message: t('Saved') })
        }}>{t('Save')}</Button>
      </div>
    </div>
  )
}

function EditAccount({ account, onClose, onError }: { account: Account; onClose: () => void; onError: (m: string) => void }) {
  const [a, setA] = useState(account)
  const [password, setPassword] = useState('')
  const [alias, setAlias] = useState('')
  const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    try {
      const patch: Record<string, unknown> = {
        name: a.name, color: a.color, sync_days: a.sync_days, notify: a.notify, enabled: a.enabled,
        imap_host: a.imap_host, imap_port: a.imap_port, imap_secure: a.imap_secure, smtp_host: a.smtp_host, smtp_port: a.smtp_port, smtp_secure: a.smtp_secure, username: a.username,
      }
      if (password) patch.password = password
      await api.updateAccount(a.id, patch)
      if (alias.trim()) await api.addIdentity(a.id, alias.trim(), a.name)
      onClose()
    } catch (e) {
      onError(errorText(e))
    }
    setBusy(false)
  }
  return (
    <Modal open onClose={onClose} title={t('Account {email}', { email: account.email })} width={600} footer={
      <>
        <Button variant="danger" className="mr-auto" onClick={async () => {
          if (!window.confirm(t('Remove the account {email} from Octopus Mail? Your mail on the server stays untouched.', { email: account.email }))) return
          await api.removeAccount(account.id)
          onClose()
        }}><Trash2 size={14} /> {t('Remove account')}</Button>
        <Button variant="ghost" onClick={onClose}>{t('Cancel')}</Button>
        <Button variant="primary" disabled={busy} onClick={() => void save()}>{busy && <Spinner />} {t('Save')}</Button>
      </>
    }>
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-4 p-5">
        <Field label={t('Sender name')}><input className={inputCls} value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} /></Field>
        <Field label={t('Color')}><input type="color" className="h-9 w-20 rounded-lg border border-line bg-surface" value={a.color || '#5b4cf0'} onChange={(e) => setA({ ...a, color: e.target.value })} /></Field>
        <Field label={t('New password (leave empty to keep the current one)')}><input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <Field label={t('Sync history (days)')}><input className={inputCls} value={a.sync_days} onChange={(e) => setA({ ...a, sync_days: Number(e.target.value) || 90 })} /></Field>
        <Field label={t('Notifications')}>
          <Select value={a.notify} onChange={(v) => setA({ ...a, notify: v })} options={[{ value: 'smart', label: t('Smart (people and priority senders)') }, { value: 'all', label: t('All') }, { value: 'none', label: t('Off') }]} />
        </Field>
        <Field label={t('Add alias (sender address)')}><input className={inputCls} placeholder={t('e.g. office@yourcompany.com')} value={alias} onChange={(e) => setAlias(e.target.value)} /></Field>
        <div className="col-span-2"><Toggle checked={a.enabled} onChange={(v) => setA({ ...a, enabled: v })} label={t('Account enabled')} hint={t('A disabled account is not synced.')} /></div>
        <div className="col-span-2 mt-2 text-[12.5px] font-semibold text-muted">{t('Servers')}</div>
        <Field label="IMAP"><input className={inputCls} value={a.imap_host} onChange={(e) => setA({ ...a, imap_host: e.target.value })} /></Field>
        <Field label={t('IMAP port')}><input className={inputCls} value={a.imap_port} onChange={(e) => setA({ ...a, imap_port: Number(e.target.value) })} /></Field>
        <Field label="SMTP"><input className={inputCls} value={a.smtp_host} onChange={(e) => setA({ ...a, smtp_host: e.target.value })} /></Field>
        <Field label={t('SMTP port')}><input className={inputCls} value={a.smtp_port} onChange={(e) => setA({ ...a, smtp_port: Number(e.target.value) })} /></Field>
        <Field label={t('Username')}><input className={inputCls} value={a.username} onChange={(e) => setA({ ...a, username: e.target.value })} /></Field>
        <div className="flex flex-col justify-end">
          <Toggle checked={a.imap_secure} onChange={(v) => setA({ ...a, imap_secure: v })} label="IMAP SSL" />
          <Toggle checked={a.smtp_secure} onChange={(v) => setA({ ...a, smtp_secure: v })} label="SMTP SSL (465)" />
        </div>
      </div>
    </Modal>
  )
}

function GeneralTab() {
  const [s, set] = useSettings()
  const { accounts } = useStore()
  return (
    <>
      <Section title={t('Appearance')}>
        <Field label={t('Language')} hint={t('The window reloads to apply the language.')}>
          <Select value={s.language} onChange={(v) => set({ language: v })} options={LANGUAGES.map((l) => ({ value: l.value, label: l.value === 'auto' ? t('Automatic (system language)') : l.label }))} />
        </Field>
        <Field label={t('Theme')}><Select value={s.theme} onChange={(v) => set({ theme: v })} options={[{ value: 'system', label: t('Match system') }, { value: 'light', label: t('Light') }, { value: 'dark', label: t('Dark') }]} /></Field>
        <Field label={t('List density')}><Select value={s.density} onChange={(v) => set({ density: v })} options={[{ value: 'comfortable', label: t('Comfortable (with preview)') }, { value: 'compact', label: t('Compact') }]} /></Field>
      </Section>
      <Section title={t('Startup')}>
        <Toggle checked={s.launchAtLogin} onChange={(v) => (set({ launchAtLogin: v }), void window.octo.setLoginItem(v))} label={t('Launch when Windows starts')} hint={t('Snoozed messages, reminders and scheduled sends then work without opening the window.')} />
        <Toggle checked={s.minimizeToTray} onChange={(v) => set({ minimizeToTray: v })} label={t('Closing the window keeps the app running in the tray')} />
      </Section>
      <Section title={t('Sending')}>
        <Field label={t('Default sending account')}>
          <Select value={String(s.defaultAccountId ?? '')} onChange={(v) => set({ defaultAccountId: v ? Number(v) : null })} options={[{ value: '', label: t('Last used') }, ...accounts.map((a) => ({ value: String(a.id), label: a.email }))]} />
        </Field>
        <Field label={t('Undo send window: {n} s', { n: s.undoSendSeconds })}>
          <input type="range" min={0} max={30} value={s.undoSendSeconds} onChange={(e) => set({ undoSendSeconds: Number(e.target.value) })} />
        </Field>
      </Section>
    </>
  )
}

function InboxTab() {
  const [s, set] = useSettings()
  return (
    <>
      <Section title="Smart Inbox" hint={t('Automatically sorts mail into People, Notifications and Newsletters (based on headers, Gmail categories and your choices).')}>
        <Toggle checked={s.smartInbox} onChange={(v) => set({ smartInbox: v })} label={t('Turn on Smart Inbox')} />
        <Toggle checked={s.groupNotifications} onChange={(v) => set({ groupNotifications: v })} label={t('Group notifications into one card')} />
        <Toggle checked={s.groupNewsletters} onChange={(v) => set({ groupNewsletters: v })} label={t('Group newsletters into one card')} />
        <Toggle checked={s.markReadOnOpen} onChange={(v) => set({ markReadOnOpen: v })} label={t('Mark as read when opened')} />
      </Section>
      <Section title={t('Gatekeeper')} hint={t('New senders (people who have never received an email from you) wait in a separate section until you accept or block them.')}>
        <Toggle checked={s.gatekeeper === 'on'} onChange={(v) => set({ gatekeeper: v ? 'on' : 'off' })} label={t('Screen new senders before they reach the Inbox')} />
      </Section>
      <Section title={t('Privacy')}>
        <Field label={t('Remote images in messages')}>
          <Select value={s.loadRemoteImages} onChange={(v) => set({ loadRemoteImages: v })} options={[{ value: 'contacts', label: t('Only from people I know') }, { value: 'always', label: t('Always') }, { value: 'never', label: t('Never (ask)') }]} />
        </Field>
        <Toggle checked={s.blockTrackers} onChange={(v) => set({ blockTrackers: v })} label={t('Block tracking pixels')} hint={t('Removes the invisible images senders use to check whether you have read their message.')} />
      </Section>
      <Section title={t('Snooze & reminders')}>
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-4">
          <Field label={t('“Morning” hour')}><input className={inputCls} type="number" min={5} max={12} value={s.snoozeMorningHour} onChange={(e) => set({ snoozeMorningHour: Number(e.target.value) })} /></Field>
          <Field label={t('“Evening” hour')}><input className={inputCls} type="number" min={15} max={23} value={s.snoozeEveningHour} onChange={(e) => set({ snoozeEveningHour: Number(e.target.value) })} /></Field>
        </div>
      </Section>
      <Section title={t('Downloading')}>
        <Field label={t('Download message content from the last (days)')} hint={t('For full-text search and offline AI. Older content is downloaded when you open a message.')}>
          <input className={inputCls} type="number" min={0} max={365} value={s.bodyPrefetchDays} onChange={(e) => set({ bodyPrefetchDays: Number(e.target.value) })} />
        </Field>
      </Section>
    </>
  )
}

function NotificationsTab() {
  const [s, set] = useSettings()
  const { accounts, refreshMeta } = useStore()
  return (
    <>
      <Section title={t('System notifications')}>
        <Toggle checked={s.notifications} onChange={(v) => set({ notifications: v })} label={t('Show notifications for new mail')} />
        <Toggle checked={s.notificationSound} onChange={(v) => set({ notificationSound: v })} label={t('Notification sound')} />
      </Section>
      <Section title={t('Mode per account')} hint={t('“Smart” = only messages from people and priority senders, no newsletters or automated mail.')}>
        {accounts.map((a) => (
          <div key={a.id} className="flex items-center gap-3 py-1.5">
            <span className="flex-1 text-[13.5px]">{a.email}</span>
            <Select value={a.notify} onChange={async (v) => (await api.updateAccount(a.id, { notify: v }), void refreshMeta())} className="w-64" options={[{ value: 'smart', label: t('Smart') }, { value: 'all', label: t('All') }, { value: 'none', label: t('Off') }]} />
          </div>
        ))}
      </Section>
    </>
  )
}

function SignaturesTab() {
  const [list, setList] = useState<Signature[]>([])
  const [edit, setEdit] = useState<{ id?: number; name: string; html: string } | null>(null)
  const load = async () => setList(await api.listSignatures())
  useEffect(() => void load(), [])
  return (
    <Section title={t('Signatures')} hint={t('Choose the default signature for an account in the Accounts tab. You can use plain text or HTML.')}>
      {list.map((s) => (
        <div key={s.id} className="flex items-center gap-3 border-b border-line py-2 last:border-0">
          <div className="min-w-0 flex-1">
            <div className="font-medium">{s.name}</div>
            <div className="truncate text-[12px] text-muted">{s.html.replace(/<[^>]+>/g, ' ')}</div>
          </div>
          <Button size="sm" onClick={() => setEdit(s)}>{t('Edit')}</Button>
          <IconButton onClick={async () => window.confirm(t('Delete this signature?')) && (await api.deleteSignature(s.id), void load())}><Trash2 size={14} /></IconButton>
        </div>
      ))}
      <div className="py-2"><Button size="sm" variant="ghost" onClick={() => setEdit({ name: t('My signature'), html: '' })}><Plus size={14} /> {t('New signature')}</Button></div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={t('Signature')} width={620} footer={
        <>
          <Button variant="ghost" onClick={() => setEdit(null)}>{t('Cancel')}</Button>
          <Button variant="primary" onClick={async () => {
            const html = /<[a-z][\s\S]*>/i.test(edit!.html) ? edit!.html : edit!.html.split('\n').map((l) => l.replace(/&/g, '&amp;').replace(/</g, '&lt;')).join('<br>')
            await api.saveSignature({ ...edit!, html })
            setEdit(null)
            void load()
          }}>{t('Save')}</Button>
        </>
      }>
        {edit && (
          <div className="p-5">
            <Field label={t('Name')}><input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label={t('Content (text or HTML)')}><textarea className={cx(inputCls, 'h-40 py-2 font-mono text-[12.5px]')} value={edit.html} onChange={(e) => setEdit({ ...edit, html: e.target.value })} /></Field>
            <div className="mt-2 text-[12px] text-muted">{t('Preview:')}</div>
            <div className="mt-1 rounded-lg border border-line bg-white p-3 text-[13px] text-black" dangerouslySetInnerHTML={{ __html: /<[a-z][\s\S]*>/i.test(edit.html) ? edit.html : edit.html.replace(/</g, '&lt;').replace(/\n/g, '<br>') }} />
          </div>
        )}
      </Modal>
    </Section>
  )
}

function TemplatesTab() {
  const [list, setList] = useState<Template[]>([])
  const [edit, setEdit] = useState<Partial<Template> & { name: string; body?: string } | null>(null)
  const toast = useStore((s) => s.toast)
  const load = async () => setList(await api.listTemplates())
  useEffect(() => void load(), [])
  // {auto3}: a field name in the UI language (the template engine knows the English and Polish names)
  const hint = rich(t('Type fields to fill in as {field}. Automatic: {auto1}, {auto2}, {auto3}.'), {
    field: <code>{'{{' + t('Field name') + '}}'}</code>,
    auto1: <code>{'{{recipient first name}}'}</code>,
    auto2: <code>{'{{my full name}}'}</code>,
    auto3: <code>{getLang() === 'pl' ? '{{imię odbiorcy}}' : '{{recipient name}}'}</code>,
  })
  return (
    <Section title={t('Templates')} hint={hint}>
      {list.map((tpl) => (
        <div key={tpl.id} className="flex items-center gap-3 border-b border-line py-2 last:border-0">
          <div className="min-w-0 flex-1">
            <div className="font-medium">{tpl.name}</div>
            <div className="truncate text-[12px] text-muted">{tpl.subject} {tpl.placeholders.length ? `· ${t('fields: {list}', { list: tpl.placeholders.join(', ') })}` : ''}</div>
          </div>
          <Button size="sm" onClick={() => setEdit({ ...tpl, body: (tpl.html || '').replace(/<br\s*\/?>/g, '\n').replace(/<\/p>\s*<p>/g, '\n\n').replace(/<[^>]+>/g, '') })}>{t('Edit')}</Button>
          <IconButton onClick={async () => window.confirm(t('Delete this template?')) && (await api.deleteTemplate(tpl.id), void load())}><Trash2 size={14} /></IconButton>
        </div>
      ))}
      <div className="py-2"><Button size="sm" variant="ghost" onClick={() => setEdit({ name: t('New template'), subject: '', body: '' })}><Plus size={14} /> {t('New template')}</Button></div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={t('Template')} width={660} footer={
        <>
          <Button variant="ghost" onClick={() => setEdit(null)}>{t('Cancel')}</Button>
          <Button variant="primary" onClick={async () => {
            try {
              const html = (edit!.body || '').split(/\n{2,}/).map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`).join('')
              await api.saveTemplate({ id: edit!.id, name: edit!.name, subject: edit!.subject || '', html })
              setEdit(null)
              void load()
            } catch (e) {
              toast({ level: 'error', message: errorText(e) })
            }
          }}>{t('Save')}</Button>
        </>
      }>
        {edit && (
          <div className="p-5">
            <Field label={t('Name')}><input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label={t('Subject')}><input className={inputCls} value={edit.subject || ''} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} /></Field>
            <Field label={t('Body')}><textarea className={cx(inputCls, 'h-56 py-2')} value={edit.body || ''} onChange={(e) => setEdit({ ...edit, body: e.target.value })} placeholder={t('Hi {{recipient first name}},\n\nhere is the quote for {{Project}}…')} /></Field>
          </div>
        )}
      </Modal>
    </Section>
  )
}

const FIELDS: { value: RuleCondition['field']; label: string }[] = [
  { value: 'from', label: t('Sender') }, { value: 'to', label: t('To') }, { value: 'any_recipient', label: t('To or Cc') }, { value: 'subject', label: t('Subject') },
  { value: 'body', label: t('Body') }, { value: 'account', label: t('Account') }, { value: 'category', label: t('Category') }, { value: 'has_attachment', label: t('Attachment (yes/no)') }, { value: 'list_id', label: t('Mailing list') },
]
const OPS: { value: RuleCondition['op']; label: string }[] = [
  { value: 'contains', label: t('contains') }, { value: 'not_contains', label: t('does not contain') }, { value: 'equals', label: t('is exactly') },
  { value: 'starts_with', label: t('starts with') }, { value: 'ends_with', label: t('ends with') }, { value: 'matches', label: t('matches the regular expression') },
]
const ACTIONS: { value: RuleAction['type']; label: string; needs?: string }[] = [
  { value: 'archive', label: t('Done (archive)') }, { value: 'mark_read', label: t('Mark as read') }, { value: 'pin', label: t('Pin') },
  { value: 'move', label: t('Move to folder'), needs: t('folder path') }, { value: 'label', label: t('Add label (Gmail)'), needs: t('label') },
  { value: 'categorize', label: t('Set category'), needs: 'people / notification / newsletter' }, { value: 'snooze', label: t('Snooze for N hours'), needs: t('number of hours') },
  { value: 'mute', label: t('Mute conversation') }, { value: 'set_aside', label: t('Set aside') }, { value: 'no_notify', label: t('No notification') },
  { value: 'trash', label: t('Move to Trash') }, { value: 'block', label: t('Block sender') },
]

function RulesTab() {
  const [list, setList] = useState<Rule[]>([])
  const [edit, setEdit] = useState<Partial<Rule> & { name: string; conditions: RuleCondition[]; actions: RuleAction[] } | null>(null)
  const [testCount, setTestCount] = useState<number | null>(null)
  const toast = useStore((s) => s.toast)
  const load = async () => setList(await api.listRules())
  useEffect(() => void load(), [])
  return (
    <Section title={t('Rules')} hint={t('They run on new messages arriving in the Inbox (e.g. “from invoices@… → label Accounting and done”).')}>
      {list.map((r) => (
        <div key={r.id} className="flex items-center gap-3 border-b border-line py-2 last:border-0">
          <Toggle checked={r.enabled} onChange={async (v) => (await api.saveRule({ ...r, enabled: v }), void load())} />
          <div className="min-w-0 flex-1">
            <div className="font-medium">{r.name}</div>
            <div className="truncate text-[12px] text-muted">
              {r.conditions.map((c) => t('{field} {op} “{value}”', { field: FIELDS.find((f) => f.value === c.field)?.label ?? '', op: OPS.find((o) => o.value === c.op)?.label ?? '', value: c.value })).join(r.match === 'all' ? ` ${t('and')} ` : ` ${t('or')} `)} → {r.actions.map((a) => ACTIONS.find((x) => x.value === a.type)?.label + (a.value ? ` (${a.value})` : '')).join(', ')} · {t('used {n}×', { n: r.hits })}
            </div>
          </div>
          <Button size="sm" onClick={async () => {
            const n = await api.applyRule(r.id)
            toast({ level: 'success', message: tp(n, 'Applied to {n} existing conversation', 'Applied to {n} existing conversations') })
          }}>{t('Apply now')}</Button>
          <Button size="sm" onClick={() => (setEdit(r), setTestCount(null))}>{t('Edit')}</Button>
          <IconButton onClick={async () => window.confirm(t('Delete this rule?')) && (await api.deleteRule(r.id), void load())}><Trash2 size={14} /></IconButton>
        </div>
      ))}
      <div className="py-2"><Button size="sm" variant="ghost" onClick={() => (setEdit({ name: t('New rule'), match: 'all', conditions: [{ field: 'from', op: 'contains', value: '' }], actions: [{ type: 'archive' }] }), setTestCount(null))}><Plus size={14} /> {t('New rule')}</Button></div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={t('Rule')} width={760} footer={
        <>
          {testCount !== null && <span className="mr-auto self-center text-[12.5px] text-muted">{t('Matches {n} of the recent messages in the Inbox', { n: testCount })}</span>}
          <Button variant="ghost" onClick={async () => setTestCount((await api.testRule({ match: edit!.match || 'all', conditions: edit!.conditions })).length)}><Wand2 size={14} /> {t('Test')}</Button>
          <Button variant="primary" onClick={async () => {
            try {
              await api.saveRule(edit!)
              setEdit(null)
              void load()
            } catch (e) {
              toast({ level: 'error', message: errorText(e) })
            }
          }}>{t('Save')}</Button>
        </>
      }>
        {edit && (
          <div className="p-5">
            <Field label={t('Name')}><input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <div className="mt-2 flex items-center gap-2 text-[13px]">
              {t('When')}
              <Select className="w-48" value={edit.match || 'all'} onChange={(v) => setEdit({ ...edit, match: v })} options={[{ value: 'all', label: t('all of the conditions') }, { value: 'any', label: t('any of the conditions') }]} />
              {t('are met:')}
            </div>
            {edit.conditions.map((c, i) => (
              <div key={i} className="mt-2 flex gap-2">
                <Select className="w-44" value={c.field} onChange={(v) => setEdit({ ...edit, conditions: edit.conditions.map((x, j) => (j === i ? { ...x, field: v } : x)) })} options={FIELDS} />
                <Select className="w-48" value={c.op} onChange={(v) => setEdit({ ...edit, conditions: edit.conditions.map((x, j) => (j === i ? { ...x, op: v } : x)) })} options={OPS} />
                <input className={inputCls} value={c.value} onChange={(e) => setEdit({ ...edit, conditions: edit.conditions.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
                <IconButton onClick={() => setEdit({ ...edit, conditions: edit.conditions.filter((_, j) => j !== i) })}><X size={14} /></IconButton>
              </div>
            ))}
            <Button className="mt-2" size="sm" variant="ghost" onClick={() => setEdit({ ...edit, conditions: [...edit.conditions, { field: 'subject', op: 'contains', value: '' }] })}><Plus size={13} /> {t('Condition')}</Button>
            <div className="mt-4 text-[13px]">{t('Then:')}</div>
            {edit.actions.map((a, i) => (
              <div key={i} className="mt-2 flex gap-2">
                <Select className="w-64" value={a.type} onChange={(v) => setEdit({ ...edit, actions: edit.actions.map((x, j) => (j === i ? { ...x, type: v } : x)) })} options={ACTIONS} />
                {ACTIONS.find((x) => x.value === a.type)?.needs && (
                  <input className={inputCls} placeholder={ACTIONS.find((x) => x.value === a.type)?.needs} value={a.value || ''} onChange={(e) => setEdit({ ...edit, actions: edit.actions.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
                )}
                <IconButton onClick={() => setEdit({ ...edit, actions: edit.actions.filter((_, j) => j !== i) })}><X size={14} /></IconButton>
              </div>
            ))}
            <Button className="mt-2" size="sm" variant="ghost" onClick={() => setEdit({ ...edit, actions: [...edit.actions, { type: 'mark_read' }] })}><Plus size={13} /> {t('Action')}</Button>
            <div className="mt-3"><Toggle checked={!!edit.stop} onChange={(v) => setEdit({ ...edit, stop: v })} label={t('Stop processing more rules')} /></div>
          </div>
        )}
      </Modal>
    </Section>
  )
}

function AiTab() {
  const [s, set] = useSettings()
  const [status, setStatus] = useState<Awaited<ReturnType<typeof api.aiStatus>> | null>(null)
  const [key, setKey] = useState('')
  const toast = useStore((st) => st.toast)
  const load = async () => setStatus(await api.aiStatus())
  useEffect(() => void load(), [])
  const ai = (p: Partial<AppSettings['ai']>) => set({ ai: { ...s.ai, ...p } })
  return (
    <>
      <Section title={t('AI engine')} hint={t('Summaries, reply drafting, translations, quick replies and questions about your mail.')}>
        <Field label={t('Provider')}>
          <Select value={s.ai.provider} onChange={(v) => ai({ provider: v })} options={[{ value: 'ollama', label: t('Ollama — local, free, private') }, { value: 'claude', label: t('Claude (Anthropic) — best quality, pay per use') }, { value: 'off', label: t('Off') }]} />
        </Field>
      </Section>
      <Section title={t('Ollama (local)')}>
        <Field label={t('Ollama address')}><input className={inputCls} value={s.ai.ollamaUrl} onChange={(e) => ai({ ollamaUrl: e.target.value })} /></Field>
        <Field label="Model" hint={status && !status.ollamaModels.length ? t('Ollama is not responding — start it to see the models.') : t('gemma3:12b and qwen3:8b work well, also for Polish.')}>
          <div className="flex gap-2">
            <Select className="flex-1" value={s.ai.ollamaModel} onChange={(v) => ai({ ollamaModel: v })} options={[...(status?.ollamaModels || []).map((m) => ({ value: m.name, label: `${m.name} (${(m.size / 1e9).toFixed(1)} GB)` })), ...(status?.ollamaModels.some((m) => m.name === s.ai.ollamaModel) ? [] : [{ value: s.ai.ollamaModel, label: s.ai.ollamaModel }])]} />
            <IconButton title={t('Refresh list')} onClick={() => void load()}><RefreshCw size={14} /></IconButton>
          </div>
        </Field>
      </Section>
      <Section title="Claude (Anthropic API)" hint={t('The key from console.anthropic.com is stored {where}. Email content is then sent to the Anthropic API.', { where: useStore.getState().secretStore })}>
        <Field label={status?.hasClaudeKey ? t('API key (saved — enter a new one to change it)') : t('API key')}>
          <div className="flex gap-2">
            <input className={inputCls} type="password" placeholder="sk-ant-…" value={key} onChange={(e) => setKey(e.target.value)} />
            <Button onClick={async () => (await api.setClaudeKey(key || null), setKey(''), toast({ level: 'success', message: key ? t('Key saved') : t('Key removed') }), void load())}>{key ? t('Save') : t('Remove')}</Button>
          </div>
        </Field>
        <Field label="Model"><Select value={s.ai.claudeModel} onChange={(v) => ai({ claudeModel: v })} options={(status?.claudeModels || []).map((m) => ({ value: m.id, label: m.label }))} /></Field>
      </Section>
      <Section title={t('Style')}>
        <Field label={t('Reply language')}><Select value={s.ai.replyLanguage} onChange={(v) => ai({ replyLanguage: v })} options={[{ value: 'auto', label: t('Same as the conversation') }, { value: 'pl', label: t('Always in Polish') }, { value: 'en', label: t('Always in English') }]} /></Field>
        <Field label={t('About me (persona)')} hint={t('Who you are and how you write — the AI uses this when drafting replies.')}>
          <textarea className={cx(inputCls, 'h-24 py-2')} value={s.ai.persona} placeholder={t('e.g. Anna, owner of a small design studio. I write briefly and to the point, on a first-name basis.')} onChange={(e) => ai({ persona: e.target.value })} />
        </Field>
      </Section>
    </>
  )
}

function AgentsTab() {
  const { accounts, refreshMeta, toast } = useStore()
  const [cli, setCli] = useState<{ script: string; node: string; packaged: boolean } | null>(null)
  const [hist, setHist] = useState<Awaited<ReturnType<typeof api.history>>>([])
  useEffect(() => {
    void window.octo.cliPath().then(setCli)
    void api.history(40).then((h) => setHist(h.filter((x) => x.actor === 'cli' || x.actor === 'mcp')))
  }, [])
  const octo = cli ? (cli.packaged ? `"${cli.script}"` : `node "${cli.script}"`) : 'octo'
  const mcpCmd = cli ? `claude mcp add octopus-mail --scope user -- ${octo} mcp` : ''
  const copy = (text: string) =>
    void copyText(text).then(
      () => toast({ level: 'success', message: t('Copied') }),
      () => toast({ level: 'error', message: t('Could not copy') }),
    )
  return (
    <>
      <Section title={t('AI agent access level')} hint={t('Applies to the `octo` CLI and the MCP server (Claude Code, Claude Desktop). It can only be changed here — an agent cannot raise its own permissions.')}>
        {accounts.map((a) => (
          <div key={a.id} className="flex items-center gap-3 py-1.5">
            <span className="flex-1 text-[13.5px]">{a.email}</span>
            <Select className="w-72" value={a.agent_access} onChange={async (v) => (await api.setAgentAccess(a.id, v), void refreshMeta())} options={ACCESS} />
          </div>
        ))}
      </Section>
      <Section title={t('Connect to Claude Code')} hint={t('Once, in a terminal. Claude can then read and triage your mail and (if you allow it) send mail and manage your calendar.')}>
        <div className="flex items-center gap-2 py-1">
          <code className="selectable flex-1 break-all rounded-lg bg-surface-2 px-2 py-1.5 text-[12px]">{mcpCmd}</code>
          <IconButton title={t('Copy')} onClick={() => copy(mcpCmd)}><Copy size={14} /></IconButton>
        </div>
        <div className="py-1 text-[12.5px] text-muted">
          {rich(t('Command line: {cmd}. The CLI also works when the app is closed and prints times in local time with the UTC offset.'), { cmd: <code className="selectable">{octo} help</code> })}
        </div>
      </Section>
      <Section title={t('Recent agent activity')}>
        {hist.length === 0 ? <div className="py-2 text-[12.5px] text-muted">{t('None')}</div> : hist.map((h) => (
          <div key={h.id} className="flex gap-3 py-1 text-[12.5px]">
            <span className="w-40 shrink-0 text-muted">{fullDate(h.at)}</span>
            <span className="w-10 shrink-0 font-medium">{h.actor}</span>
            <span className={cx('flex-1 truncate', !h.ok && 'text-danger')}>{h.action} {h.target ? `#${h.target}` : ''} {h.details ? `· ${h.details}` : ''}</span>
          </div>
        ))}
      </Section>
    </>
  )
}

function CalendarsTab() {
  const [sources, setSources] = useState<Awaited<ReturnType<typeof api.listCalendarSources>>>([])
  const toast = useStore((s) => s.toast)
  const load = async () => setSources(await api.listCalendarSources())
  useEffect(() => void load(), [])
  return (
    <Section title={t('Calendar sources')} hint={t('Google Calendar is added automatically for accounts signed in with Google OAuth. Add others (iCloud, Fastmail, Nextcloud, ICS, local) in the Calendar view.')}>
      {sources.map((s) => (
        <div key={s.id} className="flex items-center gap-3 border-b border-line py-2 last:border-0">
          <div className="min-w-0 flex-1">
            <div className="font-medium">{s.name} <span className="text-[12px] font-normal text-muted">({s.kind})</span></div>
            <div className="text-[12px] text-muted">{s.last_error ? <span className="text-danger">{s.last_error}</span> : s.last_sync ? t('synced {when}', { when: fullDate(s.last_sync) }) : ''}</div>
          </div>
          <IconButton title={t('Sync')} onClick={() => void api.syncCalendars(s.id).then(load).catch((e) => toast({ level: 'error', message: errorText(e) }))}><RefreshCw size={14} /></IconButton>
          <IconButton title={t('Remove')} onClick={async () => window.confirm(t('Remove this calendar source?')) && (await api.removeCalendarSource(s.id), void load())}><Trash2 size={14} /></IconButton>
        </div>
      ))}
      {!sources.length && <div className="py-2 text-[12.5px] text-muted">{t('No calendars.')}</div>}
    </Section>
  )
}

type ServerStatus =
  | { mode: 'local' }
  | { mode: 'remote'; url: string; deviceId: string; deviceName: string; serverName?: string; online: boolean; devices: { id: string; name: string; createdAt: number; lastSeen: number | null; lastIp: string | null }[] }

/** "Add device": optional name, then a one-time code with a countdown and a Copy button. Works in the app and in a paired browser. */
function PairingCodeBox({ url }: { url: string }) {
  const toast = useStore((s) => s.toast)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<{ code: string; expires: number } | null>(null)
  const [left, setLeft] = useState(0)
  useEffect(() => {
    if (!res) return
    const tick = () => setLeft(Math.max(0, Math.ceil((res.expires - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [res])
  const create = async () => {
    setBusy(true)
    try {
      const r = (await window.octo.serverNewCode(name.trim() || undefined)) as { code?: string; expires?: number; error?: string }
      if (!r.code || !r.expires) throw new Error(r.error || t('Could not create a code'))
      setRes({ code: r.code, expires: r.expires })
    } catch (e) {
      toast({ level: 'error', message: errorText(e) })
    } finally {
      setBusy(false)
    }
  }
  const copy = async () => {
    try {
      await copyText(res!.code)
      toast({ level: 'success', message: t('Copied') })
    } catch (e) {
      toast({ level: 'error', message: errorText(e) })
    }
  }
  const expired = !!res && left <= 0
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
  return (
    <>
      <div className="py-2">
        {!open ? (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus size={14} /> {t('Add device')}
          </Button>
        ) : (
          !res && (
            <div className="flex items-center gap-2 max-md:flex-wrap">
              <input className={cx(inputCls, 'max-w-[260px]')} placeholder={t('Device name (optional)')} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void create()} />
              <Button size="sm" variant="primary" disabled={busy} onClick={() => void create()}>
                {busy && <Spinner />} {t('Create code')}
              </Button>
            </div>
          )
        )}
      </div>
      {res && (
        <div className="mb-2 rounded-xl bg-accent-soft p-4 text-center">
          <div className="text-[12.5px] text-muted">{expired ? t('The code has expired') : t('Pairing code (one-time, expires in {time})', { time: mmss })}</div>
          <div className={cx('selectable my-1 font-mono text-[28px] font-semibold tracking-[0.2em]', expired ? 'text-muted line-through' : 'text-accent')}>{res.code}</div>
          <div className="mb-2 flex justify-center gap-2">
            {expired ? (
              <Button size="sm" variant="primary" disabled={busy} onClick={() => void create()}>
                {busy && <Spinner />} {t('New code')}
              </Button>
            ) : (
              <Button size="sm" onClick={() => void copy()}>
                <Copy size={14} /> {t('Copy')}
              </Button>
            )}
          </div>
          <div className="text-[12.5px] text-muted">{rich(t('Computer: Settings → Home server. Phone or browser: open {url} and enter the code.'), { url: <b className="selectable">{url}</b> })}</div>
        </div>
      )}
    </>
  )
}

function ServerTab() {
  const toast = useStore((s) => s.toast)
  const [st, setSt] = useState<ServerStatus | null>(null)
  const [url, setUrl] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [probe, setProbe] = useState('')
  const load = async () => setSt((await window.octo.serverStatus()) as ServerStatus)
  useEffect(() => void load(), [])
  if (!st) return <Spinner />

  if (st.mode === 'local') {
    const check = async () => {
      if (!url.trim()) return
      try {
        const info = await window.octo.serverProbe(url)
        setProbe(`✓ ${t('Found the server “{host}” (version {version})', { host: info.hostname, version: info.version })}`)
      } catch (e) {
        setProbe(`✗ ${errorText(e)}`)
      }
    }
    const connect = async () => {
      if (!window.confirm(t('After connecting, the app restarts and uses the accounts on the home server. Accounts added on this computer stay here, but are not used until you disconnect the server. Continue?'))) return
      setBusy(true)
      try {
        await window.octo.serverConnect(url, code, name)
      } catch (e) {
        toast({ level: 'error', message: errorText(e) })
        setBusy(false)
      }
    }
    return (
      <>
        <Section title={t('Home server')} hint={t('An always-on computer (Raspberry Pi, NAS, old laptop) running Octopus Mail. It sends scheduled messages and brings back snoozed messages and reminders even when your computers are off, and all your computers and your phone’s browser see the same accounts.')}>
          <div className="py-2 text-[13px] leading-relaxed">
            <div className="mb-1 font-medium">{t('1. On the server, run:')}</div>
            <code className="selectable block rounded-lg bg-surface-2 px-3 py-2 text-[12.5px]">octo serve</code>
            <div className="mt-1 text-[12px] text-muted">
              {rich(t('It prints the address (e.g. {example}) and a pairing code. Installing on a Raspberry Pi: README, section “Home server”.'), { example: <code>http://192.168.1.50:8787</code> })}
            </div>
            <div className="mb-1 mt-3 font-medium">{t('2. Connect this app:')}</div>
          </div>
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-4">
            <Field label={t('Server address')}>
              <input className={inputCls} placeholder={t('e.g. 192.168.1.50 or raspberrypi.local')} value={url} onChange={(e) => (setUrl(e.target.value), setProbe(''))} onBlur={() => void check()} />
            </Field>
            <Field label={t('Pairing code')}>
              <input className={cx(inputCls, 'uppercase tracking-widest')} placeholder="XXXX-XXXX" maxLength={9} value={code} onChange={(e) => setCode(e.target.value)} />
            </Field>
            <Field label={t('Name of this device')}>
              <input className={inputCls} placeholder={t('e.g. Anna’s laptop')} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <div className="flex items-end pb-1.5">
              <Button variant="primary" disabled={busy || !url.trim() || code.replace(/[^A-Za-z0-9]/g, '').length < 8} onClick={() => void connect()}>
                {busy && <Spinner />} {t('Connect to server')}
              </Button>
            </div>
          </div>
          {probe && <div className={cx('pb-2 text-[12.5px]', probe.startsWith('✓') ? 'text-success' : 'text-danger')}>{probe}</div>}
        </Section>
        <Section title={t('Security')}>
          <div className="py-2 text-[12.5px] leading-relaxed text-muted">
            {t('Each device gets its own key, which you can revoke at any time. The server stores your mailbox passwords, so keep it on your home network. For access from outside your home, use a VPN (e.g. Tailscale) rather than port forwarding on your router.')}
          </div>
        </Section>
      </>
    )
  }

  const host = (() => {
    try {
      return new URL(st.url).hostname
    } catch {
      return t('server')
    }
  })()
  return (
    <>
      <Section title={t('Home server')}>
        <div className="flex items-center gap-3 py-2">
          <span className={cx('h-2.5 w-2.5 rounded-full', st.online ? 'bg-success' : 'bg-danger')} />
          <div className="min-w-0 flex-1">
            <div className="font-medium">
              {st.serverName || t('Server')} <span className="font-normal text-muted">{st.url}</span>
            </div>
            <div className="text-[12px] text-muted">
              {st.online ? t('Connected') : t('Not connected — the app keeps retrying')} · {t('this device: {name}', { name: st.deviceName })}
            </div>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={async () => {
              if (window.confirm(t('Disconnect this app from the home server? It restarts in local mode (with the accounts added on this computer).'))) await window.octo.serverDisconnect()
            }}
          >
            <Unplug size={14} /> {t('Disconnect')}
          </Button>
        </div>
      </Section>
      <Section title={t('Devices')} hint={t('Computers and browsers that have access to your mail on the server.')}>
        {st.devices.map((d) => (
          <div key={d.id} className="flex items-center gap-3 border-b border-line py-2 last:border-0">
            {/telefon|phone/i.test(d.name) ? <Smartphone size={16} className="text-muted" /> : <Server size={16} className="text-muted" />}
            <div className="min-w-0 flex-1">
              <div className="font-medium">
                {d.name}
                {d.id === st.deviceId && <span className="ml-2 text-[11.5px] font-normal text-accent">{t('this device')}</span>}
              </div>
              <div className="text-[12px] text-muted">
                {t('paired {when}', { when: fullDate(d.createdAt) })} · {t('last seen {when}', { when: d.lastSeen ? fullDate(d.lastSeen) : '—' })}
                {d.lastIp ? ` · ${d.lastIp}` : ''}
              </div>
            </div>
            {d.id !== st.deviceId && (
              <Button size="sm" variant="ghost" onClick={async () => window.confirm(t('Revoke access for the device “{name}”?', { name: d.name })) && (await window.octo.serverRevoke(d.id), void load())}>
                {t('Revoke access')}
              </Button>
            )}
          </div>
        ))}
        <PairingCodeBox url={st.url} />
      </Section>
      <Section title={t('Claude Code with a home server')}>
        <div className="py-2 text-[12.5px] leading-relaxed text-muted">
          {rich(t('The agent connects to the server over SSH, e.g.: {cmd}'), { cmd: <code className="selectable">claude mcp add octopus-mail --scope user -- ssh pi@{host} octo mcp</code> })}
        </div>
      </Section>
    </>
  )
}

const SHORTCUTS: [string, string][] = [
  ['C / Ctrl+N', t('New message')], ['Ctrl+K', t('Command palette')], [t('/ or Ctrl+F'), t('Search')], ['J / K, ↓ / ↑', t('Next / previous conversation')],
  ['E', t('Done (archive)')], ['#, Delete', t('Move to Trash')], ['S', t('Pin / unpin')], ['H', t('Snooze')], ['V', t('Move to folder')],
  ['U', t('Read / unread')], ['M', t('Mute')], ['!', 'Spam'], ['R / A / F', t('Reply / reply all / forward')], ['X', t('Select')],
  ['Ctrl+Z', t('Undo last action')], ['Ctrl+Enter', t('Send (in the editor)')], ['Esc', t('Close / deselect')],
  [t('G then I / S / D / P / Z / A / T / N'), t('Go to: Inbox / Sent / Drafts / Pinned / Snoozed / Archive / Trash / New senders')], [t('G then C'), t('Calendar')],
]

function AboutTab() {
  const [dir, setDir] = useState('')
  useEffect(() => void window.octo.dataDir().then(setDir), [])
  return (
    <Section title={`Octopus Mail ${APP_VERSION}`}>
      <div className="py-1 text-[13px]">{t('A free email client with Smart Inbox, Gatekeeper, AI, a calendar and access for AI agents.')}</div>
      <div className="py-1 text-[12.5px] text-muted">
        {t('Open source (MIT license):')}{' '}
        <button className="text-accent hover:underline" onClick={() => void window.octo.openExternal('https://github.com/CFGPeter/octopus-mail')}>github.com/CFGPeter/octopus-mail</button>
        {' · '}
        <button className="text-accent hover:underline" onClick={() => void window.octo.openExternal('https://github.com/CFGPeter/octopus-mail/issues')}>{t('report a bug')}</button>
      </div>
      <div className="py-1 text-[12.5px] text-muted">{t('App data:')} <button className="text-accent hover:underline" onClick={() => void window.octo.showItem(dir)}>{dir}</button></div>
    </Section>
  )
}

export default function SettingsView() {
  const narrow = useNarrow()
  // on a phone the tab list and the tab content are two screens
  const [picked, setTab] = useState<Tab | null>(narrow ? null : 'accounts')
  const tab = picked ?? (narrow ? null : 'accounts')
  const setView = useStore((s) => s.setView)
  return (
    <div className="flex h-full min-w-0 flex-1 bg-bg">
      <div className={cx('w-[230px] shrink-0 overflow-y-auto border-r border-line bg-surface p-2', narrow && (tab ? 'hidden' : 'w-full border-r-0'))}>
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <div className="text-[15px] font-semibold">{t('Settings')}</div>
          <IconButton title={t('Close')} onClick={() => setView('mail')}><X size={15} /></IconButton>
        </div>
        {TABS.map((x) => (
          <button key={x.id} onClick={() => setTab(x.id)} className={cx('flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13.5px] max-md:h-11 max-md:text-[15px]', tab === x.id ? 'bg-accent-soft font-medium text-accent' : 'hover:bg-hover')}>
            <span className="text-muted">{x.icon}</span> {x.label}
          </button>
        ))}
      </div>
      <div className={cx('min-w-0 flex-1 overflow-y-auto px-8 py-6 max-md:px-3 max-md:py-3', narrow && !tab && 'hidden')}>
        {narrow && (
          <button className="mb-2 flex h-9 items-center gap-1 text-[14px] text-accent" onClick={() => setTab(null)}>
            <ChevronLeft size={18} /> {t('Settings')}
          </button>
        )}
        <div className="mx-auto max-w-[760px]">
          {tab === 'accounts' && <AccountsTab />}
          {tab === 'general' && <GeneralTab />}
          {tab === 'inbox' && <InboxTab />}
          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'signatures' && <SignaturesTab />}
          {tab === 'templates' && <TemplatesTab />}
          {tab === 'rules' && <RulesTab />}
          {tab === 'ai' && <AiTab />}
          {tab === 'agents' && <AgentsTab />}
          {tab === 'calendars' && <CalendarsTab />}
          {tab === 'server' && <ServerTab />}
          {tab === 'shortcuts' && (
            <Section title={t('Keyboard shortcuts')}>
              {SHORTCUTS.map(([k, d]) => (
                <div key={k} className="flex items-center gap-3 border-b border-line py-1.5 last:border-0">
                  <span className="w-64 shrink-0"><span className="kbd">{k}</span></span>
                  <span className="text-[13px]">{d}</span>
                </div>
              ))}
            </Section>
          )}
          {tab === 'about' && <AboutTab />}
        </div>
      </div>
    </div>
  )
}
