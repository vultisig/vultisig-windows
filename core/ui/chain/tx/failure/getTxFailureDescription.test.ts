import { describe, expect, it } from 'vitest'

import { getTxFailureDescription } from './getTxFailureDescription'

const t = ((key: string, options?: { exitCode?: number }) =>
  options?.exitCode === undefined ? key : `${key}:${options.exitCode}`) as never

describe('getTxFailureDescription', () => {
  it('translates a TON reason and passes the exit code through', () => {
    expect(
      getTxFailureDescription({
        failure: { reason: 'expired', message: 'sdk text', exitCode: 136 },
        t,
      })
    ).toBe('ton_tx_failure_expired:136')
  })

  it('falls back to the SDK message for a reason without a translation', () => {
    expect(
      getTxFailureDescription({
        failure: { reason: 'something-new', message: 'Plain SDK explanation.' },
        t,
      })
    ).toBe('Plain SDK explanation.')
  })
})
