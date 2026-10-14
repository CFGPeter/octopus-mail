// French dictionary, split by area like the Polish one (same parts, same keys).
import type { Dictionary } from '../i18n'
import calendar from './fr/calendar'
import cli from './fr/cli'
import components from './fr/components'
import core from './fr/core'
import platform from './fr/platform'
import settings from './fr/settings'
import views from './fr/views'

const parts = [components, settings, calendar, views, platform, core, cli]
const fr: Dictionary = {
  strings: Object.assign({}, ...parts.map((p) => p.strings)),
  plurals: Object.assign({}, ...parts.map((p) => p.plurals)),
}
export default fr
