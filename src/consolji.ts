import { nyxdefaults } from 'nyxdefaults'
import type { LogLevel, LogType } from './constants'
import { LogTypes } from './constants'
import { isLogObj } from './utils/index'
import type {
   ConsoljiOptions,
   ConsoljiReporter,
   InputLogObject,
   LogObject,
} from './types'
import type { PromptOptions } from './prompt'

let paused = false
const queue: any[] = []

export class Consolji {
   options: ConsoljiOptions

   _lastLog: {
      serialized?: string
      object?: LogObject
      count?: number
      time?: Date
      timeout?: ReturnType<typeof setTimeout>
   }

   _mockFn?: ConsoljiOptions['mockFn']

   constructor(options: Partial<ConsoljiOptions> = {}) {
      // Options
      const types = options.types || LogTypes
      this.options = nyxdefaults(
      <ConsoljiOptions>{
         ...options,
         defaults: { ...options.defaults },
         level: _normalizeLogLevel(options.level, types),
         reporters: [...(options.reporters || [])],
      },
      <ConsoljiOptions>{
         types: LogTypes,
         throttle: 1000,
         throttleMin: 5,
         formatOptions: {
            date: true,
            colors: false,
            compact: true,
         },
      },
      )

      // Create logger functions for current instance
      for (const type in types) {
         const defaults: InputLogObject = {
            type: type as LogType,
            ...this.options.defaults,
            ...types[type as LogType],
         };
         // @ts-expect-error - this is fine
         (this as unknown as ConsoljiInstance)[type as LogType]
        = this._wrapLogFn(defaults);
         // @ts-expect-error - this is fine
         (this as unknown as ConsoljiInstance)[type].raw = this._wrapLogFn(
            defaults,
            true,
         )
      }

      // Use _mockFn if is set
      if (this.options.mockFn)
         this.mockTypes()

      // Track of last log
      this._lastLog = {}

      // Insert the Time functions here
      this.options.time = (label: string) => {
         console.time(label)
      }
      this.options.timeLog = (label: string, ...data: any[]) => {
         console.timeLog(label, ...data)
      }
      this.options.timeEnd = (label: string) => {
         console.timeEnd(label)
      }
   }

   get level() {
      return this.options.level
   }

   set level(level) {
      this.options.level = _normalizeLogLevel(
         level,
         this.options.types,
         this.options.level,
      )
   }

   prompt<T extends PromptOptions>(message: string, opts?: T) {
      if (!this.options.prompt)
         throw new Error('prompt is not supported!')

      return this.options.prompt<any, any, T>(message, opts)
   }

   create(options: Partial<ConsoljiOptions>): ConsoljiInstance {
      const instance = new Consolji({
         ...this.options,
         ...options,
      }) as ConsoljiInstance

      if (this._mockFn)
         instance.mockTypes(this._mockFn)

      return instance
   }

   withDefaults(defaults: InputLogObject): ConsoljiInstance {
      return this.create({
         ...this.options,
         defaults: {
            ...this.options.defaults,
            ...defaults,
         },
      })
   }

   withTag(tag: string): ConsoljiInstance {
      return this.withDefaults({
         tag: this.options.defaults.tag
            ? `${this.options.defaults.tag}:${tag}`
            : tag,
      })
   }

   addReporter(reporter: ConsoljiReporter) {
      this.options.reporters.push(reporter)
      return this
   }

   removeReporter(reporter: ConsoljiReporter) {
      if (reporter) {
         const i = this.options.reporters.indexOf(reporter)
         if (i >= 0)
            return this.options.reporters.splice(i, 1)
      }
      else {
         this.options.reporters.splice(0)
      }
      return this
   }

   setReporters(reporters: ConsoljiReporter[]) {
      this.options.reporters = Array.isArray(reporters) ? reporters : [reporters]
      return this
   }

   wrapAll() {
      this.wrapConsole()
      this.wrapStd()
   }

   restoreAll() {
      this.restoreConsole()
      this.restoreStd()
   }

   wrapConsole() {
      for (const type in this.options.types) {
         // Backup original value
         if (!(console as any)[`__${type}`])
            (console as any)[`__${type}`] = (console as any)[type];

         // Override
         (console as any)[type] = (this as unknown as ConsoljiInstance)[
            type as LogType
         ].raw
      }
   }

   restoreConsole() {
      for (const type in this.options.types) {
      // Restore if backup is available
         if ((console as any)[`__${type}`]) {
            (console as any)[type] = (console as any)[`__${type}`]
            delete (console as any)[`__${type}`]
         }
      }
   }

   wrapStd() {
      this._wrapStream(this.options.stdout, 'log')
      this._wrapStream(this.options.stderr, 'log')
   }

   _wrapStream(stream: NodeJS.WriteStream | undefined, type: LogType) {
      if (!stream)
         return

      // Backup original value
      if (!(stream as any).__write)
         (stream as any).__write = stream.write;

      // Override
      (stream as any).write = (data: any) => {
         (this as unknown as ConsoljiInstance)[type].raw(String(data).trim())
      }
   }

   restoreStd() {
      this._restoreStream(this.options.stdout)
      this._restoreStream(this.options.stderr)
   }

   _restoreStream(stream?: NodeJS.WriteStream) {
      if (!stream)
         return

      if ((stream as any).__write) {
         stream.write = (stream as any).__write
         delete (stream as any).__write
      }
   }

   pauseLogs() {
      paused = true
   }

