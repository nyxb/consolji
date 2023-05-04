import { consolji } from '../src'

async function main() {
   consolji.warn('A new version of consola is available: 0.0.1')
   consolji.error(new Error('This is an example error. Everything is fine!'))
   consolji.info('Using consola 0.0.1')
   consolji.start('Building project...')
   consolji.success('Project built!')
   await consolji.prompt('Deploy to the production?', {
      type: 'confirm',
   })
}

main()
