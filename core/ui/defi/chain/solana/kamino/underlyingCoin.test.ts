import { Chain } from '@vultisig/core-chain/Chain'
import { kaminoConfig } from '@vultisig/core-chain/chains/solana/kamino/config'
import { kaminoVaultRegistry } from '@vultisig/core-chain/chains/solana/kamino/registry'
import { describe, expect, it } from 'vitest'

import { kaminoUnderlyingCoin } from './underlyingCoin'

describe('kaminoUnderlyingCoin', () => {
  it('resolves every curated vault to a coin with a logo and a price feed', () => {
    // The registry pins mints in base58, and the known-token index is keyed by
    // a lowercased id — a vault that stops resolving here would lose its logo
    // and its fiat value, so this is pinned rather than assumed.
    for (const descriptor of kaminoVaultRegistry) {
      const coin = kaminoUnderlyingCoin(descriptor)
      expect(coin.chain).toBe(Chain.Solana)
      expect(coin.logo, descriptor.fallbackName).toBeDefined()
      expect(coin.priceProviderId, descriptor.fallbackName).toBeDefined()
      expect(coin.decimals).toBe(descriptor.tokenDecimals)
    }
  })

  it('resolves the dollar vaults to USDC, keeping the mint case the price query keys on', () => {
    const usdcVaults = kaminoVaultRegistry.filter(
      ({ tokenMint }) => tokenMint !== kaminoConfig.wrappedSolMint
    )
    expect(usdcVaults.length).toBeGreaterThan(0)

    for (const descriptor of usdcVaults) {
      const coin = kaminoUnderlyingCoin(descriptor)
      expect(coin.ticker).toBe('USDC')
      expect(coin.id).toBe(descriptor.tokenMint)
    }
  })

  it('resolves the wrapped-SOL vault to native SOL', () => {
    const solVault = kaminoVaultRegistry.find(
      ({ tokenMint }) => tokenMint === kaminoConfig.wrappedSolMint
    )
    expect(solVault).toBeDefined()

    const coin = kaminoUnderlyingCoin(solVault!)
    expect(coin.ticker).toBe('SOL')
    expect(coin.id).toBeUndefined()
  })
})
