import { consolji } from './utils'

function foo() {
   console.info('console foo')
   process.stderr.write('called from stderr\n')
}

consolji.wrapAll()
foo()
consolji.restoreAll()
foo()
