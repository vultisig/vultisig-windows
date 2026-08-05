import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockQueryUrl } = vi.hoisted(() => ({
  mockQueryUrl: vi.fn(),
}))

vi.mock('@vultisig/lib-utils/query/queryUrl', () => ({
  queryUrl: mockQueryUrl,
}))

import { getCoinMarketStats } from './getCoinMarketStats'

describe('getCoinMarketStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests the markets endpoint with a lowercased id', async () => {
    mockQueryUrl.mockResolvedValue([{ id: 'bitcoin' }])

    await getCoinMarketStats({ id: 'Bitcoin', fiatCurrency: 'usd' })

    const [url] = mockQueryUrl.mock.calls[0]
    expect(url).toContain('/coingeicko/api/v3/coins/markets')
    expect(url).toContain('ids=bitcoin')
    expect(url).toContain('vs_currency=usd')
  })

  it('decodes the first record with ISO dates as timestamps', async () => {
    mockQueryUrl.mockResolvedValue([
      {
        id: 'bitcoin',
        current_price: 65000,
        market_cap: 1_280_000_000_000,
        market_cap_rank: 1,
        fully_diluted_valuation: 1_360_000_000_000,
        total_volume: 32_000_000_000,
        high_24h: 66000,
        low_24h: 64000,
        price_change_percentage_24h: -1.5,
        circulating_supply: 19_800_000,
        max_supply: 21_000_000,
        ath: 108000,
        ath_change_percentage: -39.81,
        ath_date: '2025-10-06T18:57:42.558Z',
        atl: 67.81,
        atl_change_percentage: 95700.1,
        atl_date: '2013-07-06T00:00:00.000Z',
      },
    ])

    const stats = await getCoinMarketStats({
      id: 'bitcoin',
      fiatCurrency: 'usd',
    })

    expect(stats.currentPrice).toBe(65000)
    expect(stats.marketCapRank).toBe(1)
    expect(stats.athDate).toBe(Date.parse('2025-10-06T18:57:42.558Z'))
    expect(stats.atlDate).toBe(Date.parse('2013-07-06T00:00:00.000Z'))
  })

  it('normalizes missing and non-finite fields to null', async () => {
    mockQueryUrl.mockResolvedValue([
      {
        id: 'obscure-token',
        current_price: 0.01,
        max_supply: null,
        ath_date: 'not-a-date',
      },
    ])

    const stats = await getCoinMarketStats({
      id: 'obscure-token',
      fiatCurrency: 'usd',
    })

    expect(stats.marketCap).toBeNull()
    expect(stats.maxSupply).toBeNull()
    expect(stats.athDate).toBeNull()
  })

  it('throws on an empty response so the miss is not cached as success', async () => {
    mockQueryUrl.mockResolvedValue([])

    await expect(
      getCoinMarketStats({ id: 'unknown', fiatCurrency: 'usd' })
    ).rejects.toThrow()
  })
})
