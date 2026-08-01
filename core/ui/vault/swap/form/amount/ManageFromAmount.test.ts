import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { getSuggestionDisplayValue } from './ManageFromAmount'

describe('getSuggestionDisplayValue', () => {
  it('crops non-BTC amounts to 4 fraction digits', () => {
    expect(
      getSuggestionDisplayValue({
        amount: 6123456789012345678n,
        decimals: 18,
        chain: Chain.Ethereum,
      })
    ).toBe('6.1234')
  })

  it('crops BTC amounts to 8 fraction digits', () => {
    expect(
      getSuggestionDisplayValue({
        amount: 612345678n,
        decimals: 8,
        chain: Chain.Bitcoin,
      })
    ).toBe('6.12345678')
  })

  it('trims trailing zeros and the dangling dot', () => {
    expect(
      getSuggestionDisplayValue({
        amount: 5000000000000000000n,
        decimals: 18,
        chain: Chain.Ethereum,
      })
    ).toBe('5')
    expect(
      getSuggestionDisplayValue({
        amount: 100100000n,
        decimals: 6,
        chain: Chain.Ethereum,
      })
    ).toBe('100.1')
  })

  it('renders dust below the crop as 0 without affecting the stored value', () => {
    expect(
      getSuggestionDisplayValue({
        amount: 1234n,
        decimals: 18,
        chain: Chain.Ethereum,
      })
    ).toBe('0')
  })
})
