/* eslint-disable unused-imports/no-unused-vars */
import stringWidth from 'string-width'
import isUnicodeSupported from 'is-unicode-supported'
import chalk from 'chalk'
import gradient from 'gradient-string'
import { parseStack } from '../utils/error'
import type { FormatOptions, LogObject } from '../types'
import type { LogLevel, LogType } from '../constants'
import { BasicReporter } from './basic'

const PURPLE = '#9945FF'
const GREEN = '#14F195'
const RED = '#F11712'
const YELLOW = '#FFFF00'
const CYAN = '#00FFFF'
const BLUE = '#5865F2'
const GRAY = '#a0a0a0'
const BLACK = '#0e1111'
const WHITE = '#FF5733'

export const monoflowGradient = gradient(PURPLE, GREEN)

export const consoljiRed = chalk.hex(RED)
export const consoljiYellow = chalk.hex(YELLOW)
export const consoljiPurple = chalk.hex(PURPLE)
export const consoljiGreen = chalk.hex(GREEN)
export const consoljiCyan = chalk.hex(CYAN)
export const consoljiBlue = chalk.hex(BLUE)
export const consoljiGray = chalk.hex(GRAY)
export const consoljiBlack = chalk.hex(BLACK)
export const consoljiWhite = chalk.hex(WHITE)
export const prefix = monoflowGradient('>>>')

export const TYPE_COLOR_MAP: { [k in LogType]?: string } = {
   info: 'consoljiPurple',
   fail: 'consoljiRed',
   success: 'consoljiGreen',
   ready: 'consoljiBlue',
   start: 'consoljiCyan',
}

export const LEVEL_COLOR_MAP: { [k in LogLevel]?: string } = {
   0: 'consoljiRed',
   1: 'consoljiYellow',
}

const unicode = isUnicodeSupported()
const s = (c: string, fallback: string) => (unicode ? c : fallback)
const TYPE_ICONS: { [k in LogType]?: string } = {
   error: s('🚨', '×'),
   fatal: s('❌', '×'),
   ready: s('✅', '√'),
   warn: s('🔔', '‼'),
   info: s('📘', 'i'),
   success: s('✅', '√'),
   debug: s('⚙️', 'D'),
   trace: s('➡️', '→'),
   fail: s('❎', '×'),
   start: s('◐', 'o'),
   log: s('📝', ''),
}

export class FancyReporter extends BasicReporter {
   formatStack(stack: string) {
      return (
         `\n${
       parseStack(stack)
         .map(
            line =>
               `  ${
             line
               .replace(/^at +/, m => consoljiGray(m))
               .replace(/\((.+)\)/, (_, m) => `(${consoljiCyan(m)})`)}`,
        )
         .join('\n')}`
      )
   }

   formatType(logObj: LogObject, isBadge: boolean, opts: FormatOptions) {
      const typeColor
      = (TYPE_COLOR_MAP as any)[logObj.type]
      || (LEVEL_COLOR_MAP as any)[logObj.level]
      || 'gray'

      if (isBadge) {
         return getBgColor(typeColor)(
            consoljiBlack(` ${logObj.type.toUpperCase()} `),
         )
      }

      const _type = typeof (TYPE_ICONS as any)[logObj.type] === 'string'
         ? (TYPE_ICONS as any)[logObj.type]
         : ((logObj as any).icon || logObj.type)

      return _type ? getColor(typeColor)(_type) : ''
   }

   formatLogObj(logObj: LogObject, opts: FormatOptions) {
      const [message, ...additional] = this.formatArgs(logObj.args, opts).split(
         '\n',
      )

      const isBadge = (logObj as any).badge ?? logObj.level < 2

      const date = this.formatDate(logObj.date, opts)
      const coloredDate = date && consoljiGray(date)

      const type = this.formatType(logObj, isBadge, opts)

      const tag = logObj.tag ? consoljiGray(logObj.tag) : ''

      let line
      const left = this.filterAndJoin([prefix, type, highlightBackticks(message)])
      const right = this.filterAndJoin(opts.columns ? [tag, coloredDate] : [tag])
      const space
      = (opts.columns || 0) - stringWidth(left) - stringWidth(right) - 2

      line = (space > 0 && (opts.columns || 0) >= 80)
         ? (left + ' '.repeat(space) + right)
         : ((right ? `${consoljiGray(`[${right}]`)} ` : '') + left)

      line += highlightBackticks(
         additional.length > 0 ? `\n${additional.join('\n')}` : '',
      )

      if (logObj.type === 'trace') {
         const _err = new Error(`Trace: ${logObj.message}`)
         line += this.formatStack(_err.stack || '')
      }

      return isBadge ? `\n${line}\n` : line
   }
}

function highlightBackticks(str: string) {
   return str.replace(/`([^`]+)`/gm, (_, m) => consoljiCyan(m))
}

function getColor(color = 'white') {
   return (chalk as any)[color] || consoljiWhite
}

function getBgColor(color = 'bgWhite') {
   return (
      (chalk as any)[`bg${color[0].toUpperCase()}${color.slice(1)}`]
    || consoljiWhite
   )
}
