import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

process.env.OCTO_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'octo-proxy-'))
process.env.OCTO_SECRETS = 'memory'
process.env.OCTO_QUIET = '1'

describe('reverse proxy awareness', () => {
  const req = (xff: string | undefined, proto?: string) =>
    ({ headers: { 'x-forwarded-for': xff, 'x-forwarded-proto': proto }, socket: { remoteAddress: '::ffff:172.17.0.1' } }) as never
  it('ignores X-Forwarded-For unless OCTO_TRUST_PROXY=1', async () => {
    const { clientIp, secureFlag } = await import('../src/server/server')
    delete process.env.OCTO_TRUST_PROXY
    assert.equal(clientIp(req('203.0.113.9, 10.0.0.1')), '172.17.0.1')
    assert.equal(secureFlag(req('203.0.113.9', 'https')), '')
    process.env.OCTO_TRUST_PROXY = '1'
    assert.equal(clientIp(req('203.0.113.9, 10.0.0.1')), '203.0.113.9')
    assert.equal(clientIp(req(undefined)), '172.17.0.1')
    assert.equal(secureFlag(req('203.0.113.9', 'https')), '; Secure')
    delete process.env.OCTO_TRUST_PROXY
  })
})
