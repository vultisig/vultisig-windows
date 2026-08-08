import { Chain } from '@vultisig/core-chain/Chain'

import { getStationPrimaryChainForNetwork } from '../../src/inpage/providers/station'

describe('Station provider', () => {
  it('uses Terra as the mainnet primary chain so migrated Station key-import vaults can connect', () => {
    expect(getStationPrimaryChainForNetwork('mainnet')).toBe(Chain.Terra)
  })

  it('keeps Terra Classic as the classic-network primary chain', () => {
    expect(getStationPrimaryChainForNetwork('classic')).toBe(Chain.TerraClassic)
  })
})
