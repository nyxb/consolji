import { createConsolji } from '../src'

function main() {
   const consolji = createConsolji({
      formatOptions: { columns: 0 },
   })
   consolji.info('Foobar')
   const scoped = consolji.withTag('test')
   scoped.success('Foobar')
}

main()
