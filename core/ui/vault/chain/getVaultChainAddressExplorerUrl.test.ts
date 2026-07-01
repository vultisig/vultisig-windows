import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { getVaultChainAddressExplorerUrl } from './getVaultChainAddressExplorerUrl'

describe('getVaultChainAddressExplorerUrl', () => {
  it('builds a Terra Classic Finder address URL without a duplicate network', () => {
    const address = 'terra1luncaddress'

    expect(
      getVaultChainAddressExplorerUrl({
        address,
        chain: Chain.TerraClassic,
      })
    ).toBe(`https://finder.terra.money/classic/address/${address}`)
  })

  it('uses the shared block explorer resolver for other chains', () => {
    const address = '0x1234'

    expect(
      getVaultChainAddressExplorerUrl({
        address,
        chain: Chain.Ethereum,
      })
    ).toBe(`https://etherscan.io/address/${address}`)
  })
})
