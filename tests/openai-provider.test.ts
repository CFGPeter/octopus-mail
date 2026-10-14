import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

process.env.OCTO_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'octo-openai-'))
process.env.OCTO_SECRETS = 'memory'
process.env.OCTO_QUIET = '1'

describe('OpenAI-compatible AI provider', () => {
  it('calls /chat/completions with the key, streams and reports errors', async () => {
    const http = await import('node:http')
    const seen: { auth?: string; body?: Record<string, unknown> }[] = []
    const srv = http.createServer((req, res) => {
      let raw = ''
      req.on('data', (c) => (raw += c))
      req.on('end', () => {
        const body = JSON.parse(raw) as Record<string, unknown>
        seen.push({ auth: req.headers.authorization, body })
        if (req.headers.authorization !== 'Bearer sk-test') return void res.writeHead(401).end('no')
        if (body.stream) {
          res.writeHead(200, { 'Content-Type': 'text/event-stream' })
          res.write('data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n')
          res.write('data: {"choices":[{"delta":{"content":"lo"}}]}\n\n')
          return void res.end('data: [DONE]\n\n')
        }
        res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ choices: [{ message: { content: 'Bonjour' } }] }))
      })
    })
    await new Promise<void>((r) => srv.listen(0, '127.0.0.1', r))
    const port = (srv.address() as { port: number }).port
    try {
      const { complete, setOpenaiKey } = await import('../src/core/ai/provider')
      const { updateSettings } = await import('../src/core/settings')
      updateSettings({ ai: { provider: 'openai', openaiUrl: `http://127.0.0.1:${port}/v1/`, openaiModel: 'm1' } } as never)
      setOpenaiKey('sk-test')
      const plain = await complete({ system: 's', messages: [{ role: 'user', content: 'hi' }] })
      assert.deepEqual([plain.text, plain.provider, plain.model], ['Bonjour', 'openai', 'm1'])
      const chunks: string[] = []
      const streamed = await complete({ system: 's', messages: [{ role: 'user', content: 'hi' }], onDelta: (d) => chunks.push(d) })
      assert.equal(streamed.text, 'Hello')
      assert.deepEqual(chunks, ['Hel', 'lo'])
      setOpenaiKey('wrong')
      await assert.rejects(complete({ system: 's', messages: [{ role: 'user', content: 'hi' }] }), /Invalid API key|Nieprawidłowy klucz API/)
    } finally {
      srv.close()
    }
  })
})

