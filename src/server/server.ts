// Octopus Mail home server (`octo serve`): runs the whole engine 24/7 (sync, Send Later, snooze,
// reminders, rules) and exposes the service API to paired desktop apps and browsers.
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import type { CoreEvent } from '../shared/types'
import { LOCAL_ONLY_METHODS, STREAMING_METHODS } from '../shared/streaming'
import { decodeWire, encodeWire, SERVER_DEFAULT_PORT, type ServerInfo } from '../shared/wire'
import { initCore, startEngine, stopEngine } from '../core/boot'
import { get } from '../core/db'
import { bus, log } from '../core/events'
import { createService } from '../core/service'
import { t } from '../shared/i18n'
import { authenticate, createPairingCode, listDevices, noteFailure, redeemPairingCode, revokeDevice, tooManyFailures } from './auth'
import { browserDeviceName, langFromAcceptLanguage, loginPage, withLang } from './login'
import { APP_VERSION } from '../shared/version'

export const SERVER_VERSION = APP_VERSION

export interface ServeOptions {
  port?: number
  host?: string
  webRoot?: string | null
}

type Fn = (...a: unknown[]) => unknown
const MAX_BODY = 48 * 1024 * 1024
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.json': 'application/json',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
}

/**
 * Address of the caller. Behind a reverse proxy (DSM, nginx, Caddy) every request arrives from the proxy, so with
 * OCTO_TRUST_PROXY=1 the left-most X-Forwarded-For entry is used; otherwise only the socket address is trusted.
 */
export function clientIp(req: http.IncomingMessage): string {
  if (process.env.OCTO_TRUST_PROXY === '1') {
    const xff = req.headers['x-forwarded-for']
    const first = (Array.isArray(xff) ? xff[0] : xff)?.split(',')[0]?.trim()
    if (first) return first.replace(/^::ffff:/, '')
  }
  return (req.socket.remoteAddress || '').replace(/^::ffff:/, '')
}

/** "; Secure" when the browser reached us over HTTPS through a trusted proxy. */
export function secureFlag(req: http.IncomingMessage): string {
  return process.env.OCTO_TRUST_PROXY === '1' && req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''
}

function cookie(req: http.IncomingMessage, name: string): string | null {
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return m ? decodeURIComponent(m[1]) : null
}

function send(res: http.ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}): void {
  const text = typeof body === 'string' ? body : encodeWire(body)
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  })
  res.end(text)
}

