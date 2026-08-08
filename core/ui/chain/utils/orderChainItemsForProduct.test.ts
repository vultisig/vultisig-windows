import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { orderChainItemsForProduct } from './orderChainItemsForProduct'

describe('orderChainItemsForProduct', () => {
  const items = [
    { chain: Chain.THORChain },
    { chain: Chain.TerraClassic },
    { chain: Chain.Bitcoin },
    { chain: Chain.Terra },
  ]

  it('keeps default brand ordering alphabetical by chain', () => {
    expect(
      orderChainItemsForProduct({
        items,
        getChain: item => item.chain,
        productBrand: 'vultisig',
      }).map(item => item.chain)
    ).toEqual([Chain.Bitcoin, Chain.Terra, Chain.TerraClassic, Chain.THORChain])
  })

  it('prioritizes Terra then TerraClassic for Station', () => {
    expect(
      orderChainItemsForProduct({
        items,
        getChain: item => item.chain,
        productBrand: 'station',
      }).map(item => item.chain)
    ).toEqual([Chain.Terra, Chain.TerraClassic, Chain.Bitcoin, Chain.THORChain])
  })
})
