import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it } from 'vitest'

import { toPriceableCoin } from './toPriceableCoin'

const tronInVault: AccountCoin = {
  chain: Chain.Tron,
  address: 'TDestination',
  ticker: 'TRX',
  decimals: 6,
  priceProviderId: 'tron-from-vault',
}

describe('toPriceableCoin', () => {
  it('prices through the vault coin when the vault holds it', () => {
    const coin = toPriceableCoin({
      fee: { chain: Chain.Tron, amount: 143_000_000n, decimals: 8 },
      vaultCoins: [tronInVault],
    })

    expect(coin).toBe(tronInVault)
  })

  it('prices a native fee coin the vault does not hold through the chain fee coin', () => {
    // A THORChain swap charges its fee in the destination coin, which the
    // signer often has not added. Dropped from the lookup, the fee priced at
    // zero and the total lost it (#4815).
    const coin = toPriceableCoin({
      fee: { chain: Chain.Tron, amount: 143_000_000n, decimals: 8 },
      vaultCoins: [],
    })

    expect(coin).toEqual({
      chain: Chain.Tron,
      id: undefined,
      priceProviderId: 'tron',
    })
  })

  it('leaves a token the vault does not hold on its key alone', () => {
    // No provider id exists to invent for it; the ERC-20 lookup resolves it
    // from chain and address.
    const coin = toPriceableCoin({
      fee: {
        chain: Chain.Ethereum,
        id: '0xusdc',
        amount: 40_000n,
        decimals: 6,
      },
      vaultCoins: [],
    })

    expect(coin).toEqual({ chain: Chain.Ethereum, id: '0xusdc' })
  })

  it('matches the vault coin by chain and id, not by chain alone', () => {
    const usdcInVault: AccountCoin = {
      chain: Chain.Ethereum,
      id: '0xusdc',
      address: '0xsigner',
      ticker: 'USDC',
      decimals: 6,
      priceProviderId: 'usd-coin',
    }

    const coin = toPriceableCoin({
      fee: {
        chain: Chain.Ethereum,
        id: '0xdai',
        amount: 40_000n,
        decimals: 18,
      },
      vaultCoins: [usdcInVault],
    })

    expect(coin).toEqual({ chain: Chain.Ethereum, id: '0xdai' })
  })
})
