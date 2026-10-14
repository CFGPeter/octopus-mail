import { contextBridge, ipcRenderer, webUtils } from 'electron'

let streamSeq = 0
const deltaHandlers = new Map<string, (t: string) => void>()
ipcRenderer.on('ai-delta', (_e, p: { streamId: string; text: string }) => deltaHandlers.get(p.streamId)?.(p.text))

const api = {
  call: (method: string, ...args: unknown[]) => ipcRenderer.invoke('svc', method, args),
  async stream(method: string, args: unknown[], onDelta: (t: string) => void) {
    const id = `s${++streamSeq}`
    deltaHandlers.set(id, onDelta)
    try {
      return await ipcRenderer.invoke('svc-stream', method, args, id)
    } finally {
      deltaHandlers.delete(id)
    }
  },
  on(channel: 'core-event' | 'deep-link' | 'command' | 'badge-request', fn: (payload: any) => void) {
    const h = (_e: unknown, p: unknown) => fn(p)
    ipcRenderer.on(channel, h)
    return () => {
      ipcRenderer.off(channel, h)
    }
  },
  oauthAddAccount: (provider: 'google' | 'microsoft', email?: string, name?: string) => ipcRenderer.invoke('oauth-add-account', provider, email, name),
  pickFiles: () => ipcRenderer.invoke('pick-files'),
  openAttachment: (id: number) => ipcRenderer.invoke('open-attachment', id),
  saveAttachment: (id: number) => ipcRenderer.invoke('save-attachment', id),
  saveAllAttachments: (ids: number[]) => ipcRenderer.invoke('save-all-attachments', ids),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  showItem: (p: string) => ipcRenderer.invoke('show-item', p),
  dataDir: () => ipcRenderer.invoke('data-dir'),
  cliPath: () => ipcRenderer.invoke('cli-path'),
  setBadge: (dataUrl: string | null, count: number) => ipcRenderer.invoke('set-badge', dataUrl, count),
  setLoginItem: (on: boolean) => ipcRenderer.invoke('set-login-item', on),
  windowCmd: (cmd: 'minimize' | 'close' | 'reload') => ipcRenderer.invoke('window', cmd),
  // home server
  serverStatus: () => ipcRenderer.invoke('server-status'),
  serverProbe: (url: string) => ipcRenderer.invoke('server-probe', url),
  serverConnect: (url: string, code: string, deviceName: string) => ipcRenderer.invoke('server-connect', url, code, deviceName),
  serverDisconnect: () => ipcRenderer.invoke('server-disconnect'),
  serverNewCode: (name?: string) => ipcRenderer.invoke('server-new-code', name),
  serverRevoke: (id: string) => ipcRenderer.invoke('server-revoke', id),
  /** absolute path of a dropped File (drag & drop attachments) */
  filePath: (f: File) => webUtils.getPathForFile(f),
}

contextBridge.exposeInMainWorld('octo', api)
export type OctoBridge = typeof api

// lets the stylesheet adapt to the host window chrome (e.g. macOS traffic lights); the preload has no DOM typings
const dom = globalThis as unknown as { addEventListener(t: string, f: () => void): void; document: { documentElement: { dataset: Record<string, string> } } }
dom.addEventListener('DOMContentLoaded', () => {
  dom.document.documentElement.dataset.platform = process.platform
})
