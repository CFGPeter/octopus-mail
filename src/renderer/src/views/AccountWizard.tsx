import { ChevronDown, ChevronRight, ExternalLink, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { t, tp } from '../../../shared/i18n'
import logo from '../assets/logo.svg'
import { api, errorText } from '../lib/api'
import { useStore } from '../lib/store'
import { Button, cx, Field, inputCls, Spinner, Toggle } from '../components/ui'
import { Welcome } from '../components/illustrations'

type Cfg = Awaited<ReturnType<typeof api.discover>>

const QUICK = [
  { id: 'gmail', label: 'Gmail', domain: 'gmail.com' },
  { id: 'outlook', label: 'Outlook', domain: 'outlook.com' },
  { id: 'icloud', label: 'iCloud', domain: 'icloud.com' },
  { id: 'infomaniak', label: 'Infomaniak', domain: 'ik.me' },
  { id: 'homepl', label: 'home.pl', domain: '' },
  { id: 'mailcom', label: 'mail.com', domain: 'mail.com' },
  { id: 'wp', label: 'WP / o2 / Onet', domain: 'wp.pl' },
  { id: 'imap', label: t('Other (IMAP)'), domain: '' },
]

function OAuthSetup({ provider, onSaved }: { provider: 'google' | 'microsoft'; onSaved: () => void }) {
  const [id, setId] = useState('')
  const [secret, setSecret] = useState('')
  const toast = useStore((s) => s.toast)
  return (
    <div className="mt-2 rounded-xl border border-line bg-surface-2 p-3 text-[12.5px]">
      <div className="mb-2 text-muted">
        {provider === 'google' ? (
          <>
            {t('Google sign-in needs your own “OAuth Client ID” (free): Google Cloud Console → APIs & Services → Credentials →')} <b>Create OAuth client ID</b>{' '}
            {t('→ type')} <b>Desktop app</b>
            {t('. Enable Gmail API, Google Calendar API and People API, and add your address as a “Test user”.')}
          </>
        ) : (
          <>
            {t('Microsoft sign-in needs an “Application (client) ID” from Azure Portal → App registrations → New registration (personal and work accounts), platform')}{' '}
            <b>Mobile and desktop</b> {t('with the redirect URI')} <code>http://localhost</code>.
          </>
        )}
        <button className="ml-1 inline-flex items-center gap-0.5 text-accent hover:underline" onClick={() => void window.octo.openExternal(provider === 'google' ? 'https://console.cloud.google.com/apis/credentials' : 'https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade')}>
          {t('open console')} <ExternalLink size={11} />
        </button>
      </div>
      <input className={cx(inputCls, 'mb-1.5')} placeholder="Client ID" value={id} onChange={(e) => setId(e.target.value)} />
      {provider === 'google' && <input className={cx(inputCls, 'mb-1.5')} placeholder="Client secret" value={secret} onChange={(e) => setSecret(e.target.value)} />}
      <Button size="sm" variant="primary" disabled={!id.trim()} onClick={async () => {
        await api.setKV(`oauth.${provider}`, { clientId: id.trim(), clientSecret: secret.trim() || undefined })
        toast({ level: 'success', message: t('OAuth settings saved') })
        onSaved()
      }}>{t('Save')}</Button>
    </div>
  )
}

export default function AccountWizard({ welcome, onDone }: { welcome?: boolean; onDone?: () => void }) {
  const { toast, refreshMeta, secretStore } = useStore()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [cfg, setCfg] = useState<Cfg | null>(null)
  const [advanced, setAdvanced] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [syncDays, setSyncDays] = useState(90)
  const [oauthSetup, setOauthSetup] = useState<'google' | 'microsoft' | null>(null)
  const [provider, setProvider] = useState('')

  const detect = async (addr = email) => {
    if (!/@.+\./.test(addr)) return
    setBusy(true)
    setError('')
    try {
      setCfg(await api.discover(addr))
    } catch (e) {
      setError(errorText(e))
    }
    setBusy(false)
  }

  const add = async () => {
    setBusy(true)
    setError('')
    try {
      if (!cfg) throw new Error(t('Enter your address first so the server settings can be detected'))
      await api.addAccount({
        email, name: name || undefined, password, username: (cfg as Cfg & { username?: string }).username || email, provider: cfg.provider, sync_days: syncDays,
        imap_host: cfg.imap_host, imap_port: cfg.imap_port, imap_secure: cfg.imap_secure,
        smtp_host: cfg.smtp_host, smtp_port: cfg.smtp_port, smtp_secure: cfg.smtp_secure,
      } as Parameters<typeof api.addAccount>[0])
      toast({ level: 'success', message: t('Added {email} — first sync in progress', { email }) })
      setEmail('')
      setPassword('')
      setCfg(null)
      await refreshMeta()
      onDone?.()
    } catch (e) {
      setError(errorText(e))
    }
    setBusy(false)
  }

  const oauth = async (p: 'google' | 'microsoft') => {
    setBusy(true)
    setError('')
    try {
      const has = (await api.getKV(`oauth.${p}`, null)) as { clientId?: string } | null
      if (!has?.clientId) {
        setOauthSetup(p)
        setBusy(false)
        return
      }
      toast({ level: 'info', message: t('Finish signing in in your browser…') })
      const acc = await window.octo.oauthAddAccount(p, email || undefined, name || undefined)
      toast({ level: 'success', message: t('Added {email}', { email: acc.email }) })
      await refreshMeta()
      onDone?.()
    } catch (e) {
      setError(errorText(e))
    }
    setBusy(false)
  }

  const set = (k: string, v: unknown) => setCfg((c) => (c ? ({ ...c, [k]: v } as Cfg) : c))

  return (
    <div className={cx('flex h-full w-full justify-center overflow-y-auto', welcome && 'bg-bg pt-[6vh]')}>
      <div className={cx('w-full max-w-[560px] p-6', welcome && 'rounded-2xl border border-line bg-surface')} style={welcome ? { boxShadow: 'var(--shadow)', height: 'fit-content' } : undefined}>
        {welcome && (
          <div className="mb-5 text-center">
            <div className="mb-3 flex justify-center"><Welcome /></div>
            <h1 className="flex items-center justify-center gap-2 text-[22px] font-semibold">
              <img src={logo} alt="" className="h-8 w-8" draggable={false} />
              {t('Welcome to Octopus Mail')}
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              {t('Free email with Smart Inbox, AI and a calendar. Everything stays on this computer, and passwords are kept {secretStore}.', { secretStore })}
            </p>
          </div>
        )}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setProvider(q.id)
                if (q.domain && !email.includes('@')) setEmail(email ? `${email}@${q.domain}` : '')
              }}
              className={cx('rounded-lg border px-2.5 py-1 text-[12.5px]', provider === q.id ? 'border-accent bg-accent-soft text-accent' : 'border-line hover:bg-hover')}
            >
              {q.label}
            </button>
          ))}
        </div>

        <Field label={t('Email address')}>
          <input className={inputCls} value={email} placeholder={t('you@example.com')} onChange={(e) => (setEmail(e.target.value.trim()), setCfg(null))} onBlur={() => void detect()} autoFocus />
        </Field>
        <Field label={t('Your name (sender)')}>
          <input className={inputCls} value={name} placeholder={t('e.g. John Smith')} onChange={(e) => setName(e.target.value)} />
        </Field>

        {(provider === 'gmail' || cfg?.provider === 'gmail' || provider === 'outlook' || cfg?.provider === 'outlook') && (
          <div className="my-2 rounded-xl border border-line p-3">
            <div className="mb-2 flex items-center gap-2 text-[13px] font-medium"><ShieldCheck size={15} className="text-success" /> {t('Sign in without a password (OAuth)')}</div>
            <div className="flex gap-2">
              {(provider === 'gmail' || cfg?.provider === 'gmail') && <Button disabled={busy} onClick={() => void oauth('google')}>{t('Sign in with Google')}</Button>}
              {(provider === 'outlook' || cfg?.provider === 'outlook') && <Button disabled={busy} onClick={() => void oauth('microsoft')}>{t('Sign in with Microsoft')}</Button>}
            </div>
            {oauthSetup && <OAuthSetup provider={oauthSetup} onSaved={() => (setOauthSetup(null), void oauth(oauthSetup))} />}
            <div className="mt-2 text-[12px] text-muted">{t('…or use an app password below.')}</div>
          </div>
        )}

        <Field label={<span className="flex items-center gap-1"><KeyRound size={13} /> {t('Password (or app password)')}</span>} hint={cfg?.hint}>
          <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void add()} />
        </Field>
        {cfg?.provider === 'gmail' && (
          <button className="mb-1 inline-flex items-center gap-1 text-[12px] text-accent hover:underline" onClick={() => void window.octo.openExternal('https://myaccount.google.com/apppasswords')}>
            {t('Create a Google app password')} <ExternalLink size={11} />
          </button>
        )}

        {busy && !cfg && <div className="flex items-center gap-2 py-2 text-[12.5px] text-muted"><Spinner /> {t('Detecting server settings…')}</div>}
        {cfg && (
          <div className="mt-2 rounded-xl border border-line bg-surface-2 p-3 text-[12.5px]">
            <button className="flex w-full items-center gap-1 text-left" onClick={() => setAdvanced(!advanced)}>
              {advanced ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Mail size={13} className="text-muted" />
              <span className="flex-1">{cfg.label}: IMAP <b>{cfg.imap_host || '?'}</b>:{cfg.imap_port} · SMTP <b>{cfg.smtp_host || '?'}</b>:{cfg.smtp_port}</span>
              <span className="text-accent">{t('change')}</span>
            </button>
            {advanced && (
              <div className="mt-2 grid grid-cols-[1fr_90px] gap-x-2">
                <Field label={t('IMAP server')}><input className={inputCls} value={cfg.imap_host} onChange={(e) => set('imap_host', e.target.value)} /></Field>
                <Field label="Port"><input className={inputCls} value={cfg.imap_port} onChange={(e) => set('imap_port', Number(e.target.value))} /></Field>
                <Toggle checked={cfg.imap_secure} onChange={(v) => set('imap_secure', v)} label={t('IMAP over SSL/TLS')} />
                <span />
                <Field label={t('SMTP server')}><input className={inputCls} value={cfg.smtp_host} onChange={(e) => set('smtp_host', e.target.value)} /></Field>
                <Field label="Port"><input className={inputCls} value={cfg.smtp_port} onChange={(e) => set('smtp_port', Number(e.target.value))} /></Field>
                <Toggle checked={cfg.smtp_secure} onChange={(v) => set('smtp_secure', v)} label={t('SMTP over SSL (465)')} hint={t('off = STARTTLS (587)')} />
                <span />
                <Field label={t('Username (if different from the address)')}><input className={inputCls} value={(cfg as Cfg & { username?: string }).username || ''} placeholder={email} onChange={(e) => set('username', e.target.value)} /></Field>
                <Field label={t('Days back')}><input className={inputCls} value={syncDays} onChange={(e) => setSyncDays(Number(e.target.value) || 90)} /></Field>
              </div>
            )}
          </div>
        )}
        {error && <div className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-[12.5px] text-danger">{error}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="primary" disabled={busy || !email || !password} onClick={() => void add()}>
            {busy && cfg ? <Spinner /> : null} {t('Add account')}
          </Button>
        </div>
        <p className="mt-3 text-[11.5px] text-faint">
          {tp(
            syncDays,
            'Your IMAP and SMTP sign-in is checked before saving. Mail from the last {n} day is downloaded now; older mail loads as you scroll.',
            'Your IMAP and SMTP sign-in is checked before saving. Mail from the last {n} days is downloaded now; older mail loads as you scroll.',
          )}
        </p>
      </div>
    </div>
  )
}
