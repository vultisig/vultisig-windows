import { extractErrorMsg } from './extractErrorMsg'

export const prefixErrorWith = (prefix: string) => (error: unknown) => {
  return new Error(`${prefix}: ${extractErrorMsg(error)}`)
}
