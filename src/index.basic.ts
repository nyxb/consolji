import type { LogLevel } from './constants'
import { LogLevels } from './constants'
import type { ConsoljiOptions } from './types'
import { BasicReporter } from './reporters/basic'
import type { ConsoljiInstance } from './consolji'
import { createConsolji as _createConsolji } from './consolji'

export * from './index.shared'

export function createConsolji(
   options: Partial<ConsoljiOptions & { fancy: boolean }> = {},
): ConsoljiInstance {
   // Log level
   let level: LogLevel = LogLevels.info
   if (process.env.CONSOLJI_LEVEL)
      level = Number.parseInt(process.env.CONSOLJI_LEVEL) ?? level

   // Create new consolji instance
   const consolji = _createConsolji({
      level,
      defaults: { level },
      stdout: process.stdout,
      stderr: process.stderr,
      reporters: options.reporters || [new BasicReporter()],
      ...options,
   })

   return consolji
}

export const consolji = createConsolji()

export default consolji
