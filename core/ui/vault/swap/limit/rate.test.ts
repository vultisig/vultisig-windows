import { describe, expect, it } from 'vitest'

import { rateToSellUnitFiatValue, sellUnitFiatValueToRate } from './rate'

// Sell ETH, buy BTC: 1 ETH is worth 0.02950822 BTC with BTC at ~$64,260.
const btcPerEth = 0.02950822
const btcFiatPrice = 64_260

describe('rateToSellUnitFiatValue', () => {
  it('prices one sell unit in fiat via the buy asset price', () => {
    expect(
      rateToSellUnitFiatValue({
        rate: btcPerEth,
        buyCoinFiatPrice: btcFiatPrice,
      })
    ).toBeCloseTo(1_896.2, 1)
  })

  it.each([0, -1])('returns null for a %s rate', rate => {
    expect(
      rateToSellUnitFiatValue({ rate, buyCoinFiatPrice: btcFiatPrice })
    ).toBeNull()
  })

  it.each([undefined, 0])(
    'returns null without a usable buy price (%s)',
    buyCoinFiatPrice => {
      expect(
        rateToSellUnitFiatValue({ rate: btcPerEth, buyCoinFiatPrice })
      ).toBeNull()
    }
  )
})

describe('sellUnitFiatValueToRate', () => {
  it('round-trips with rateToSellUnitFiatValue', () => {
    expect(
      sellUnitFiatValueToRate({
        fiatValue: btcPerEth * btcFiatPrice,
        buyCoinFiatPrice: btcFiatPrice,
      })
    ).toBeCloseTo(btcPerEth, 12)
  })

  it('handles a buy asset that is not a dollar stablecoin', () => {
    // 1 ETH worth $2,000 with BTC at $60,000 -> 1 ETH buys 1/30 BTC.
    expect(
      sellUnitFiatValueToRate({ fiatValue: 2_000, buyCoinFiatPrice: 60_000 })
    ).toBeCloseTo(1 / 30, 12)
  })

  // Fabricating a rate here would become the signed LIM.
  it.each([undefined, 0])(
    'returns null without a usable buy price (%s)',
    buyCoinFiatPrice => {
      expect(
        sellUnitFiatValueToRate({ fiatValue: 1_896.2, buyCoinFiatPrice })
      ).toBeNull()
    }
  )

  it('returns null for a non-positive fiat value', () => {
    expect(
      sellUnitFiatValueToRate({ fiatValue: 0, buyCoinFiatPrice: btcFiatPrice })
    ).toBeNull()
  })
})
