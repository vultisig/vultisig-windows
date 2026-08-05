import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { resolveMarketDataSource } from './MarketDataSource'

describe('resolveMarketDataSource', () => {
  it('routes coins with a price provider id to an id source, lowercased', () => {
    expect(
      resolveMarketDataSource({
        chain: Chain.Bitcoin,
        priceProviderId: 'Bitcoin',
      })
    ).toEqual({ id: 'bitcoin' })
  })

  it('prefers the price provider id over a contract address', () => {
    expect(
      resolveMarketDataSource({
        chain: Chain.Ethereum,
        id: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        priceProviderId: 'tether',
      })
    ).toEqual({ id: 'tether' })
  })

  it('routes EVM tokens without a price provider id to a contract source, lowercased', () => {
    expect(
      resolveMarketDataSource({
        chain: Chain.Ethereum,
        id: '0xDAC17F958D2ee523a2206206994597C13D831ec7',
      })
    ).toEqual({
      contract: {
        platform: 'ethereum',
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      },
    })
  })

  it('maps EVM chains to their CoinGecko asset-platform slugs', () => {
    const source = resolveMarketDataSource({
      chain: Chain.Arbitrum,
      id: '0xabc',
    })

    expect(source).toEqual({
      contract: { platform: 'arbitrum-one', address: '0xabc' },
    })
  })

  it('returns null for Maya pool-priced tokens', () => {
    expect(
      resolveMarketDataSource({ chain: Chain.MayaChain, id: 'MAYA' })
    ).toBeNull()
  })

  it('returns null for THORChain secured assets', () => {
    expect(
      resolveMarketDataSource({ chain: Chain.THORChain, id: 'btc-btc' })
    ).toBeNull()
  })

  it('returns null for coins CoinGecko cannot resolve', () => {
    expect(resolveMarketDataSource({ chain: Chain.Bitcoin })).toBeNull()
    expect(
      resolveMarketDataSource({ chain: Chain.Solana, id: 'SomeMintAddress' })
    ).toBeNull()
  })
})
