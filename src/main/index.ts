import fs from 'node:fs'
import path from 'node:path'
import {
  app, BrowserWindow, clipboard, dialog, ipcMain, Menu, nativeImage, Notification, protocol, net, shell, Tray, type MenuItemConstructorOptions,
} from 'electron'
import os from 'node:os'
import { getLang, initLang, t, tp, type Lang, type LangSetting } from '../shared/i18n'
import type { CoreEvent } from '../shared/types'
import { log } from '../core/events'
import { startOAuth, type OAuthClient, type OAuthProvider } from '../core/oauth'
import { dataDir } from '../core/paths'
import { type Backend, LocalBackend, loadRemoteConfig, RemoteBackend, remoteConfigPath } from './backend'

const PROTOCOL = 'octopus-mail'
let win: BrowserWindow | null = null
let tray: Tray | null = null
let quitting = false

// Test/demo profiles (OCTO_HOME) get their own Chromium profile and single-instance lock,
// so they never collide with — or wake up — the installed app running on the real profile.
const isolatedProfile = !!process.env.OCTO_HOME
if (isolatedProfile) app.setPath('userData', path.join(process.env.OCTO_HOME!, 'electron-profile'))

// Data lives either in the local engine or on a paired home server (Settings → Home server).
const remoteConfig = loadRemoteConfig()
const backend: Backend = remoteConfig ? new RemoteBackend(remoteConfig) : new LocalBackend()

// one instance only; a second launch (e.g. an octopus-mail:// link) is forwarded to the first
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', (_e, argv) => {
    showWindow()
    const link = argv.find((a) => a.startsWith(`${PROTOCOL}://`))
    if (link) openDeepLink(link)
  })
}

if (process.platform === 'win32') app.setAppUserModelId('pl.madoctopus.octopusmail')
if (isolatedProfile) {
  // never take over octopus-mail:// links from the installed app
} else if (process.defaultApp) {
  if (process.argv.length >= 2) app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])])
} else {
  app.setAsDefaultProtocolClient(PROTOCOL)
}

/** Tray images: ICO on Windows, PNG elsewhere (Linux/macOS trays cannot read ICO). */
function trayIcon(unread: boolean): string {
  const base = unread ? 'tray-unread' : 'tray'
  // macOS menu bar: monochrome "Template" image (16 pt, @2x picked automatically), tinted by the system
  if (process.platform === 'darwin') return iconPath(unread ? 'trayUnreadTemplate.png' : 'trayTemplate.png')
  return iconPath(process.platform === 'win32' ? `${base}.ico` : `${base}.png`)
}

protocol.registerSchemesAsPrivileged([{ scheme: 'octo-cid', privileges: { standard: true, secure: true, supportFetchAPI: true, bypassCSP: false } }])

const demoTitle = () => t('Octopus Mail — DEMO (test profile)')

function iconPath(filename = 'icon.png'): string {
  const candidates = [
    path.join(process.resourcesPath || '', filename),
    path.join(app.getAppPath(), 'resources', filename),
    path.join(__dirname, '../../resources', filename),
  ]
  return candidates.find((p) => fs.existsSync(p)) || ''
}

