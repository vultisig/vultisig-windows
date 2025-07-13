import { extractErrorMsg } from './extractErrorMsg'

export const prefixError = (error: unknown, prefix: string) => {
  return new Error(`${prefix}: ${extractErrorMsg(error)}`)
}
