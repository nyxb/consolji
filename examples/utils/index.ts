import type { ConsoljiOptions } from '../../src'
import { createConsolji } from '../../src'
import { randomSentence } from './sentence'

export function reporterDemo(
   opts: Partial<ConsoljiOptions & { fancy: boolean }>,
) {
   const consolji = createConsolji({
      ...opts,
   })

   for (const type of Object.keys(consolji.options.types).sort())
      consolji[type](randomSentence())

   consolji.info('JSON', {
      name: 'Cat',
      color: '#454545',
   })

   consolji.error(new Error(randomSentence()))

   const tagged = consolji.withTag('unjs').withTag('router')

   for (const type of Object.keys(consolji.options.types).sort())
      tagged[type](randomSentence())
}

export const consolji = createConsolji()
