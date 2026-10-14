// Translations, language detection and the English/Polish date parser. Needs no mail server.
import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

delete process.env.OCTO_LANG // a forced language would override initLang() below

import { dateLocale, detectLang, getLang, initLang, setLang, t, tp } from '../src/shared/i18n'
import { browserDeviceName, langFromAcceptLanguage, loginPage, withLang } from '../src/server/login'
import { formatWhen, parseWhen, PRESET_IDS, PRESET_LABELS, presetLabel, presetTime, SOMEDAY } from '../src/shared/when'

const base = new Date(2026, 9, 13, 10, 0) // Tue 13 Oct 2026 10:00
const at = (month: number, day: number, h: number, m = 0, year = 2026) => new Date(year, month - 1, day, h, m).getTime()
const show = (ts: number | null) => (ts === null ? 'null' : new Date(ts).toString())

afterEach(() => initLang('en', 'en-GB'))

describe('t() and tp()', () => {
  it('returns English in the English UI', () => {
    setLang('en')
    assert.equal(t('Open Octopus Mail'), 'Open Octopus Mail')
    assert.equal(t('Octopus Mail — {n} unread', { n: 3 }), 'Octopus Mail — 3 unread')
    assert.equal(t('No such key {x} {y}', { x: 1 }), 'No such key 1 {y}')
  })

  it('returns Polish in the Polish UI and falls back to English', () => {
    setLang('pl')
    assert.equal(t('Open Octopus Mail'), 'Otwórz Octopus Mail')
    assert.equal(t('Octopus Mail — {n} unread', { n: 3 }), 'Octopus Mail — nieprzeczytane: 3')
    assert.equal(t("Can't connect to {url}: {error}", { url: 'http://x', error: 'timeout' }), 'Nie mogę połączyć się z http://x: timeout')
    assert.equal(t('Not translated yet'), 'Not translated yet')
  })

  it('uses English plurals', () => {
    setLang('en')
    assert.equal(tp(1, '{n} new message', '{n} new messages'), '1 new message')
    assert.equal(tp(0, '{n} new message', '{n} new messages'), '0 new messages')
    assert.equal(tp(5, '{n} new message', '{n} new messages'), '5 new messages')
    assert.equal(tp(2, '{n} file from {src}', '{n} files from {src}', { src: 'Ann' }), '2 files from Ann')
  })

  it('uses the three Polish plural forms', () => {
    setLang('pl')
    const forms: [number, string][] = [
      [1, '1 nowa wiadomość'], [2, '2 nowe wiadomości'], [4, '4 nowe wiadomości'], [5, '5 nowych wiadomości'],
      [12, '12 nowych wiadomości'], [14, '14 nowych wiadomości'], [22, '22 nowe wiadomości'], [25, '25 nowych wiadomości'],
      [0, '0 nowych wiadomości'], [102, '102 nowe wiadomości'], [112, '112 nowych wiadomości'],
    ]
    for (const [n, want] of forms) assert.equal(tp(n, '{n} new message', '{n} new messages'), want, `n = ${n}`)
    // no Polish entry: English forms
    assert.equal(tp(2, '{n} file from {src}', '{n} files from {src}', { src: 'Ann' }), '2 files from Ann')
  })
})

