import { sleep } from './sleep'

const maxAttempts = 3
const retryDelayMs = 1000

export async function withMpcRetry<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts) {
        console.warn(
          `MPC ${label} attempt ${attempt}/${maxAttempts} failed, retrying`,
          error
        )
        await sleep(retryDelayMs)
      }
    }
  }
  throw lastError
}
