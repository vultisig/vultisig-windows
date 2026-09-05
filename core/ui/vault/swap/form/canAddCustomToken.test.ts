import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { canAddCustomToken } from './canAddCustomToken'

describe('canAddCustomToken', () => {
  it('offers the flow on a chain that supports custom tokens', () => {
    expect(
      canAddCustomToken({ chain: Chain.Ethereum, searchQuery: 'KJD' })
    ).toBe(true)
  })

  it('withholds the flow on a chain that has no token metadata source', () => {
    expect(
      canAddCustomToken({ chain: Chain.Bitcoin, searchQuery: 'KJD' })
    ).toBe(false)
  })

  it('withholds the flow until the user has actually searched', () => {
    expect(canAddCustomToken({ chain: Chain.Ethereum, searchQuery: '' })).toBe(
      false
    )
    expect(
      canAddCustomToken({ chain: Chain.Ethereum, searchQuery: '   ' })
    ).toBe(false)
  })
})