describe('language detection', () => {
  it('maps system locales to the UI language', () => {
    assert.equal(detectLang('pl-PL'), 'pl')
    assert.equal(detectLang('pl'), 'pl')
    assert.equal(detectLang('en-US'), 'en')
    assert.equal(detectLang('de-DE'), 'en')
    assert.equal(detectLang(''), 'en')
    assert.equal(detectLang(undefined), 'en')
  })

  it('follows the setting, then the system locale', () => {
    assert.equal(initLang('auto', 'pl-PL'), 'pl')
    assert.equal(dateLocale(), 'pl-PL')
    assert.equal(initLang('auto', 'en-US'), 'en')
    assert.equal(dateLocale(), 'en-US')
    assert.equal(initLang('pl', 'en-US'), 'pl')
    assert.equal(initLang('en', 'pl-PL'), 'en')
    assert.equal(dateLocale(), 'en-GB')
  })

  it('reads Accept-Language', () => {
    assert.equal(langFromAcceptLanguage('pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7'), 'pl')
    assert.equal(langFromAcceptLanguage('en-US,en;q=0.9,pl;q=0.8'), 'en')
    assert.equal(langFromAcceptLanguage('en;q=0.5, pl;q=0.9'), 'pl')
    assert.equal(langFromAcceptLanguage('de-DE,de;q=0.9,pl;q=0.8,en;q=0.5'), 'pl')
    assert.equal(langFromAcceptLanguage('de-DE,de;q=0.9'), 'en')
    assert.equal(langFromAcceptLanguage('pl;q=0,en'), 'en')
    assert.equal(langFromAcceptLanguage('*'), 'en')
    assert.equal(langFromAcceptLanguage(''), 'en')
    assert.equal(langFromAcceptLanguage(undefined), 'en')
  })

  it('renders the server sign-in page per request language', () => {
    setLang('en')
    const pl = loginPage('pl', 'bad-code')
    assert.match(pl, /<html lang="pl">/)
    assert.match(pl, /Wpisz kod parowania z serwera domowego\./)
    assert.match(pl, />Połącz</)
    assert.match(pl, /Nieprawidłowy albo wygasły kod\./)
    assert.equal(getLang(), 'en', 'the server language is restored')
    const en = loginPage('en')
    assert.match(en, /<html lang="en">/)
    assert.match(en, /Enter the pairing code from your home server\./)
    assert.match(en, />Connect</)
    assert.doesNotMatch(en, /class="err"/)
    assert.equal(browserDeviceName('pl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', '10.0.0.5'), 'Telefon (10.0.0.5)')
    assert.equal(browserDeviceName('en', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '10.0.0.5'), 'Browser (10.0.0.5)')
  })

  it('restores the language when the callback throws', () => {
    setLang('pl')
    assert.throws(() => withLang('en', () => {
      throw new Error('boom')
    }))
    assert.equal(getLang(), 'pl')
  })
})

describe('French and Spanish', () => {
  it('detects and initialises each locale', () => {
    assert.equal(detectLang('fr-FR'), 'fr')
    assert.equal(detectLang('fr'), 'fr')
    assert.equal(detectLang('es-MX'), 'es')
    assert.equal(detectLang('es'), 'es')
    assert.equal(detectLang('de-DE'), 'en')
    assert.equal(initLang('auto', 'fr-CA'), 'fr')
    assert.equal(dateLocale(), 'fr-FR')
    assert.equal(initLang('auto', 'es-AR'), 'es')
    assert.equal(dateLocale(), 'es-ES')
    assert.equal(initLang('fr', 'en-US'), 'fr')
    assert.equal(initLang('es', 'pl-PL'), 'es')
    assert.equal(initLang('pl', 'fr-FR'), 'pl')
    assert.equal(dateLocale(), 'pl-PL')
  })

  it('lets OCTO_LANG override the setting', () => {
    try {
      for (const l of ['en', 'pl', 'fr', 'es'] as const) {
        process.env.OCTO_LANG = l
        assert.equal(initLang(l === 'en' ? 'pl' : 'en', 'de-DE'), l)
      }
      process.env.OCTO_LANG = 'xx'
      assert.equal(initLang('fr', 'en-US'), 'fr', 'an unknown value is ignored')
    } finally {
      delete process.env.OCTO_LANG
    }
  })

  it('translates a sample key', () => {
    setLang('fr')
    assert.equal(t('New message'), 'Nouveau message')
    assert.equal(t('Not translated yet'), 'Not translated yet')
    setLang('es')
    assert.equal(t('New message'), 'Nuevo mensaje')
  })

  it('applies French plural rules (0 and 1 are singular)', () => {
    setLang('fr')
    const k = (n: number) => tp(n, '{n} new message', '{n} new messages')
    assert.equal(k(0), '0 nouveau message')
    assert.equal(k(1), '1 nouveau message')
    assert.equal(k(2), '2 nouveaux messages')
    assert.equal(k(5), '5 nouveaux messages')
  })

  it('applies Spanish plural rules (only 1 is singular)', () => {
    setLang('es')
    const k = (n: number) => tp(n, '{n} new message', '{n} new messages')
    assert.equal(k(0), '0 mensajes nuevos')
    assert.equal(k(1), '1 mensaje nuevo')
    assert.equal(k(2), '2 mensajes nuevos')
    assert.equal(k(5), '5 mensajes nuevos')
  })

  it('reads fr and es from Accept-Language', () => {
    assert.equal(langFromAcceptLanguage('fr-FR,fr;q=0.9,en;q=0.5'), 'fr')
    assert.equal(langFromAcceptLanguage('es-ES,es;q=0.9'), 'es')
  })
})

