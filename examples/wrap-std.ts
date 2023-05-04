import { consolji } from './utils'

function foo() {
   console.info('console foo')
   process.stdout.write('called from stdout foo\n')
   process.stderr.write('called from stderr foo\n')
}

consolji.wrapStd()
foo()
consolji.restoreStd()
foo()
