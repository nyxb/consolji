import { consolji } from './utils'

async function main() {
   await consolji.start('Creating project...')
   await new Promise(resolve => setTimeout(resolve, 1000))
   await consolji.success('Project created!')
}

main()
