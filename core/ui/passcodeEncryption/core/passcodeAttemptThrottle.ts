import { passcodeEncryptionConfig } from './config'

/** Persisted state used to calculate the delay before another unlock attempt. */
export type PasscodeAttemptState = {
  failedAttempts: number
  lastFailedAt: number
}

type GetPasscodeAttemptDelayMsInput = {
  state: PasscodeAttemptState | undefined
  now: number
}

type RecordFailedPasscodeAttemptInput = {
  state: PasscodeAttemptState | undefined
  now: number
}

const getDelayMs = (failedAttempts: number): number => {
  const delayedAttempt = failedAttempts - passcodeEncryptionConfig.freeAttempts

  if (delayedAttempt <= 0) {
    return 0
  }

  const exponent = Math.min(delayedAttempt - 1, 16)

  return Math.min(
    passcodeEncryptionConfig.baseDelayMs * 2 ** exponent,
    passcodeEncryptionConfig.maximumDelayMs
  )
}

/** Returns the remaining retry delay, including exponential backoff and its cap. */
export const getPasscodeAttemptDelayMs = ({
  state,
  now,
}: GetPasscodeAttemptDelayMsInput): number => {
  if (!state) {
    return 0
  }

  const delay = getDelayMs(state.failedAttempts)
  const elapsed = Math.max(0, now - state.lastFailedAt)

  return Math.max(0, delay - elapsed)
}

/** Advances persisted failure state at the supplied clock time. */
export const recordFailedPasscodeAttempt = ({
  state,
  now,
}: RecordFailedPasscodeAttemptInput): PasscodeAttemptState => ({
  failedAttempts: Math.max(0, state?.failedAttempts ?? 0) + 1,
  lastFailedAt: now,
})

const passcodeOperationLockName = 'vultisig-passcode-operation'

/** Serializes passcode reads and writes across same-origin windows when supported. */
export const withPasscodeOperationLock = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  if (typeof navigator === 'undefined' || !navigator.locks) {
    return operation()
  }

  return navigator.locks.request(passcodeOperationLockName, () => operation())
}
