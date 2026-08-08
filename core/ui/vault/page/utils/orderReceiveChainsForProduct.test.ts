import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { orderReceiveChainsForProduct } from './orderReceiveChainsForProduct'

describe('orderReceiveChainsForProduct', () => {
  it('prioritizes Station Terra chains only when they are present', () => {
    const chains = [
      Chain.THORChain,
      Chain.TerraClassic,
      Chain.Bitcoin,
      Chain.Terra,
    ]

    expect(
      orderReceiveChainsForProduct({
        chains,
        productBrand: 'station',
      })
    ).toEqual([Chain.Terra, Chain.TerraClassic, Chain.Bitcoin, Chain.THORChain])
  })

  it('does not add Station Terra chains to vaults that do not have them', () => {
    const chains = [Chain.THORChain, Chain.Bitcoin, Chain.Solana]

    expect(
      orderReceiveChainsForProduct({
        chains,
        productBrand: 'station',
      })
    ).toEqual([Chain.Bitcoin, Chain.Solana, Chain.THORChain])
  })

  it('preserves the existing vault chain order for Vultisig', () => {
    const chains = [Chain.THORChain, Chain.Bitcoin, Chain.Solana]

    expect(
      orderReceiveChainsForProduct({
        chains,
        productBrand: 'vultisig',
      })
    ).toEqual(chains)
  })
})
