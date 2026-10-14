// Pairing codes created through the API by an already paired device (no mail server needed).
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

process.env.OCTO_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'octo-pairing-test-'))
process.env.OCTO_SECRETS = 'memory'
process.env.OCTO_QUIET = '1'

import type http from 'node:http'
import type { AddressInfo } from 'node:net'
import { createPairingCode, redeemPairingCode } from '../src/server/auth'
import { runServer } from '../src/server/server'
import { sync } from '../src/core/sync'

let server: http.Server
let base = ''
let token = ''
const realNow = Date.now

const post = (p: string, body: unknown, auth?: string) =>
  fetch(`${base}${p}`, { method: 'POST', headers: auth ? { Authorization: `Bearer ${auth}` } : {}, body: JSON.stringify(body) })
const newCode = async (name?: string) => (await (await post('/api/devices/pair', { name }, token)).json()) as { code: string; expires: number }
const redeem = (code: string) => post('/api/pair', { code, name: 'Test' })

describe('pairing codes', () => {
  before(async () => {
    server = await runServer({ port: 0, host: '127.0.0.1' })
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    token = redeemPairingCode(createPairingCode().code, 'first', null)!.token
  })
  after(async () => {
    Date.now = realNow
    server.close()
    await sync.stopAll()
  })

  it('needs a device token to create a code', async () => {
    assert.equal((await post('/api/devices/pair', {})).status, 401)
  })

  it('code works once, with the chosen device name', async () => {
    const { code } = await newCode('Anna phone')
    const ok = await redeem(code)
    assert.equal(ok.status, 200)
    assert.equal(((await ok.json()) as { device: { name: string } }).device.name, 'Anna phone')
    assert.equal((await redeem(code)).status, 403)
  })

  it('expired code fails', async () => {
    const { code, expires } = await newCode()
    Date.now = () => expires + 1000
    try {
      assert.equal((await redeem(code)).status, 403)
    } finally {
      Date.now = realNow
    }
  })

  it('keeps at most 5 live codes, dropping the oldest', async () => {
    const codes: string[] = []
    for (let i = 0; i < 6; i++) codes.push((await newCode()).code)
    assert.equal((await redeem(codes[0])).status, 403)
    assert.equal((await redeem(codes[1])).status, 200)
    assert.equal((await redeem(codes[5])).status, 200)
  })
})
