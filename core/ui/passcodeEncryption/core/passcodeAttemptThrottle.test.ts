import { afterEach, describe, expect, it, vi } from 'vitest'

import type { PasscodeAttemptState } from './passcodeAttemptThrottle'
import {
  getPasscodeAttemptDelayMs,
  recordFailedPasscodeAttempt,
  withPasscodeOperationLock,
} from './passcodeAttemptThrottle'

describe('passcodeAttemptThrottle', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('allows three slips before applying an escalating delay', () => {
    let state: PasscodeAttemptState | undefined
    const now = 1_000

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      state = recordFailedPasscodeAttempt({ state, now })
      expect(getPasscodeAttemptDelayMs({ state, now })).toBe(0)
    }

    state = recordFailedPasscodeAttempt({ state, now })
    expect(getPasscodeAttemptDelayMs({ state, now })).toBe(5_000)

    state = recordFailedPasscodeAttempt({ state, now })
    expect(getPasscodeAttemptDelayMs({ state, now })).toBe(10_000)

    state = recordFailedPasscodeAttempt({ state, now })
    expect(getPasscodeAttemptDelayMs({ state, now })).toBe(20_000)
  })

  it('counts down, resists a backwards clock jump, and caps at 15 minutes', () => {
    const fourthFailure = { failedAttempts: 4, lastFailedAt: 10_000 }

    expect(
      getPasscodeAttemptDelayMs({ state: fourthFailure, now: 12_000 })
    ).toBe(3_000)
    expect(
      getPasscodeAttemptDelayMs({ state: fourthFailure, now: 9_000 })
    ).toBe(5_000)

    const manyFailures = { failedAttempts: 100, lastFailedAt: 10_000 }
    expect(
      getPasscodeAttemptDelayMs({ state: manyFailures, now: 10_000 })
    ).toBe(900_000)
  })

  it('serializes attempt mutations through the shared browser lock', async () => {
    const request = vi.fn(
      async (_name: string, operation: () => Promise<string>) => operation()
    )
    vi.stubGlobal('navigator', { locks: { request } })

    await expect(
      withPasscodeOperationLock(async () => 'complete')
    ).resolves.toBe('complete')
    expect(request).toHaveBeenCalledWith(
      'vultisig-passcode-operation',
      expect.any(Function)
    )
  })

  it('keeps attempt handling available when Web Locks are unavailable', async () => {
    vi.stubGlobal('navigator', {})

    await expect(
      withPasscodeOperationLock(async () => 'complete')
    ).resolves.toBe('complete')
  })
})
