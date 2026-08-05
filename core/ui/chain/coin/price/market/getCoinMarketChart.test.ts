import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockQueryUrl } = vi.hoisted(() => ({
  mockQueryUrl: vi.fn(),
}))

vi.mock('@vultisig/lib-utils/query/queryUrl', () => ({
  queryUrl: mockQueryUrl,
}))

import { getCoinMarketChart } from './getCoinMarketChart'
import { marketChartRangeDays } from './MarketChartRange'

describe('getCoinMarketChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryUrl.mockResolvedValue({ prices: [] })
  })

  it('requests the id market_chart endpoint with a lowercased id', async () => {
    await getCoinMarketChart({
      source: { id: 'Bitcoin' },
      fiatCurrency: 'usd',
      range: 'day',
    })

    const [url] = mockQueryUrl.mock.calls[0]
    expect(url).toContain('/coingeicko/api/v3/coins/bitcoin/market_chart')
    expect(url).toContain('vs_currency=usd')
    expect(url).toContain('days=1')
  })

  it('requests the contract market_chart endpoint with lowercased segments', async () => {
    await getCoinMarketChart({
      source: {
        contract: {
          platform: 'Ethereum',
          address: '0xDAC17F958D2ee523a2206206994597C13D831ec7',
        },
      },
      fiatCurrency: 'eur',
      range: 'week',
    })

    const [url] = mockQueryUrl.mock.calls[0]
    expect(url).toContain(
      '/coingeicko/api/v3/coins/ethereum/contract/0xdac17f958d2ee523a2206206994597c13d831ec7/market_chart'
    )
    expect(url).toContain('vs_currency=eur')
    expect(url).toContain('days=7')
  })

  it('never sends the paid-only interval param', async () => {
    await getCoinMarketChart({
      source: { id: 'bitcoin' },
      fiatCurrency: 'usd',
      range: 'all',
    })

    const [url] = mockQueryUrl.mock.calls[0]
    expect(url).not.toContain('interval')
  })

  it('maps every range to the expected days param', () => {
    expect(marketChartRangeDays).toEqual({
      day: '1',
      week: '7',
      month: '30',
      year: '365',
      all: 'max',
    })
  })

  it('returns a cleaned series', async () => {
    mockQueryUrl.mockResolvedValue({
      prices: [
        [2000, 2],
        [1000, 1],
        [1500, null],
      ],
    })

    const points = await getCoinMarketChart({
      source: { id: 'bitcoin' },
      fiatCurrency: 'usd',
      range: 'day',
    })

    expect(points).toEqual([
      { timestamp: 1000, price: 1 },
      { timestamp: 2000, price: 2 },
    ])
  })
})