function createWindow(show = true): void {
  const icon = iconPath()
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    show: false,
    title: 'Octopus Mail',
    icon: icon || undefined,
    backgroundColor: '#f7f7f9',
    autoHideMenuBar: true,
    ...(process.platform === 'darwin' ? { titleBarStyle: 'hiddenInset' as const, trafficLightPosition: { x: 16, y: 18 } } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
      spellcheck: true,
      webviewTag: false,
    },
  })
  if (isolatedProfile) {
    // make test/demo windows obviously different from the real app
    win.setTitle(demoTitle())
    win.on('page-title-updated', (e) => e.preventDefault())
  }
  win.webContents.session.setSpellCheckerLanguages(['pl', 'en-US'])
  win.once('ready-to-show', () => show && win?.show())
  win.on('close', (e) => {
    if (!quitting && backend.settings().minimizeToTray) {
      e.preventDefault()
      win?.hide()
    }
  })
  // every link from an e-mail or the UI opens in the default browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^(https?|mailto):/i.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      e.preventDefault()
      if (/^(https?|mailto):/i.test(url)) void shell.openExternal(url)
    }
  })
  win.webContents.on('context-menu', (_e, params) => {
    const items: MenuItemConstructorOptions[] = []
    for (const s of params.dictionarySuggestions.slice(0, 5)) items.push({ label: s, click: () => win?.webContents.replaceMisspelling(s) })
    if (params.misspelledWord) items.push({ label: t('Add to dictionary'), click: () => win?.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord) }, { type: 'separator' })
    if (params.linkURL) items.push({ label: t('Copy link'), click: () => clipboard.writeText(params.linkURL) })
    if (params.isEditable) items.push({ role: 'cut', label: t('Cut') }, { role: 'copy', label: t('Copy') }, { role: 'paste', label: t('Paste') }, { role: 'pasteAndMatchStyle', label: t('Paste as plain text') })
    else if (params.selectionText) items.push({ role: 'copy', label: t('Copy') })
    if (items.length) Menu.buildFromTemplate(items).popup()
  })

  if (process.env.OCTO_SCREENSHOT) scheduleScreenshots(win)
  if (process.env.ELECTRON_RENDERER_URL) void win.loadURL(process.env.ELECTRON_RENDERER_URL)
  else void win.loadFile(path.join(__dirname, '../renderer/index.html'))
}

/**
 * Development aid: OCTO_SCREENSHOT=<dir> captures the window to PNG files after load.
 * OCTO_SCREENSHOT_STEPS is a JSON array of {js?: string, wait?: number, name: string}
 * evaluated in the renderer before each capture. The app quits afterwards.
 */
function scheduleScreenshots(w: BrowserWindow): void {
  const dir = process.env.OCTO_SCREENSHOT!
  fs.mkdirSync(dir, { recursive: true })
  const steps: { js?: string; wait?: number; name: string }[] = process.env.OCTO_SCREENSHOT_STEPS
    ? JSON.parse(process.env.OCTO_SCREENSHOT_STEPS)
    : [{ name: 'main', wait: 4000 }]
  w.webContents.once('did-finish-load', async () => {
    for (const step of steps) {
      try {
        if (step.js) await w.webContents.executeJavaScript(step.js, true)
      } catch (e) {
        log('screenshot', step.name, 'js failed', (e as Error).message)
      }
      await new Promise((r) => setTimeout(r, step.wait ?? 1500))
      const img = await w.webContents.capturePage()
      fs.writeFileSync(path.join(dir, `${step.name}.png`), img.toPNG())
    }
    quitting = true
    app.quit()
  })
}

function showWindow(): void {
  if (!win) createWindow()
  if (win?.isMinimized()) win.restore()
  win?.show()
  win?.focus()
}

function send(channel: string, payload: unknown): void {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload)
}

function openDeepLink(link: string): void {
  const m = link.match(/^octopus-mail:\/\/(draft|thread|message)\/(\d+)/)
  if (m) send('deep-link', { kind: m[1], id: Number(m[2]) })
}

// ---------- notifications ----------

function notify(title: string, body: string, onClick?: () => void): void {
  const st = backend.settings()
  if (!st.notifications || !Notification.isSupported()) return
  const n = new Notification({ title, body, silent: !st.notificationSound, icon: iconPath() || undefined })
  n.on('click', () => {
    showWindow()
    onClick?.()
  })
  n.show()
}

async function onNewMail(ev: Extract<CoreEvent, { type: 'new-mail' }>): Promise<void> {
  const rows = await backend.newMailInfo(ev.accountId, ev.messageIds).catch(() => [])
  if (!rows.length) return
  if (rows.length > 3) {
    notify(tp(rows.length, '{n} new message', '{n} new messages'), rows.map((r) => r.from_name || r.from_email).slice(0, 4).join(', '))
    return
  }
  for (const m of rows) notify(m.from_name || m.from_email, `${m.subject}\n${(m.snippet || '').slice(0, 120)}`, () => send('deep-link', { kind: 'thread', id: m.thread_id }))
}

