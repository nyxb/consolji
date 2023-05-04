/* eslint-disable unused-imports/no-unused-vars */
import { consolji } from './utils'

async function main() {
   const name = await consolji.prompt('What is your name?', {
      placeholder: 'Not sure',
      initial: 'java',
   })

   const confirmed = await consolji.prompt('Do you want to continue?', {
      type: 'confirm',
   })

   const projectType = await consolji.prompt('Pick a project type.', {
      type: 'select',
      options: [
         'TypeScript',
         'TypeScript',
         { label: 'CoffeeScript', value: 'CoffeeScript', hint: 'oh no' },
      ],
   })

   const tools = await consolji.prompt('Select additional tools.', {
      type: 'multiselect',
      required: false,
      options: [
         { value: 'eslint', label: 'ESLint', hint: 'recommended' },
         { value: 'prettier', label: 'Prettier' },
         { value: 'gh-action', label: 'GitHub Action' },
      ],
   })

   await consolji.start('Creating project...')
   await new Promise(resolve => setTimeout(resolve, 1000))
   await consolji.success('Project created!')
}

main()
