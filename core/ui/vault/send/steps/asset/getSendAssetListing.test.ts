import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it } from 'vitest'

import { filterChainsByQuery, getSendAssetListing } from './getSendAssetListing'

const coin = (chain: Chain, ticker: string, id?: string): AccountCoin => ({
  chain,
  id,
  ticker,
  decimals: 18,
  address: `${chain}-address`,
})

const eth = coin(Chain.Ethereum, 'ETH')
const usdc = coin(Chain.Ethereum, 'USDC', '0xusdc')
const btc = coin(Chain.Bitcoin, 'BTC')
const sol = coin(Chain.Solana, 'SOL')
const solUsdc = coin(Chain.Solana, 'USDC', 'usdc-mint')

const fiat = new Map<AccountCoin, number>([
  [eth, 300],
  [usdc, 50],
  [btc, 500],
  [sol, 0],
  [solUsdc, 50],
])

const baseInput = {
  coins: [eth, usdc, btc, sol, solUsdc],
  chains: [Chain.Ethereum, Chain.Bitcoin, Chain.Solana],
  getFiatValue: (value: AccountCoin) => fiat.get(value) ?? 0,
  filter: null,
  query: '',
  selectedCoin: eth,
}

const tickers = (coins: AccountCoin[]) =>
  coins.map(({ chain, ticker }) => `${chain}:${ticker}`)

describe('getSendAssetListing', () => {
  it('sorts by fiat, then ticker, then chain, with the selection pinned first', () => {
    const { coins } = getSendAssetListing(baseInput)

    expect(tickers(coins)).toEqual([
      'Ethereum:ETH',
      'Bitcoin:BTC',
      'Ethereum:USDC',
      'Solana:USDC',
      'Solana:SOL',
    ])
  })

  it('shows only the filtered chain without a query', () => {
    const { coins } = getSendAssetListing({
      ...baseInput,
      filter: Chain.Solana,
    })

    expect(tickers(coins)).toEqual(['Solana:USDC', 'Solana:SOL'])
  })

  it('searches every chain by ticker or chain name whatever the filter', () => {
    const byTicker = getSendAssetListing({
      ...baseInput,
      filter: Chain.Bitcoin,
      query: ' usd ',
    })
    expect(tickers(byTicker.coins)).toEqual(['Ethereum:USDC', 'Solana:USDC'])

    const byChainName = getSendAssetListing({ ...baseInput, query: 'sola' })
    expect(tickers(byChainName.coins)).toEqual(['Solana:USDC', 'Solana:SOL'])
  })

  it('does not pin the selection when it is filtered out', () => {
    const { coins } = getSendAssetListing({
      ...baseInput,
      filter: Chain.Bitcoin,
    })

    expect(tickers(coins)).toEqual(['Bitcoin:BTC'])
  })

  it('leaves out coins of chains the vault does not list', () => {
    const { coins } = getSendAssetListing({
      ...baseInput,
      chains: [Chain.Bitcoin],
    })

    expect(tickers(coins)).toEqual(['Bitcoin:BTC'])
  })
})

describe('getSendAssetListing selected coin visibility', () => {
  it('lists the selected coin under every chain and on its own chain', () => {
    expect(getSendAssetListing(baseInput).isSelectedCoinListed).toBe(true)
    expect(
      getSendAssetListing({ ...baseInput, filter: Chain.Ethereum })
        .isSelectedCoinListed
    ).toBe(true)
  })

  it('does not list the selected coin under another chain', () => {
    expect(
      getSendAssetListing({ ...baseInput, filter: Chain.Bitcoin })
        .isSelectedCoinListed
    ).toBe(false)
  })

  it('does not list the selected coin when the search excludes it', () => {
    expect(
      getSendAssetListing({ ...baseInput, query: 'btc' }).isSelectedCoinListed
    ).toBe(false)
    expect(
      getSendAssetListing({ ...baseInput, query: 'eth' }).isSelectedCoinListed
    ).toBe(true)
  })
})

describe('getSendAssetListing DeFi-only selected coin', () => {
  const sruji = coin(Chain.THORChain, 'sRUJI', 'x/staking-ruji')
  const ybrune = coin(Chain.THORChain, 'ybRUNE', 'x/ybrune')
  const rune = coin(Chain.THORChain, 'RUNE')
  const input = {
    ...baseInput,
    coins: [...baseInput.coins, rune],
    chains: [...baseInput.chains, Chain.THORChain],
    selectedCoin: sruji,
  }

  it('lists and pins the selected coin the portfolio leaves out', () => {
    const listing = getSendAssetListing(input)

    expect(tickers(listing.coins)[0]).toBe('THORChain:sRUJI')
    expect(listing.isSelectedCoinListed).toBe(true)
  })

  it('keeps every other left-out coin hidden', () => {
    expect(tickers(getSendAssetListing(input).coins)).not.toContain(
      `${ybrune.chain}:${ybrune.ticker}`
    )
  })

  it('still applies the chain filter and the search to it', () => {
    const otherChain = getSendAssetListing({ ...input, filter: Chain.Bitcoin })
    expect(tickers(otherChain.coins)).not.toContain('THORChain:sRUJI')
    expect(otherChain.isSelectedCoinListed).toBe(false)

    const ownChain = getSendAssetListing({ ...input, filter: Chain.THORChain })
    expect(tickers(ownChain.coins)).toEqual([
      'THORChain:sRUJI',
      'THORChain:RUNE',
    ])

    expect(
      getSendAssetListing({ ...input, query: 'eth' }).isSelectedCoinListed
    ).toBe(false)
    expect(
      tickers(getSendAssetListing({ ...input, query: 'ruji' }).coins)
    ).toEqual(['THORChain:sRUJI'])
  })
})

describe('filterChainsByQuery', () => {
  const chains = [Chain.Ethereum, Chain.Bitcoin, Chain.THORChain]

  it('keeps every chain, in order, for an empty query', () => {
    expect(filterChainsByQuery({ chains, query: '  ' })).toEqual(chains)
  })

  it('matches the display name without regard to case', () => {
    expect(filterChainsByQuery({ chains, query: 'THOR' })).toEqual([
      Chain.THORChain,
    ])
  })

  it('matches the native ticker', () => {
    expect(filterChainsByQuery({ chains, query: 'btc' })).toEqual([
      Chain.Bitcoin,
    ])
  })

  it('returns nothing when no chain matches', () => {
    expect(filterChainsByQuery({ chains, query: 'zzz' })).toEqual([])
  })
})
