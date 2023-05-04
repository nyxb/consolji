/* eslint-disable @typescript-eslint/no-invalid-this */
import { consolji } from './utils'

function mockFn(type) {
   if (type === 'info') {
      return function () {
         this.log('(mocked fn with info tag)')
      }
   }
}

consolji.info('before')

consolji.mockTypes(mockFn)

const tagged = consolji.withTag('newTag')

consolji.log('log is not mocked!')

consolji.info('Dont see me')
tagged.info('Dont see me too')