describe('parseWhen', () => {
  const english: [string, number | null][] = [
    ['today 17:00', at(10, 13, 17)],
    ['tonight', at(10, 13, 18)],
    ['this evening', at(10, 13, 18)],
    ['tonight at 8', at(10, 13, 20)],
    ['tomorrow', at(10, 14, 8)],
    ['tomorrow 9', at(10, 14, 9)],
    ['tomorrow at 9am', at(10, 14, 9)],
    ['Tomorrow 2:30pm', at(10, 14, 14, 30)],
    ['tomorrow 14:30', at(10, 14, 14, 30)],
    ['tomorrow morning', at(10, 14, 8)],
    ['tomorrow evening', at(10, 14, 18)],
    ['tomorrow at noon', at(10, 14, 12)],
    ['day after tomorrow', at(10, 15, 8)],
    ['weekend', at(10, 17, 8)],
    ['this weekend', at(10, 17, 8)],
    ['next week', at(10, 19, 8)],
    ['this week', at(10, 15, 8)],
    ['next month', at(11, 13, 8)],
    ['monday', at(10, 19, 8)],
    ['Mon 9:30', at(10, 19, 9, 30)],
    ['friday 14:30', at(10, 16, 14, 30)],
    ['fri at 2:30pm', at(10, 16, 14, 30)],
    ['on thursday 9am', at(10, 15, 9)],
    ['wed 9 am', at(10, 14, 9)],
    ['next tue', at(10, 20, 8)],
    ['sunday', at(10, 18, 8)],
    ['at 9', at(10, 14, 9)],
    ['at 14:30', at(10, 13, 14, 30)],
    ['9am', at(10, 14, 9)],
    ['3pm', at(10, 13, 15)],
    ['noon', at(10, 13, 12)],
    ['in 2 hours', base.getTime() + 2 * 3600_000],
    ['in 30 minutes', base.getTime() + 30 * 60_000],
    ['in an hour', base.getTime() + 3600_000],
    ['in half an hour', base.getTime() + 30 * 60_000],
    ['in 3 days', base.getTime() + 3 * 86400_000],
    ['in 1 week', base.getTime() + 7 * 86400_000],
    ['in a week', base.getTime() + 7 * 86400_000],
    ['+2h', base.getTime() + 2 * 3600_000],
    ['later today', presetTime('later_today', base)],
    ['someday', SOMEDAY],
    ['2026-11-02', at(11, 2, 8)],
    ['2026-11-02 17:00', at(11, 2, 17)],
    ['2026-10-20T09:15', at(10, 20, 9, 15)],
    ['2026-10-20T09:15:00Z', Date.UTC(2026, 9, 20, 9, 15)],
    ['whenever', null],
    ['next', null],
    ['13pm', null],
  ]
  const polish: [string, number | null][] = [
    ['jutro 9', at(10, 14, 9)],
    ['pt 14:30', at(10, 16, 14, 30)],
    ['za 2 godziny', base.getTime() + 2 * 3600_000],
    ['20.10 8:15', at(10, 20, 8, 15)],
    ['2026-11-02 17:00', at(11, 2, 17)],
    ['jutro rano', at(10, 14, 8)],
    ['jutro wieczorem', at(10, 14, 18)],
    ['jutro o 9', at(10, 14, 9)],
    ['jutro po południu', at(10, 14, 14)],
    ['dziś 17:00', at(10, 13, 17)],
    ['dzisiaj wieczorem', at(10, 13, 18)],
    ['wieczorem', at(10, 13, 18)],
    ['pojutrze', at(10, 15, 8)],
    ['w weekend', at(10, 17, 8)],
    ['w piątek o 15', at(10, 16, 15)],
    ['środę 10', at(10, 14, 10)],
    ['we wtorek', at(10, 20, 8)],
    ['następny poniedziałek', at(10, 19, 8)],
    ['w przyszłym tygodniu', at(10, 19, 8)],
    ['za 3 dni', base.getTime() + 3 * 86400_000],
    ['za tydzień', base.getTime() + 7 * 86400_000],
    ['za pół godziny', base.getTime() + 30 * 60_000],
    ['o 14:30', at(10, 13, 14, 30)],
    ['kiedyś', SOMEDAY],
    ['bzdura', null],
  ]

  for (const lang of ['en', 'pl'] as const) {
    it(`understands English and Polish in the ${lang === 'en' ? 'English' : 'Polish'} UI`, () => {
      setLang(lang)
      for (const [input, want] of [...english, ...polish]) assert.equal(show(parseWhen(input, base)), show(want), input)
    })
  }

  it('respects the configured morning and evening hours', () => {
    const cfg = { morningHour: 7, eveningHour: 19 }
    assert.equal(show(parseWhen('tomorrow', base, cfg)), show(at(10, 14, 7)))
    assert.equal(show(parseWhen('jutro wieczorem', base, cfg)), show(at(10, 14, 19)))
    assert.equal(show(parseWhen('tonight', base, cfg)), show(at(10, 13, 19)))
  })
})

