import { describe, expect, test } from 'vitest'
import type { ConsoljiReporter, LogObject } from '../src'
import { LogLevels, createConsolji } from '../src'

describe('consolji', () => {
   test('can set level', () => {
      const consolji = createConsolji()
      expect(consolji.level).toBe(1)

      for (let i = 0; i <= 5; i++) {
         consolji.level = i
         expect(consolji.level).toBe(i)
      }
   })

   test('silent log level does\'t print logs', async () => {
      const logs: LogObject[] = []
      const TestReporter: ConsoljiReporter = {
         log(logObj) {
            logs.push(logObj)
         },
      }

      const consolji = createConsolji({
         throttle: 100,
         level: LogLevels.silent,
         reporters: [TestReporter],
      })

      for (let i = 0; i < 10; i++)
         consolji.log('SPAM')

      await wait(200)
      expect(logs.length).toBe(0)
   })

   test('can see spams without ending log', async () => {
      const logs: LogObject[] = []
      const TestReporter: ConsoljiReporter = {
         log(logObj) {
            logs.push(logObj)
         },
      }

      const consolji = createConsolji({
         throttle: 100,
         level: LogLevels.info,
         reporters: [TestReporter],
      })
      for (let i = 0; i < 10; i++)
         consolji.log('SPAM')

      await wait(300)
      expect(logs.length).toBe(7)
      // 6 + Last one indicating it repeated 4
      expect(logs[logs.length - 1].args).toEqual(['SPAM', '(repeated 4 times)'])
   })
})

function wait(delay) {
   return new Promise((resolve) => {
      setTimeout(resolve, delay)
   })
}
