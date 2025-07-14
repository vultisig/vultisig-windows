import { attempt } from '../attempt'
import { extractErrorMsg } from '../error/extractErrorMsg'

export const ignorePromiseOutcome = async <T>(
  promise: Promise<T>
): Promise<void> => {
  const { error } = await attempt(promise)
  if (error) {
    console.error('Ignored promise outcome:', extractErrorMsg(error))
  }
}