let pendingMailboxEvent: NodeJS.Timeout | null = null
function forwardEvent(ev: CoreEvent): void {
  if (ev.type === 'mailbox-changed') {
    // coalesce bursts from sync into one UI refresh
    if (pendingMailboxEvent) return
    pendingMailboxEvent = setTimeout(() => {
      pendingMailboxEvent = null
      send('core-event', { type: 'mailbox-changed' })
      void updateBadge()
    }, 250)
    return
  }
  if (ev.type === 'new-mail') void onNewMail(ev)
  if (ev.type === 'server-connection') tray?.setToolTip(ev.online ? t('Octopus Mail — home server connected') : t('Octopus Mail — no connection to the home server'))
  if (ev.type === 'reminder') notify(t('⏰ Reminder'), ev.subject || t('(no subject)'), () => send('deep-link', { kind: 'thread', id: ev.threadId }))
  if (ev.type === 'toast' && ev.message.startsWith('📅') && (!win || !win.isVisible() || !win.isFocused())) notify(t('Calendar'), ev.message)
  send('core-event', ev)
}

async function updateBadge(): Promise<void> {
  try {
    const n = await backend.unreadCount()
    const icon = trayIcon(n > 0)
    if (icon) tray?.setImage(icon)
    tray?.setToolTip(n ? t('Octopus Mail — {n} unread', { n }) : 'Octopus Mail')
    send('badge-request', n)
  } catch {
    /* db busy */
  }
}

// ---------- IPC ----------

