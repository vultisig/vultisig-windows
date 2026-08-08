import { CosmosChain, OtherChain } from '@vultisig/core-chain/Chain'

import { getKeplrSupportedChainByChainId } from '../../src/inpage/providers/keplrChainInfo'

describe('getKeplrSupportedChainByChainId', () => {
  it('resolves QBTC even though it is not an SDK CosmosChain', () => {
    expect(getKeplrSupportedChainByChainId('qbtc')).toBe(OtherChain.QBTC)
  })

  it('keeps native Cosmos chain resolution intact', () => {
    expect(getKeplrSupportedChainByChainId('cosmoshub-4')).toBe(
      CosmosChain.Cosmos
    )
  })

  it('rejects unsupported chain IDs', () => {
    expect(getKeplrSupportedChainByChainId('unknown-1')).toBeUndefined()
  })
})
