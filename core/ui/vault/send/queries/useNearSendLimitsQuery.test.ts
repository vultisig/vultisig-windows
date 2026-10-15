import { isNearImplicitAccountId } from '@vultisig/core-chain/chains/near/accountId'
import { describe, expect, it } from 'vitest'

import { getNearLimitsReceiver } from './useNearSendLimitsQuery'

describe('getNearLimitsReceiver', () => {
  // A named receiver skips the implicit account-creation gas, so sizing an
  // unknown receiver as one would let MAX move more than the chain accepts.
  it.each(['', 'a', 'Alice.near', ' alice.near'])(
    'sizes %j as an implicit receiver',
    receiver => {
      expect(isNearImplicitAccountId(getNearLimitsReceiver(receiver))).toBe(
        true
      )
    }
  )

  it('keeps a valid receiver as typed', () => {
    expect(getNearLimitsReceiver('alice.near')).toBe('alice.near')
  })
})
