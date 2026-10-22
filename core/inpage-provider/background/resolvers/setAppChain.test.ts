import { updateAppSession } from '@core/extension/storage/appSessions'
import { setCurrentEVMChainId } from '@core/extension/storage/currentEvmChainId'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { Chain, EvmChain } from '@vultisig/core-chain/Chain'
import { getEvmChainId } from '@vultisig/core-chain/chains/evm/chainInfo'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppChain } from './setAppChain'

vi.mock('@core/extension/storage/appSessions', () => ({
  updateAppSession: vi.fn(),
}))
vi.mock('@core/extension/storage/currentEvmChainId', () => ({
  setCurrentEVMChainId: vi.fn(),
}))
vi.mock('@core/extension/storage/currentCosmosChainId', () => ({
  setCurrentCosmosChainId: vi.fn(),
}))

const chainOnlySession = {
  vaultId: 'vault-1',
  host: 'example.com',
  url: 'https://example.com',
  authorizedChains: [Chain.Polygon],
  isAccountAccessGranted: false,
}

const switchChain = (chain: EvmChain) =>
  setAppChain({
    input: { evm: chain },
    context: {
      requestOrigin: chainOnlySession.url,
      appSession: chainOnlySession,
    },
  })

describe('setAppChain', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('switches a chain-only session to a chain the user approved', async () => {
    await expect(switchChain(Chain.Polygon)).resolves.toBeUndefined()

    const chainId = getEvmChainId(Chain.Polygon)
    expect(setCurrentEVMChainId).toHaveBeenCalledExactlyOnceWith(chainId)
    expect(updateAppSession).toHaveBeenCalledExactlyOnceWith({
      vaultId: chainOnlySession.vaultId,
      host: chainOnlySession.host,
      fields: { selectedEVMChainId: chainId },
    })
  })

  it('rejects a chain-only session switching to a chain the user has not approved', async () => {
    await expect(switchChain(Chain.Ethereum)).rejects.toBe(
      BackgroundError.Unauthorized
    )

    expect(setCurrentEVMChainId).not.toHaveBeenCalled()
    expect(updateAppSession).not.toHaveBeenCalled()
  })
})
