import { attempt } from '../attempt'

export const validateUrl = (url: string) => {
  const { error } = attempt(() => new URL(url))

  return error ? 'Invalid URL' : undefined
}
