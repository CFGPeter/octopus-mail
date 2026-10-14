import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

process.env.OCTO_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'octo-categorize-'))
process.env.OCTO_SECRETS = 'memory'
process.env.OCTO_QUIET = '1'

describe('categorize: French and Spanish senders', () => {
  it('routes automatic and promotional mail', async () => {
    const { categorize } = await import('../src/core/smart')
    const c = (fromEmail: string, extra: object = {}) => categorize({ fromEmail, ...extra })
    assert.equal(c('ne-pas-repondre@banque.fr'), 'notification')
    assert.equal(c('facture@fournisseur.fr'), 'notification')
    assert.equal(c('no-responder@tienda.es'), 'notification')
    assert.equal(c('pedidos@tienda.es'), 'notification')
    assert.equal(c('noreply@impots.gouv.fr'), 'notification')
    assert.equal(c('promotions@marque.fr', { listUnsubscribe: '<mailto:x@y>' }), 'newsletter')
    assert.equal(c('ofertas@marca.es', { listUnsubscribe: '<mailto:x@y>' }), 'newsletter')
    assert.equal(c('nouveautes@marque.fr', { fromName: 'Marque' }), 'newsletter')
    assert.equal(c('hola@marca.es', { fromName: 'Marca' }), 'newsletter')
    assert.equal(c('jean.dupont@orange.fr', { fromName: 'Jean Dupont' }), 'people')
    assert.equal(c('maria@gmail.com', { fromName: 'María López' }), 'people')
  })
})
