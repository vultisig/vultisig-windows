import { installSubstrateDiscovery } from '@clients/extension/src/inpage/utils/substrateDiscovery'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('installSubstrateDiscovery', () => {
  afterEach(() => {
    delete window.injectedWeb3
  })

  it('lists the wallet under the vultisig key with the version extension-dapp requires', async () => {
    const enable = vi.fn().mockResolvedValue('injected')

    installSubstrateDiscovery(enable)

    const entry = window.injectedWeb3?.vultisig
    expect(typeof entry?.version).toBe('string')
    await expect(entry?.enable('taostats')).resolves.toBe('injected')
    expect(enable).toHaveBeenCalledWith('taostats')
  })

  it('keeps wallets that registered first', () => {
    const other = { enable: vi.fn(), version: '1.0.0' }
    window.injectedWeb3 = { talisman: other }

    installSubstrateDiscovery(vi.fn())

    expect(window.injectedWeb3.talisman).toBe(other)
    expect(Object.keys(window.injectedWeb3)).toEqual(['talisman', 'vultisig'])
  })
})