function registerIpc(): void {
  ipcMain.handle('svc', (_e, method: string, args: unknown[]) => backend.call(method, args || []))

  ipcMain.handle('svc-stream', (e, method: string, args: unknown[], streamId: string) =>
    backend.stream(method, args || [], (text) => e.sender.send('ai-delta', { streamId, text })),
  )

  ipcMain.handle('oauth-add-account', async (_e, provider: OAuthProvider, email?: string, name?: string) => {
    // the browser flow always runs here (it needs this computer's browser); with a home server
    // the client ID comes from the server and the resulting tokens are stored there
    const client = backend.kind === 'remote' ? ((await backend.call('getKV', [`oauth.${provider}`, null])) as OAuthClient | null) : null
    if (backend.kind === 'remote' && !client?.clientId) throw new Error(t('The home server has no OAuth Client ID set (Settings → Accounts → OAuth).'))
    const { url, done } = await startOAuth(provider, email, client)
    await shell.openExternal(url)
    const tokens = await done
    const address = (email || tokens.email || '').toLowerCase()
    if (!address) throw new Error(t("Couldn't determine the account's email address"))
    return backend.call('addAccount', [{
      email: address,
      name,
      provider: provider === 'google' ? 'gmail' : 'outlook',
      auth: provider === 'google' ? 'oauth-google' : 'oauth-microsoft',
      username: address,
      oauthTokens: tokens,
    }])
  })

  // ---- home server pairing ----
  ipcMain.handle('server-status', async () => {
    if (backend.kind !== 'remote') return { mode: 'local' as const }
    const r = backend as RemoteBackend
    let devices: unknown[] = []
    try {
      const res = await fetch(`${r.cfg.url}/api/devices`, { headers: { Authorization: `Bearer ${r.cfg.token}` } })
      devices = ((await res.json()) as { devices: unknown[] }).devices
    } catch {
      /* offline */
    }
    return { mode: 'remote' as const, url: r.cfg.url, deviceId: r.cfg.deviceId, deviceName: r.cfg.deviceName, serverName: r.cfg.serverName, online: r.online, devices }
  })
  ipcMain.handle('server-probe', (_e, url: string) => RemoteBackend.probe(url))
  ipcMain.handle('server-connect', async (_e, url: string, code: string, deviceName: string) => {
    const cfg = await RemoteBackend.pair(url, code, deviceName || os.hostname())
    fs.writeFileSync(remoteConfigPath(), JSON.stringify(cfg, null, 2), { mode: 0o600 })
    relaunch()
  })
  ipcMain.handle('server-disconnect', () => {
    fs.rmSync(remoteConfigPath(), { force: true })
    relaunch()
  })
  ipcMain.handle('server-new-code', async (_e, name?: string) => {
    if (backend.kind !== 'remote') throw new Error(t('The app is not connected to a home server'))
    const r = backend as RemoteBackend
    const res = await fetch(`${r.cfg.url}/api/devices/pair`, { method: 'POST', headers: { Authorization: `Bearer ${r.cfg.token}` }, body: JSON.stringify({ name }) })
    return res.json()
  })
  ipcMain.handle('server-revoke', async (_e, id: string) => {
    if (backend.kind !== 'remote') return false
    const r = backend as RemoteBackend
    await fetch(`${r.cfg.url}/api/devices/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${r.cfg.token}` } })
    return true
  })

  ipcMain.handle('pick-files', async () => {
    const r = await dialog.showOpenDialog(win!, { properties: ['openFile', 'multiSelections'] })
    return r.canceled ? [] : r.filePaths.map((p) => ({ filename: path.basename(p), path: p, size: fs.statSync(p).size }))
  })

  ipcMain.handle('open-attachment', async (_e, attId: number) => {
    const file = await backend.attachmentFile(attId)
    const err = await shell.openPath(file)
    if (err) throw new Error(err)
    return file
  })

  ipcMain.handle('save-attachment', async (_e, attId: number) => {
    const file = await backend.attachmentFile(attId)
    const r = await dialog.showSaveDialog(win!, { defaultPath: path.join(app.getPath('downloads'), path.basename(file).replace(/^\d+(_\d+)*-/, '')) })
    if (r.canceled || !r.filePath) return null
    fs.copyFileSync(file, r.filePath)
    return r.filePath
  })

  ipcMain.handle('save-all-attachments', async (_e, attIds: number[]) => {
    const r = await dialog.showOpenDialog(win!, { properties: ['openDirectory', 'createDirectory'], defaultPath: app.getPath('downloads') })
    if (r.canceled || !r.filePaths[0]) return 0
    for (const id of attIds) {
      const file = await backend.attachmentFile(id)
      fs.copyFileSync(file, path.join(r.filePaths[0], path.basename(file).replace(/^\d+(_\d+)*-/, '')))
    }
    return attIds.length
  })

  ipcMain.handle('open-external', (_e, url: string) => {
    if (/^(https?|mailto):/i.test(url)) return shell.openExternal(url)
  })
  ipcMain.handle('show-item', (_e, p: string) => shell.showItemInFolder(p))
  ipcMain.handle('data-dir', () => dataDir())
  ipcMain.handle('cli-path', () => {
    // installed: the octo wrapper next to the executable runs the CLI with Electron's own Node; dev: plain node + bundle
    const wrapper = process.platform === 'win32' ? 'octo.cmd' : 'octo'
    if (app.isPackaged) {
      // macOS: the wrapper sits in Contents/Resources (a script next to the binary would break code signing)
      const dir = process.platform === 'darwin' ? process.resourcesPath : path.dirname(process.execPath)
      return { script: path.join(dir, wrapper), node: '', packaged: true }
    }
    return { script: path.join(app.getAppPath(), 'out', 'cli', 'octo.js'), node: 'node', packaged: false }
  })
  ipcMain.handle('set-badge', (_e, dataUrl: string | null, count: number) => {
    if (!win) return
    if (process.platform !== 'win32') {
      // Linux launchers (Unity/GNOME docks) and the macOS dock show a numeric badge
      app.setBadgeCount(count || 0)
      return
    }
    if (!dataUrl || !count) win.setOverlayIcon(null, '')
    else win.setOverlayIcon(nativeImage.createFromDataURL(dataUrl), tp(count, '{n} unread', '{n} unread'))
  })
  ipcMain.handle('set-login-item', (_e, on: boolean) => setLaunchAtLogin(on))
  ipcMain.handle('window', (_e, cmd: 'minimize' | 'close' | 'reload') => {
    if (cmd === 'minimize') win?.minimize()
    if (cmd === 'close') win?.close()
    if (cmd === 'reload') win?.reload()
  })
}

/** Start with the system: login items on Windows/macOS, an XDG autostart entry on Linux. */
function setLaunchAtLogin(on: boolean): void {
  if (process.platform !== 'linux') {
    app.setLoginItemSettings({ openAtLogin: on, args: ['--hidden'] })
    return
  }
  const dir = path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'autostart')
  const file = path.join(dir, 'octopus-mail.desktop')
  if (!on) {
    fs.rmSync(file, { force: true })
    return
  }
  // AppImages run from a temporary mount: the stable path is in $APPIMAGE
  const exe = process.env.APPIMAGE || process.execPath
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    file,
    ['[Desktop Entry]', 'Type=Application', 'Name=Octopus Mail', `Exec="${exe}" --hidden`, 'Icon=octopus-mail', 'X-GNOME-Autostart-enabled=true', ''].join('\n'),
  )
}

