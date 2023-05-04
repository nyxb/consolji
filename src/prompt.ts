import { confirm, multiselect, select, text } from './utils/prompt'

interface SelectOption {
   label: string
   value: string
   hint?: string
}

export interface TextOptions {
   type?: 'text'
   default?: string
   placeholder?: string
   initial?: string
}

export interface ConfirmOptions {
   type: 'confirm'
   initial?: boolean
}

export interface SelectOptions {
   type: 'select'
   initial?: string
   options: (SelectOption | string)[]
}

export interface MultiSelectOptions {
   type: 'multiselect'
   initial?: string
   options: string[] | SelectOption[]
   required?: boolean
}

export type PromptOptions =
  | TextOptions
  | ConfirmOptions
  | SelectOptions
  | MultiSelectOptions

type inferPromptReturnType<T extends PromptOptions> = T extends TextOptions
   ? string
   : T extends ConfirmOptions
      ? boolean
      : string[]

export async function prompt<
  _ = any, __ = any, T extends PromptOptions = TextOptions,
>(
   message: string,
   opts: PromptOptions = {},
): Promise<inferPromptReturnType<T>> {
   if (!opts.type || opts.type === 'text') {
      return (await text({
         message,
         defaultValue: opts.default,
         placeholder: opts.placeholder,
         initialValue: opts.initial as string,
      })) as any
   }

   if (opts.type === 'confirm') {
      return (await confirm({
         message,
         initialValue: opts.initial,
      })) as any
   }

   if (opts.type === 'select') {
      return (await select({
         message,
         options: opts.options.map(o =>
            typeof o === 'string' ? { value: o, label: o } : o,
         ),
      })) as any
   }

   if (opts.type === 'multiselect') {
      return (await multiselect({
         message,
         options: opts.options.map(o =>
            typeof o === 'string' ? { value: o, label: o } : o,
         ),
         required: opts.required,
      })) as any
   }

   throw new Error(`Unknown prompt type: ${opts.type}`)
}
