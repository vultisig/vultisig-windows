import { FieldErrors } from 'react-hook-form'

/**
 * Reads a field's validation message off `formState.errors`. The deposit form is
 * typed `Record<string, any>`, so react-hook-form widens `message` to cover
 * nested error shapes — only a plain string is renderable. Messages come out of
 * `getDepositFormConfig` already translated.
 */
export const getFieldErrorMessage = (errors: FieldErrors, name: string) => {
  const message = errors[name]?.message

  return typeof message === 'string' ? message : undefined
}
