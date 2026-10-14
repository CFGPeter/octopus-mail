// Spanish dictionary, split by area so translations can be edited side by side.
import type { Dictionary } from '../i18n'
import calendar from './es/calendar'
import cli from './es/cli'
import components from './es/components'
import core from './es/core'
import platform from './es/platform'
import settings from './es/settings'
import views from './es/views'

const parts = [components, settings, calendar, views, platform, core, cli]
const es: Dictionary = {
  strings: Object.assign({}, ...parts.map((p) => p.strings)),
  plurals: Object.assign({}, ...parts.map((p) => p.plurals)),
}
export default es
