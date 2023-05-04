import { consolji } from './utils'

consolji.error({
   message: 'Foobar',
})

consolji.log({
   AAA: 'BBB',
})

// consolji.log(consolji)

consolji.log('%d', 12)

consolji.error({ type: 'CSSError', message: 'Use scss' })

consolji.error(undefined, null, false, true, Number.NaN)

consolji.log('We can `monospace` keyword using grave accent charachter!')

// Nonstandard error
const { message, stack } = new Error('Custom Error!')
consolji.error({ message, stack })

// Circular object
const a = { foo: 1, bar: undefined as any }
a.bar = a
consolji.log(a)

// Multiline
consolji.log('`Hello` the `JS`\n`World` and `Beyond`!')
