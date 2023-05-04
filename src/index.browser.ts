/* eslint-disable no-alert */
import { BrowserReporter } from './reporters/browser'
import { createConsolji as _createConsolji } from './consolji'
import type { ConsoljiOptions } from './types'

export * from './index.shared'

export function createConsolji(options: Partial<ConsoljiOptions> = {}) {
   const consolji = _createConsolji({
      reporters: options.reporters || [new BrowserReporter({})],
      prompt(message, options = {}) {
         if (options.type === 'confirm')
            return Promise.resolve(confirm(message) as any)

         return Promise.resolve(prompt(message))
      },
      ...options,
   })
   return consolji
}

export const consolji = createConsolji()

export default consolji