describe('formatWhen and preset labels', () => {
  it('formats in Polish exactly as before', () => {
    initLang('pl', 'pl-PL')
    assert.equal(formatWhen(at(10, 14, 9), base), 'jutro 09:00')
    assert.equal(formatWhen(at(10, 13, 15), base), 'dziś 15:00')
    assert.equal(formatWhen(at(10, 16, 14, 30), base), 'piątek 14:30')
    assert.equal(formatWhen(SOMEDAY, base), 'Kiedyś')
    assert.match(formatWhen(at(11, 2, 17), base), /^2 lis\S*,? 17:00$/)
    assert.match(formatWhen(at(1, 5, 9, 0, 2027), base), /^5 sty\S* 2027,? 09:00$/)
  })

  it('formats in English', () => {
    initLang('en', 'en-GB')
    assert.equal(formatWhen(at(10, 14, 9), base), 'tomorrow 9:00')
    assert.equal(formatWhen(at(10, 13, 15), base), 'today 15:00')
    assert.equal(formatWhen(at(10, 16, 14, 30), base), 'Fri 14:30')
    assert.equal(formatWhen(SOMEDAY, base), 'Someday')
    assert.match(formatWhen(at(11, 2, 17), base), /^2 Nov,? 17:00$/)
    initLang('en', 'en-US')
    assert.match(formatWhen(at(10, 14, 9), base), /^tomorrow 9:00\sAM$/)
    assert.match(formatWhen(at(10, 16, 14, 30), base), /^Fri 2:30\sPM$/)
  })

  it('labels presets in the UI language', () => {
    setLang('en')
    assert.equal(presetLabel('tomorrow'), 'Tomorrow')
    assert.equal(PRESET_LABELS.next_week, 'Next week')
    assert.equal(Object.keys(PRESET_LABELS).length, PRESET_IDS.length)
    setLang('pl')
    assert.equal(presetLabel('tomorrow'), 'Jutro')
    assert.equal(PRESET_LABELS.next_week, 'W przyszłym tygodniu')
    assert.equal(PRESET_LABELS.someday, 'Kiedyś')
    for (const id of PRESET_IDS) assert.notEqual(presetLabel(id), '', id)
  })
})
