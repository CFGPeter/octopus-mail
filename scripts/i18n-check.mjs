// npm run i18n:check — consistency of the translations:
//  • every t('…') / tp(n, '…', …) key used in src/ has an entry in each language (pl, fr, es),
//  • placeholders {like_this} match between English and each translation,
//  • entries that no code uses any more,
//  • fr and es have the same keys as pl,
//  • string literals with Polish letters left in code outside the dictionaries (to review by hand).
import { build } from 'esbuild'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'octo-i18n-'))
const load = async (rel) => {
  const out = path.join(tmp, rel.replace(/[\/]/g, '_') + '.cjs')
  await build({ entryPoints: [path.join(root, rel)], outfile: out, bundle: true, platform: 'node', format: 'cjs', logLevel: 'error' })
  return createRequire(import.meta.url)(out).default
}
const LANGS = ['pl', 'fr', 'es']
const dicts = {}
// the same English key translated differently in two fragments: the merge keeps only one of them
const conflicts = []
for (const lang of LANGS) {
  dicts[lang] = await load(`src/shared/locales/${lang}.ts`)
  const seen = new Map()
  for (const f of fs.readdirSync(path.join(root, `src/shared/locales/${lang}`))) {
    const d = await load(`src/shared/locales/${lang}/${f}`)
    for (const [k, v] of [...Object.entries(d.strings), ...Object.entries(d.plurals).map(([k, f]) => [k, f.join(' | ')])]) {
      const prev = seen.get(k)
      if (prev && prev.v !== v) conflicts.push(`[${lang}] ${JSON.stringify(k)}: ${prev.file} ${JSON.stringify(prev.v)} ≠ ${f} ${JSON.stringify(v)}`)
      else if (!prev) seen.set(k, { file: f, v })
    }
  }
}
fs.rmSync(tmp, { recursive: true, force: true })

const files = []
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (p.endsWith(path.join('shared', 'i18n.ts'))) continue // the API's own doc examples
    else if (/\.(ts|tsx)$/.test(e.name)) files.push(p)
  }
}
walk(path.join(root, 'src'))

const STR = String.raw`'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|` + '`((?:[^`\\\\$]|\\\\.)*)`'
const T_RE = new RegExp(String.raw`\bt\(\s*(?:${STR})`, 'g')
const TP_RE = new RegExp(String.raw`\btp\(\s*[^,]+,\s*(?:${STR})`, 'g')
const unescape = (s) => s.replace(/\\n/g, '\n').replace(/\\(['"`\\])/g, '$1')

const used = new Map() // key → first location
const usedPlural = new Map()
const leftovers = []
for (const f of files) {
  const rel = path.relative(root, f).replaceAll('\\', '/')
  const src = fs.readFileSync(f, 'utf8')
  const isDict = rel.startsWith('src/shared/locales/')
  if (!isDict) {
    for (const m of src.matchAll(T_RE)) {
      const key = unescape(m[1] ?? m[2] ?? m[3])
      if (!used.has(key)) used.set(key, `${rel}:${src.slice(0, m.index).split('\n').length}`)
    }
    for (const m of src.matchAll(TP_RE)) {
      const key = unescape(m[1] ?? m[2] ?? m[3])
      if (!usedPlural.has(key)) usedPlural.set(key, `${rel}:${src.slice(0, m.index).split('\n').length}`)
    }
    src.split('\n').forEach((line, i) => {
      const code = line.replace(/\/\/.*$/, '')
      if (/^\s*(\*|\/\*)/.test(line)) return
      if (/['"`][^'"`]*[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ][^'"`]*['"`]/.test(code)) leftovers.push(`${rel}:${i + 1}: ${line.trim().slice(0, 140)}`)
    })
  }
}

// {name} placeholders only; {{field}} is template syntax shown to the user, not an i18n variable
const vars = (s) => [...s.matchAll(/(?<!\{)\{(\w+)\}(?!\})/g)].map((m) => m[1]).sort().join(',')
const stripN = (v) => v.replace(/(^|,)n(,|$)/, '$1$2').replace(/^,|,$/g, '')
const missing = [], missingPlural = [], badVars = [], badPluralVars = [], unused = [], notInPl = []
for (const lang of LANGS) {
  const d = dicts[lang]
  for (const [k, at] of used) if (!(k in d.strings) && /[a-z]{2}/.test(k)) missing.push([`${lang}`, k, at])
  for (const [k, at] of usedPlural) if (!(k in d.plurals)) missingPlural.push([lang, k, at])
  for (const [k, v] of Object.entries(d.strings)) if (vars(k) !== vars(v)) badVars.push([lang, k, v])
  for (const [k, forms] of Object.entries(d.plurals)) if (forms.some((v) => stripN(vars(v)) !== stripN(vars(k)))) badPluralVars.push([lang, k, forms])
  for (const k of Object.keys(d.strings)) if (!used.has(k)) unused.push([lang, k])
  if (lang !== 'pl') {
    for (const k of Object.keys(dicts.pl.strings)) if (!(k in d.strings)) notInPl.push([lang, k, 'missing, present in pl'])
    for (const k of Object.keys(d.strings)) if (!(k in dicts.pl.strings)) notInPl.push([lang, k, 'extra, absent in pl'])
    for (const k of Object.keys(dicts.pl.plurals)) if (!(k in d.plurals)) notInPl.push([lang, k, 'plural missing, present in pl'])
    for (const k of Object.keys(d.plurals)) if (!(k in dicts.pl.plurals)) notInPl.push([lang, k, 'plural extra, absent in pl'])
  }
}

const section = (title, list, fmt) => {
  console.log(`\n${title}: ${list.length}`)
  for (const x of list.slice(0, 400)) console.log('  ' + fmt(x))
}
console.log(`keys used: ${used.size} (+${usedPlural.size} plural)`)
for (const lang of LANGS) console.log(`${lang}: ${Object.keys(dicts[lang].strings).length} entries (+${Object.keys(dicts[lang].plurals).length} plural)`)
section('Missing translation (t)', missing, ([l, k, at]) => `[${l}] ${at}  ${JSON.stringify(k)}`)
section('Missing translation (tp)', missingPlural, ([l, k, at]) => `[${l}] ${at}  ${JSON.stringify(k)}`)
section('Placeholder mismatch', badVars, ([l, k, v]) => `[${l}] ${JSON.stringify(k)} → ${JSON.stringify(v)}`)
section('Placeholder mismatch (plural)', badPluralVars, ([l, k, v]) => `[${l}] ${JSON.stringify(k)} → ${JSON.stringify(v)}`)
section('Keys differing from the Polish dictionary', notInPl, ([l, k, why]) => `[${l}] ${JSON.stringify(k)} ${why}`)
section('Conflicting translations', conflicts, (x) => x)
section('Unused entries', unused, ([l, k]) => `[${l}] ${JSON.stringify(k)}`)
section('Polish text left in code (review: data/regex is fine)', leftovers, (x) => x)
process.exitCode = missing.length + missingPlural.length + badVars.length + badPluralVars.length + conflicts.length + notInPl.length ? 1 : 0
