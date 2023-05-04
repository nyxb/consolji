import { isCI, isDebug, isTest } from 'std-env'
import type { LogLevel } from './constants'
import { LogLevels } from './constants'
import { BasicReporter } from './reporters/basic'
import { FancyReporter } from './reporters/fancy'
import type { ConsoljiInstance } from './consolji'
import { createConsolji as _createConsolji } from './consolji'
import type { ConsoljiOptions } from './types'

export * from './index.shared'

export function createConsolji(
   options: Partial<ConsoljiOptions & { fancy: boolean }> = {},
): ConsoljiInstance {
   // Log level
   let level = _getDefaultLogLevel()
   if (process.env.CONSOLJI_LEVEL)
      level = Number.parseInt(process.env.CONSOLJI_LEVEL) ?? level

   // Create new consolji instance
   const consolji = _createConsolji({
      level: level as LogLevel,
      defaults: { level },
      stdout: process.stdout,
      stderr: process.stderr,
      prompt: (...args) => import('./prompt').then(m => m.prompt(...args)),
      reporters: options.reporters || [
         options.fancy ?? !(isCI || isTest)
            ? new FancyReporter()
            : new BasicReporter(),
      ],
      ...options,
   })

   return consolji
}

function _getDefaultLogLevel() {
   if (isDebug)
      return LogLevels.debug

   if (isTest)
      return LogLevels.warn

   return LogLevels.info
}

export const consolji = createConsolji()

export default consolji
