import stringWidth from 'string-width'
import isUnicodeSupported from 'is-unicode-supported'
import * as colors from '@nyxb/colors'
import gradient from 'gradient-string'
import { parseStack } from '../utils/error'
import type { FormatOptions, LogObject } from '../types'
import type { LogLevel, LogType } from '../constants'
import { BasicReporter } from './basic'

export const PURPLE = '#9945FF'
export const GREEN = '#14F195'
export const consoljiGradient = gradient(PURPLE, GREEN)
export const prefix = consoljiGradient('>>>')

export const TYPE_COLOR_MAP: { [k in LogType]?: string } = {
   info: 'cyan',
   fail: 'red',
   success: 'green',
   ready: 'green',
   start: 'magenta',
}

export const LEVEL_COLOR_MAP: { [k in LogLevel]?: string } = {
   0: 'red',
   1: 'yellow',
}

const unicode = isUnicodeSupported()
const s = (c: string, fallback: string) => (unicode ? c : fallback)
const TYPE_ICONS: { [k in LogType]?: string } = {
   error: s('❎', '×'),
   fatal: s('🚨', '×'),
   ready: s('✅', '√'),
   warn: s('🚨', '‼'),
   info: s('ℹ️', 'i'),
   success: s('✅', '√'),
   debug: s('⚙️', 'D'),
   trace: s('➡️', '→'),
   fail: s('❎', '×'),
   start: s('◐', 'o'),
   log: s('', ''),
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
               .replace(/^at +/, m => colors.gray(m))
               .replace(/\((.+)\)/, (_, m) => `(${colors.cyan(m)})`)}`,
        )
         .join('\n')}`
      )
   }

   formatType(logObj: LogObject, isBadge: boolean, _opts: FormatOptions) {
      const typeColor
      = (TYPE_COLOR_MAP as any)[logObj.type]
      || (LEVEL_COLOR_MAP as any)[logObj.level]
      || 'gray'

      if (isBadge) {
         return getBgColor(typeColor)(
            colors.black(` ${logObj.type.toUpperCase()} `),
         )
      }

      const _type
      = typeof (TYPE_ICONS as any)[logObj.type] === 'string'
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
      const coloredDate = date && colors.gray(date)

      const type = this.formatType(logObj, isBadge, opts)

      const tag = logObj.tag ? colors.gray(logObj.tag) : ''

      let line
      const left = this.filterAndJoin([prefix, type, highlightBackticks(message)])
      const right = this.filterAndJoin(opts.columns ? [tag, coloredDate] : [tag])
      const space
      = (opts.columns || 0) - stringWidth(left) - stringWidth(right) - 2

      line
      = (space > 0 && (opts.columns || 0) >= 80)
            ? (left + ' '.repeat(space) + right)
            : ((right ? `${colors.gray(`[${right}]`)} ` : '') + left)

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
   return str.replace(/`([^`]+)`/gm, (_, m) => colors.nyxbcyan(m))
}

function getColor(color = 'white') {
   return (colors as any)[color] || colors.white
}

function getBgColor(color = 'bgWhite') {
   return (
      (colors as any)[`bg${color[0].toUpperCase()}${color.slice(1)}`]
    || colors.bgWhite
   )
}
