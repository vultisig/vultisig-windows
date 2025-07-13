import { extractErrorMsg } from '../error/extractErrorMsg'

export const ignorePromiseOutcome = async <T>(
  promise: Promise<T>
): Promise<void> => {
  promise.catch(error => {
    console.error('Ignored promise outcome:', extractErrorMsg(error))
  })
}
