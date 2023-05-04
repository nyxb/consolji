import { consolji } from './utils'

const c1 = consolji.withTag('foo')
const c2 = consolji.withTag('bar')

consolji.log('before pause')

c2.pause()

c1.log('C1 is ready')
c2.log('C2 is ready')

setTimeout(() => {
   consolji.resume()
   consolji.log('Yo!')
}, 1000)