   resumeLogs() {
      paused = false

      // Process queue
      const _queue = queue.splice(0)
      for (const item of _queue)
         item[0]._logFn(item[1], item[2])
   }

   mockTypes(mockFn?: ConsoljiOptions['mockFn']) {
      const _mockFn = mockFn || this.options.mockFn

      this._mockFn = _mockFn

      if (typeof _mockFn !== 'function')
         return

      for (const type in this.options.types) {
      // @ts-expect-error - this is fine
         (this as unknown as ConsoljiInstance)[type as LogType]
        = _mockFn(type as LogType, this.options.types[type as LogType])
        || (this as unknown as ConsoljiInstance)[type as LogType];
         (this as unknown as ConsoljiInstance)[type as LogType].raw = (
            this as unknown as ConsoljiInstance
         )[type as LogType]
      }
   }

   _wrapLogFn(defaults: InputLogObject, isRaw?: boolean) {
      return (...args: any[]) => {
         if (paused) {
            queue.push([this, defaults, args, isRaw])
            return
         }
         return this._logFn(defaults, args, isRaw)
      }
   }

   _logFn(defaults: InputLogObject, args: any[], isRaw?: boolean) {
      if (((defaults.level as number) || 0) > this.level)
         return false

      // Construct a new log object
      const logObj: Partial<LogObject> = {
         date: new Date(),
         args: [],
         ...defaults,
         level: _normalizeLogLevel(defaults.level, this.options.types),
      }

      // Consume arguments
      if (!isRaw && args.length === 1 && isLogObj(args[0]))
         Object.assign(logObj, args[0])

      else
         logObj.args = [...args]

      // Aliases
      if (logObj.message) {
         logObj.args!.unshift(logObj.message)
         delete logObj.message
      }
      if (logObj.additional) {
         if (!Array.isArray(logObj.additional))
            logObj.additional = logObj.additional.split('\n')

         logObj.args!.push(`\n${logObj.additional.join('\n')}`)
         delete logObj.additional
      }

      // Normalize type and tag to lowercase
      logObj.type = (
         typeof logObj.type === 'string' ? logObj.type.toLowerCase() : 'log'
      ) as LogType
      logObj.tag = typeof logObj.tag === 'string' ? logObj.tag.toLowerCase() : ''

      // Resolve log
      /**
     * @param newLog false if the throttle expired and
     *  we don't want to log a duplicate
     */
      const resolveLog = (newLog = false) => {
         const repeated = (this._lastLog.count || 0) - this.options.throttleMin
         if (this._lastLog.object && repeated > 0) {
            const args = [...this._lastLog.object.args]
            if (repeated > 1)
               args.push(`(repeated ${repeated} times)`)

            this._log({ ...this._lastLog.object, args })
            this._lastLog.count = 1
         }

         // Log
         if (newLog) {
            this._lastLog.object = logObj as LogObject
            this._log(logObj as LogObject)
         }
      }

      // Throttle
      clearTimeout(this._lastLog.timeout)
      const diffTime = (this._lastLog.time && logObj.date)
         ? (logObj.date.getTime() - this._lastLog.time.getTime())
         : 0
      this._lastLog.time = logObj.date
      if (diffTime < this.options.throttle) {
         try {
            const serializedLog = JSON.stringify([
               logObj.type,
               logObj.tag,
               logObj.args,
            ])
            const isSameLog = this._lastLog.serialized === serializedLog
            this._lastLog.serialized = serializedLog
            if (isSameLog) {
               this._lastLog.count = (this._lastLog.count || 0) + 1
               if (this._lastLog.count > this.options.throttleMin) {
                  // Auto-resolve when throttle is timed out
                  this._lastLog.timeout = setTimeout(
                     resolveLog,
                     this.options.throttle,
                  )
                  return // SPAM!
               }
            }
         }
         catch {
            // Circular References
         }
      }

      resolveLog(true)
   }

   _log(logObj: LogObject) {
      for (const reporter of this.options.reporters) {
         reporter.log(logObj, {
            options: this.options,
         })
      }
   }
}

function _normalizeLogLevel(
   input: LogLevel | LogType | undefined,
   types: any = {},
   defaultLevel = 3,
) {
   if (input === undefined)
      return defaultLevel

   if (typeof input === 'number')
      return input

   if (types[input] && types[input].level !== undefined)
      return types[input].level

   return defaultLevel
}

export interface LogFn {
   (message: InputLogObject | any, ...args: any[]): void
   raw: (...args: any[]) => void
}
export type ConsoljiInstance = Consolji & Record<LogType, LogFn>

// Legacy support
// @ts-expect-error - this is fine
Consolji.prototype.add = Consolji.prototype.addReporter
// @ts-expect-error - this is fine
Consolji.prototype.remove = Consolji.prototype.removeReporter
// @ts-expect-error - this is fine
Consolji.prototype.clear = Consolji.prototype.removeReporter
// @ts-expect-error - this is fine
Consolji.prototype.withScope = Consolji.prototype.withTag
// @ts-expect-error - this is fine
Consolji.prototype.mock = Consolji.prototype.mockTypes
// @ts-expect-error - this is fine
Consolji.prototype.pause = Consolji.prototype.pauseLogs
// @ts-expect-error - this is fine
Consolji.prototype.resume = Consolji.prototype.resumeLogs

export function createConsolji(
   options: Partial<ConsoljiOptions> = {},
): ConsoljiInstance {
   return new Consolji(options) as ConsoljiInstance
}
