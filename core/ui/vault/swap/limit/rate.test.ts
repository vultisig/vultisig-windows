import { describe, expect, it } from 'vitest'

import {
  fiatUnitPriceToRate,
  rateToFiatUnitPrice,
  rateToUnitPrice,
  unitPriceToRate,
} from './rate'

// Sell USDT, buy BTC at $65,800.13 -- the Figma reference values.
const btcPerUsdt = 1 / 65_800.13

describe('rateToUnitPrice', () => {
  it('inverts a rate into sell units per buy unit', () => {
    expect(rateToUnitPrice({ rate: btcPerUsdt })).toBeCloseTo(65_800.13, 2)
  })

  it.each([0, -1])('returns null for a %s rate', rate => {
    expect(rateToUnitPrice({ rate })).toBeNull()
  })
})

describe('unitPriceToRate', () => {
  it('round-trips with rateToUnitPrice', () => {
    const unitPrice = rateToUnitPrice({ rate: btcPerUsdt })

    expect(unitPriceToRate({ unitPrice: unitPrice as number })).toBeCloseTo(
      btcPerUsdt,
      12
    )
  })

  it.each([0, -1])('returns null for a %s unit price', unitPrice => {
    expect(unitPriceToRate({ unitPrice })).toBeNull()
  })
})

describe('fiatUnitPriceToRate', () => {
  it('converts a fiat price per buy unit using the sell coin price', () => {
    expect(
      fiatUnitPriceToRate({ fiatUnitPrice: 65_800.13, sellCoinFiatPrice: 1 })
    ).toBeCloseTo(btcPerUsdt, 12)
  })

  it('handles a sell asset that is not a dollar stablecoin', () => {
    // Sell ETH at $2,000, buy BTC at $60,000 -> 1 ETH buys 1/30 BTC.
    expect(
      fiatUnitPriceToRate({ fiatUnitPrice: 60_000, sellCoinFiatPrice: 2_000 })
    ).toBeCloseTo(1 / 30, 12)
  })

  // Fabricating a rate here would become the signed LIM.
  it.each([undefined, 0])(
    'returns null without a usable sell price (%s)',
    sellCoinFiatPrice => {
      expect(
        fiatUnitPriceToRate({ fiatUnitPrice: 65_800, sellCoinFiatPrice })
      ).toBeNull()
    }
  )

  it('returns null for a non-positive fiat price', () => {
    expect(
      fiatUnitPriceToRate({ fiatUnitPrice: 0, sellCoinFiatPrice: 1 })
    ).toBeNull()
  })
})

describe('rateToFiatUnitPrice', () => {
  it('is the inverse of fiatUnitPriceToRate', () => {
    expect(
      rateToFiatUnitPrice({ rate: btcPerUsdt, sellCoinFiatPrice: 1 })
    ).toBeCloseTo(65_800.13, 2)
  })

  it('returns null without a sell price', () => {
    expect(
      rateToFiatUnitPrice({ rate: btcPerUsdt, sellCoinFiatPrice: undefined })
    ).toBeNull()
  })
})
