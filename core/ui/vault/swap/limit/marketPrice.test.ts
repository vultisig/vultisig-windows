import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  fetchLimitSwapMarketPrice,
  getLimitSwapMarketPrice,
  getMarketProbeAmount,
} from './marketPrice'

describe('getLimitSwapMarketPrice', () => {
  it('derives price from a quote against an 8-decimal source', () => {
    // 1 BTC in, 16e8 out -> 16 target units per source unit.
    expect(
      getLimitSwapMarketPrice({
        expectedAmountOut: '1600000000',
        sourceAmount: 100_000_000n,
        sourceDecimals: 8,
      })
    ).toBe(16)
  })

  it('applies source decimals so an 18-decimal source is not mis-scaled', () => {
    expect(
      getLimitSwapMarketPrice({
        expectedAmountOut: '400000000',
        sourceAmount: 10n ** 18n,
        sourceDecimals: 18,
      })
    ).toBe(4)
  })

  it('handles a fractional source amount', () => {
    expect(
      getLimitSwapMarketPrice({
        expectedAmountOut: '800000000',
        sourceAmount: 2n * 10n ** 18n,
        sourceDecimals: 18,
      })
    ).toBe(4)
  })

  it('rejects an unparseable expected amount', () => {
    expect(() =>
      getLimitSwapMarketPrice({
        expectedAmountOut: 'not-a-number',
        sourceAmount: 100_000_000n,
        sourceDecimals: 8,
      })
    ).toThrow(/Invalid expected_amount_out/)
  })

  it('rejects a zero source amount rather than dividing by zero', () => {
    expect(() =>
      getLimitSwapMarketPrice({
        expectedAmountOut: '1600000000',
        sourceAmount: 0n,
        sourceDecimals: 8,
      })
    ).toThrow(/zero source amount/)
  })
})

describe('getMarketProbeAmount', () => {
  it('sizes the probe to roughly $100 of the source asset', () => {
    // $50k BTC -> 0.002 BTC
    expect(getMarketProbeAmount({ price: 50_000, decimals: 8 })).toBe(200_000n)
  })

  it('scales a cheap asset up so the probe clears dust minimums', () => {
    // $2 RUNE -> 50 RUNE, rather than a single unit that quotes as dust.
    expect(getMarketProbeAmount({ price: 2, decimals: 8 })).toBe(5_000_000_000n)
  })

  it('falls back to a single unit when no price is known', () => {
    expect(getMarketProbeAmount({ price: 0, decimals: 8 })).toBe(100_000_000n)
  })

  it('never returns a zero probe', () => {
    expect(
      getMarketProbeAmount({ price: 10 ** 12, decimals: 2 })
    ).toBeGreaterThan(0n)
  })
})

describe('fetchLimitSwapMarketPrice', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const stubQuote = (expectedAmountOut: string) => {
    const fetchMock = vi.fn(
      async (_url: RequestInfo | URL) =>
        new Response(JSON.stringify({ expected_amount_out: expectedAmountOut }))
    )
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
  }

  it('quotes an unbiased reference price', async () => {
    const fetchMock = stubQuote('1600000000')

    await expect(
      fetchLimitSwapMarketPrice({
        sourceAsset: 'BTC.BTC',
        targetAsset: 'ETH.ETH',
        sourceAmount: 100_000_000n,
        sourceDecimals: 8,
      })
    ).resolves.toBe(16)

    const url = String(fetchMock.mock.calls[0][0])
    // No affiliate and no tolerance padding: this price only seeds the form.
    expect(url).toContain('liquidity_tolerance_bps=0')
    expect(url).toContain('from_asset=BTC.BTC')
    expect(url).toContain('to_asset=ETH.ETH')
  })

  it('sends the probe amount in THORChain 1e8 units, not native units', async () => {
    const fetchMock = stubQuote('400000000')

    await fetchLimitSwapMarketPrice({
      sourceAsset: 'ETH.ETH',
      targetAsset: 'BTC.BTC',
      sourceAmount: 10n ** 18n,
      sourceDecimals: 18,
    })

    expect(String(fetchMock.mock.calls[0][0])).toContain('amount=100000000')
  })

  it('includes a destination when one is known', async () => {
    const fetchMock = stubQuote('1600000000')

    await fetchLimitSwapMarketPrice({
      sourceAsset: 'BTC.BTC',
      targetAsset: 'ETH.ETH',
      sourceAmount: 100_000_000n,
      sourceDecimals: 8,
      destinationAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    })

    expect(String(fetchMock.mock.calls[0][0])).toContain('destination=0x742d35')
  })
})