function readBody(req: http.IncomingMessage, limit = MAX_BODY): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (c: Buffer) => {
      size += c.length
      if (size > limit) {
        reject(new Error(t('Request too large')))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/** Files the login page (and "Add to Home Screen") may load before the browser is paired. */
const PUBLIC_FILES = new Set(['/logo.svg', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'])

export function lanAddresses(port: number): string[] {
  const out: string[] = []
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list || []) if (a.family === 'IPv4' && !a.internal) out.push(`http://${a.address}:${port}`)
  }
  return out
}

export async function runServer(opts: ServeOptions = {}): Promise<http.Server> {
  const port = opts.port ?? SERVER_DEFAULT_PORT
  const host = opts.host ?? '0.0.0.0'
  initCore()
  await startEngine('server')
  const svc = createService('ui') as unknown as Record<string, Fn>
  const webRoot = opts.webRoot && fs.existsSync(path.join(opts.webRoot, 'index.html')) ? path.resolve(opts.webRoot) : null

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://local')
    const ip = clientIp(req)
    // pages for browsers follow the browser's language; API errors follow the server's settings
    const lang = langFromAcceptLanguage(req.headers['accept-language'])
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'no-referrer')
    try {
      // ---------- public endpoints ----------
      if (url.pathname === '/api/info') {
        const info: Omit<ServerInfo, 'accounts' | 'engine'> & { pairing: true } = { name: 'octopus-mail-server', version: SERVER_VERSION, hostname: os.hostname(), pairing: true }
        return send(res, 200, info)
      }
      if (url.pathname === '/api/pair' && req.method === 'POST') {
        if (tooManyFailures(ip)) return send(res, 429, { error: t('Too many failed attempts — wait 10 minutes') })
        const body = decodeWire<{ code?: string; name?: string }>((await readBody(req, 4096)).toString('utf8'))
        const r = redeemPairingCode(String(body.code || ''), String(body.name || t('Computer')), ip)
        if (!r) {
          noteFailure(ip)
          return send(res, 403, { error: t('Invalid or expired pairing code') })
        }
        log('server', `paired device "${r.device.name}" from ${ip}`)
        return send(res, 200, r)
      }
      if (url.pathname === '/api/login' && req.method === 'POST') {
        if (tooManyFailures(ip)) return send(res, 429, loginPage(lang, 'too-many'), { 'Content-Type': 'text/html; charset=utf-8' })
        const form = new URLSearchParams((await readBody(req, 4096)).toString('utf8'))
        const ua = String(req.headers['user-agent'] || '')
        const r = redeemPairingCode(form.get('code') || '', browserDeviceName(lang, ua, ip), ip)
        if (!r) {
          noteFailure(ip)
          res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' })
          return res.end(loginPage(lang, 'bad-code'))
        }
        res.writeHead(303, {
          Location: '/',
          'Set-Cookie': `octo_token=${encodeURIComponent(r.token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000${secureFlag(req)}`,
        })
        return res.end()
      }

      // ---------- authentication ----------
      const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || null
      const viaCookie = !bearer
      const device = authenticate(bearer || cookie(req, 'octo_token'), ip)

      if (!url.pathname.startsWith('/api/')) {
        // web UI (desktop browsers and phones)
        if (!webRoot) return send(res, 404, withLang(lang, () => t('The web interface is not available in this installation.')))
        if (!device && !PUBLIC_FILES.has(url.pathname) && !url.pathname.startsWith('/assets/')) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
          return res.end(loginPage(lang))
        }
        const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1))
        let file = path.resolve(webRoot, rel)
        if (!file.startsWith(webRoot + path.sep) && file !== webRoot) return send(res, 403, 'forbidden')
        if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(webRoot, 'index.html')
        res.writeHead(200, {
          'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
          'Cache-Control': file.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache',
        })
        return fs.createReadStream(file).pipe(res)
      }

      if (!device) return send(res, 401, { error: t('Not authorized — pair this device with the server') })
      // cookie-authenticated writes must come from our own page (custom header = no cross-site forms)
      if (viaCookie && req.method !== 'GET' && req.headers['x-octo'] !== '1') return send(res, 403, { error: t('Missing X-Octo header') })

      if (url.pathname === '/api/me') return send(res, 200, { device })
      if (url.pathname === '/api/logout' && req.method === 'POST') {
        revokeDevice(device.id)
        return send(res, 200, { ok: true }, { 'Set-Cookie': `octo_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureFlag(req)}` })
      }
      if (url.pathname === '/api/devices' && req.method === 'GET') return send(res, 200, { devices: listDevices() })
      if (url.pathname === '/api/devices/pair' && req.method === 'POST') {
        const body = decodeWire<{ name?: string }>((await readBody(req, 4096)).toString('utf8') || '{}')
        return send(res, 200, createPairingCode(body.name))
      }
      const del = url.pathname.match(/^\/api\/devices\/([a-f0-9]+)$/)
      if (del && req.method === 'DELETE') return send(res, 200, { ok: revokeDevice(del[1]) })

      if (url.pathname === '/api/call' && req.method === 'POST') {
        const { method, args } = decodeWire<{ method: string; args: unknown[] }>((await readBody(req)).toString('utf8'))
        const fn = svc[method]
        if (typeof fn !== 'function' || LOCAL_ONLY_METHODS.has(method) || method === 'actor') return send(res, 400, { error: t('Unknown method {method}', { method }) })
        try {
          return send(res, 200, { result: await fn(...(args || [])) })
        } catch (e) {
          return send(res, 200, { error: (e as Error).message || String(e) })
        }
      }

      if (url.pathname === '/api/stream' && req.method === 'POST') {
        const { method, args } = decodeWire<{ method: string; args: unknown[] }>((await readBody(req)).toString('utf8'))
        const at = STREAMING_METHODS[method]
        if (at === undefined) return send(res, 400, { error: t('Method {method} does not support streaming', { method }) })
        res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' })
        const a = [...(args || [])].slice(0, at)
        while (a.length < at) a.push(undefined)
        a[at] = (text: string) => res.write(encodeWire({ delta: text }) + '\n')
        try {
          const result = await svc[method](...a)
          res.end(encodeWire({ result }) + '\n')
        } catch (e) {
          res.end(encodeWire({ error: (e as Error).message }) + '\n')
        }
        return
      }

      if (url.pathname === '/api/events') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' })
        res.write(': octopus\n\n')
        const off = bus.onEvent((ev: CoreEvent) => res.write(`data: ${encodeWire(ev)}\n\n`))
        const ping = setInterval(() => res.write(': ping\n\n'), 25_000)
        req.on('close', () => {
          off()
          clearInterval(ping)
        })
        return
      }

      const att = url.pathname.match(/^\/api\/attachment\/(\d+)$/)
      if (att) {
        const file = (await svc.downloadAttachment(Number(att[1]))) as string
        const row = get<{ filename: string; mime: string }>('SELECT filename, mime FROM attachments WHERE id = ?', Number(att[1]))
        const name = encodeURIComponent(row?.filename || path.basename(file))
        res.writeHead(200, {
          'Content-Type': row?.mime || 'application/octet-stream',
          'Content-Length': String(fs.statSync(file).size),
          'Content-Disposition': `${url.searchParams.get('download') ? 'attachment' : 'inline'}; filename*=UTF-8''${name}`,
          'Cache-Control': 'private, max-age=3600',
        })
        return fs.createReadStream(file).pipe(res)
      }

      const cid = url.pathname.match(/^\/api\/cid\/(\d+)\/(.+)$/)
      if (cid) {
        const ref = decodeURIComponent(cid[2])
        const a = get<{ id: number; mime: string }>('SELECT id, mime FROM attachments WHERE message_id = ? AND (content_id = ? OR filename = ?)', Number(cid[1]), ref, ref)
        if (!a) return send(res, 404, 'not found')
        const file = (await svc.downloadAttachment(a.id)) as string
        res.writeHead(200, { 'Content-Type': a.mime || 'application/octet-stream', 'Cache-Control': 'private, max-age=86400' })
        return fs.createReadStream(file).pipe(res)
      }

      if (url.pathname === '/api/upload' && req.method === 'POST') {
        const name = url.searchParams.get('name') || t('file')
        const data = await readBody(req)
        return send(res, 200, { result: svc.stageAttachment(name, new Uint8Array(data)) })
      }

      return send(res, 404, { error: t('Not found') })
    } catch (e) {
      log('server', 'request failed', req.method, url.pathname, (e as Error).message)
      if (!res.headersSent) send(res, 500, { error: (e as Error).message })
      else res.end()
    }
  })

  server.requestTimeout = 0 // SSE and AI streams stay open
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, host, () => resolve())
  })
  const shutdown = async () => {
    server.close()
    await stopEngine()
    process.exit(0)
  }
  process.once('SIGINT', () => void shutdown())
  process.once('SIGTERM', () => void shutdown())
  return server
}
