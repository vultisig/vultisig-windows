import { EvmChain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { formatLabeledEvmAddress } from './formatLabeledEvmAddress'

describe('formatLabeledEvmAddress', () => {
  const uniV2 = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d'

  it('labels a known contract on its supported chain', () => {
    expect(
      formatLabeledEvmAddress({ address: uniV2, chain: EvmChain.Ethereum })
    ).toBe('Uniswap V2 Router (0x7a25…488d)')
  })

  it('returns the raw address when unknown', () => {
    const random = '0x000000000000000000000000000000000000dead'
    expect(
      formatLabeledEvmAddress({ address: random, chain: EvmChain.Ethereum })
    ).toBe(random)
  })

  it('does not label a chain-scoped entry on the wrong chain', () => {
    // Uniswap V2 Router only matches on Ethereum — must NOT label the same
    // address on BSC where some other contract may live there.
    expect(
      formatLabeledEvmAddress({ address: uniV2, chain: EvmChain.BSC })
    ).toBe(uniV2)
  })

  it('is case-insensitive on the address', () => {
    expect(
      formatLabeledEvmAddress({
        address: uniV2.toUpperCase(),
        chain: EvmChain.Ethereum,
      })
    ).toBe('Uniswap V2 Router (0x7A25…488D)')
  })
})
