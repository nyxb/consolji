import { consolji } from './utils'

function foo() {
   consolji.info('foo')
   consolji.warn('foo warn')
}

function _trace() {
   consolji.trace('foobar')
}
function trace() {
   _trace()
}

foo()
consolji.wrapConsole()
foo()
trace()
consolji.restoreConsole()
foo()
trace()
