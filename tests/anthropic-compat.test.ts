// Anthropic-compatible provider against a fake local server (no real network, no real profile).
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

process.env.OCTO_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'octo-anthropic-compat-'))
process.env.OCTO_SECRETS = 'file'
process.env.OCTO_QUIET = '1'

import { complete, hasAnthropicCompatKey, hasClaudeKey, setAnthropicCompatKey } from '../src/core/ai/provider'
import { updateSettings } from '../src/core/settings'

type Seen = { url?: string; headers: http.IncomingHttpHeaders; body: Record<string, unknown> }

function sse(res: http.ServerResponse, texts: string[]) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream' })
  const ev = (name: string, data: unknown) => res.write(`event: ${name}\ndata: ${JSON.stringify({ type: name, ...(data as object) })}\n\n`)
  ev('message_start', { message: { id: 'm', type: 'message', role: 'assistant', model: 'glm-x', content: [], stop_reason: null, usage: { input_tokens: 1, output_tokens: 0 } } })
  ev('content_block_start', { index: 0, content_block: { type: 'text', text: '' } })
  for (const t of texts) ev('content_block_delta', { index: 0, delta: { type: 'text_delta', text: t } })
  ev('content_block_stop', { index: 0 })
  ev('message_delta', { delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 2 } })
  res.end(`event: message_stop\ndata: {"type":"message_stop"}\n\n`)
}

describe('Anthropic-compatible AI provider', () => {
  it('sends plain messages with its own key, streams, and reports errors', async () => {
    const seen: Seen[] = []
    const srv = http.createServer((req, res) => {
      let raw = ''
      req.on('data', (c) => (raw += c))
      req.on('end', () => {
        const body = JSON.parse(raw || '{}') as Record<string, unknown>
        seen.push({ url: req.url, headers: req.headers, body })
        const json = { 'Content-Type': 'application/json' }
        if (req.headers['x-api-key'] === 'rate') return void res.writeHead(429, json).end('{"type":"error","error":{"type":"rate_limit_error","message":"slow"}}')
        if (req.headers['x-api-key'] !== 'sk-test') return void res.writeHead(401, json).end('{"type":"error","error":{"type":"authentication_error","message":"no"}}')
        if (body.stream) return void sse(res, ['Hel', 'lo'])
        res.writeHead(200, json).end(JSON.stringify({ id: 'm', type: 'message', role: 'assistant', model: 'glm-x', content: [{ type: 'text', text: 'Bonjour' }], stop_reason: 'end_turn', usage: { input_tokens: 1, output_tokens: 1 } }))
      })
    })
    await new Promise<void>((r) => srv.listen(0, '127.0.0.1', r))
    const port = (srv.address() as { port: number }).port
    const turn = { system: 'sys', messages: [{ role: 'user' as const, content: 'hi' }] }
    try {
      // missing config -> clear error, no request
      updateSettings({ ai: { provider: 'anthropic-compat', anthropicCompatUrl: '', anthropicCompatModel: '' } } as never)
      await assert.rejects(complete(turn), /Settings → AI|Ustawienia → AI/)
      updateSettings({ ai: { provider: 'anthropic-compat', anthropicCompatUrl: `http://127.0.0.1:${port}/`, anthropicCompatModel: 'glm-x' } } as never)
      assert.equal(hasAnthropicCompatKey(), false)
      await assert.rejects(complete(turn), /Settings → AI|Ustawienia → AI/) // empty key
      assert.equal(seen.length, 0)

      setAnthropicCompatKey('sk-test')
      assert.equal(hasAnthropicCompatKey(), true)
      const plain = await complete(turn)
      assert.deepEqual([plain.text, plain.provider, plain.model], ['Bonjour', 'anthropic-compat', 'glm-x'])
      const req = seen[0]
      assert.equal(req.url, '/v1/messages')
      assert.equal(req.headers['x-api-key'], 'sk-test')
      assert.equal(req.headers['anthropic-beta'], undefined)
      assert.equal(req.body.system, 'sys')
      assert.deepEqual(req.body.messages, [{ role: 'user', content: 'hi' }])
      assert.equal(typeof req.body.max_tokens, 'number')
      for (const k of ['output_config', 'betas', 'fallbacks']) assert.equal(k in req.body, false, k)

      const chunks: string[] = []
      const streamed = await complete({ ...turn, onDelta: (d) => chunks.push(d) })
      assert.equal(streamed.text, 'Hello')
      assert.deepEqual(chunks, ['Hel', 'lo'])
      assert.equal(seen[1].headers['anthropic-beta'], undefined)
      assert.equal('output_config' in seen[1].body, false)

      // URL ending in /v1 (with or without slash) hits the same path
      updateSettings({ ai: { anthropicCompatUrl: `http://127.0.0.1:${port}/v1/` } } as never)
      await complete(turn)
      assert.equal(seen[2].url, '/v1/messages')

      // json: true adds a JSON-only system line
      await complete({ ...turn, json: true })
      assert.match(String(seen[3].body.system), /JSON/)

      setAnthropicCompatKey('rate')
      await assert.rejects(complete(turn), /rate limit|limit/i)
      setAnthropicCompatKey('wrong')
      await assert.rejects(complete(turn), /Invalid API key|Nieprawidłowy klucz API/)

      // own secret: the official Claude key is untouched
      if (!process.env.ANTHROPIC_API_KEY) assert.equal(hasClaudeKey(), false)
      setAnthropicCompatKey(null)
      assert.equal(hasAnthropicCompatKey(), false)
    } finally {
      srv.close()
    }
  })
})
