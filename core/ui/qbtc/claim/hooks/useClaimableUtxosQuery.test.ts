import { describe, expect, it } from 'vitest'

import { getClaimableUtxosQueryKey } from './useClaimableUtxosQuery'

describe('getClaimableUtxosQueryKey', () => {
  it('includes the btc address so each vault has its own cache entry', () => {
    expect(getClaimableUtxosQueryKey({ btcAddress: 'bc1qabc' })).toEqual([
      'qbtcClaimableUtxos',
      'bc1qabc',
    ])
  })

  it('produces different keys for different addresses', () => {
    const a = getClaimableUtxosQueryKey({ btcAddress: 'bc1qaaa' })
    const b = getClaimableUtxosQueryKey({ btcAddress: 'bc1qbbb' })
    expect(a).not.toEqual(b)
  })
})