// inline images (cid:) from e-mails, fetched lazily from the IMAP server
function registerCidProtocol(): void {
  protocol.handle('octo-cid', async (req) => {
    const u = new URL(req.url)
    try {
      return await backend.cid(Number(u.hostname), decodeURIComponent(u.pathname.slice(1)))
    } catch {
      return new Response('error', { status: 502 })
    }
  })
}

/** macOS needs a real menu bar (Cmd+C/V/Q/W come from its roles); Windows/Linux keep the window menu-less. */
function setupMenu(): void {
  if (process.platform !== 'darwin') return Menu.setApplicationMenu(null)
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      { role: 'appMenu' },
      { role: 'editMenu' },
      { label: t('View'), submenu: [{ role: 'reload' }, { role: 'togglefullscreen' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
      { role: 'windowMenu' },
    ]),
  )
}

function createTray(): void {
  const icon = trayIcon(false)
  const image = icon ? nativeImage.createFromPath(icon) : nativeImage.createEmpty()
  if (process.platform === 'darwin') image.setTemplateImage(true)
  tray = new Tray(image)
  if (process.platform === 'darwin') tray.setIgnoreDoubleClickEvents(true)
  tray.setToolTip('Octopus Mail')
  buildTrayMenu()
  tray.on('click', showWindow)
}

function buildTrayMenu(): void {
  tray?.setContextMenu(
    Menu.buildFromTemplate([
      { label: t('Open Octopus Mail'), click: showWindow },
      { label: t('New message'), click: () => (showWindow(), send('command', 'compose')) },
      { label: t('Sync now'), click: () => void backend.call('syncNow', []).catch(() => undefined) },
      { type: 'separator' },
      { label: t('Quit'), click: () => ((quitting = true), app.quit()) },
    ]),
  )
}

// ---------- language ----------

/** Language the tray menu and window title were last built in. */
let labelsLang: Lang | null = null

/** OS display language (e.g. "pl-PL"), which the app follows when settings.language is "auto". */
function osLocale(): string {
  return app.getPreferredSystemLanguages()[0] ?? app.getLocale()
}

/** Apply settings.language (or the OS language for "auto") to this process; relabel what main has built. */
function applyLanguage(): void {
  let setting: LangSetting = 'auto'
  try {
    setting = backend.settings().language
  } catch {
    /* database not available yet: follow the OS */
  }
  initLang(setting, osLocale())
  if (getLang() === labelsLang) return
  labelsLang = getLang()
  if (tray) {
    buildTrayMenu()
    void updateBadge() // tooltip
  }
  if (isolatedProfile && win && !win.isDestroyed()) win.setTitle(demoTitle())
}

/** Restart into the other mode after pairing with / leaving a home server. */
function relaunch(): void {
  quitting = true
  app.relaunch()
  app.quit()
}

app.whenReady().then(async () => {
  registerIpc()
  registerCidProtocol()
  backend.onEvent(forwardEvent)
  backend.onSettingsChanged(applyLanguage)
  applyLanguage()
  setupMenu()
  createTray()
  // started with Windows (--hidden): stay in the tray until the user opens the window
  createWindow(!process.argv.includes('--hidden'))
  const link = process.argv.find((a) => a.startsWith(`${PROTOCOL}://`))
  if (link) win?.webContents.once('did-finish-load', () => openDeepLink(link))
  try {
    await backend.start()
  } catch (e) {
    log('main', 'engine start failed', (e as Error).message)
  }
  // the engine sets its language from the process locale; the app follows the OS display language
  applyLanguage()
  void updateBadge()
})

app.on('before-quit', () => {
  quitting = true
})

app.on('will-quit', (e) => {
  if ((app as unknown as { _octoStopped?: boolean })._octoStopped) return
  e.preventDefault()
  ;(app as unknown as { _octoStopped?: boolean })._octoStopped = true
  void backend.stop().finally(() => app.quit())
})

// macOS: clicking the Dock icon brings the (hidden) window back
app.on('activate', showWindow)

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') return
  if (!backend.settings().minimizeToTray) app.quit()
})
