import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

process.env.OCTO_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'octo-infomaniak-'))
process.env.OCTO_SECRETS = 'memory'
process.env.OCTO_QUIET = '1'

describe('Infomaniak preset', () => {
  it('is picked for Infomaniak free domains and points at mail.infomaniak.com', async () => {
    const { discover, PRESETS } = await import('../src/core/providers')
    const cfg = await discover('me@ik.me')
    assert.equal(cfg?.provider, 'infomaniak')
    assert.deepEqual([cfg?.imap_host, cfg?.imap_port, cfg?.imap_secure], ['mail.infomaniak.com', 993, true])
    assert.deepEqual([cfg?.smtp_host, cfg?.smtp_port, cfg?.smtp_secure], ['mail.infomaniak.com', 465, true])
    assert.ok(PRESETS.infomaniak.hint)
  })
})
