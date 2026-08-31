import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import {
  getImpliedSwapFee,
  getIndicativeSwapOutputAmount,
} from './useIndicativeSwapOutputAmountQuery'
import { FirmSwapQuoteReference } from './useLastFirmSwapQuoteReference'

// Prices and quotes observed on a real ETH -> BTC swap while investigating #4785.
const ethPrice = 2444
const btcPrice = 78_230

/** Spot value of a source amount, in destination units — no fees. */
const spot = (amount: number) => (amount * ethPrice) / btcPrice

const observedQuote: FirmSwapQuoteReference = {
  fromCoinKey: { chain: Chain.Ethereum },
  toCoinKey: { chain: Chain.Bitcoin },
  input: 0.005,
  output: 0.00013805,
}

describe('getImpliedSwapFee', () => {
  it('recovers what the provider withheld, in destination units', () => {
    const fee = getImpliedSwapFee({
      reference: observedQuote,
      fromPrice: ethPrice,
      toPrice: btcPrice,
    })

    expect(fee).toBeCloseTo(
      spot(observedQuote.input) - observedQuote.output,
      10
    )
  })

  it('reports no fee when a quote beat spot, rather than a negative one', () => {
    const fee = getImpliedSwapFee({
      reference: { ...observedQuote, output: 1 },
      fromPrice: ethPrice,
      toPrice: btcPrice,
    })

    expect(fee).toBe(0)
  })
})

describe('getIndicativeSwapOutputAmount', () => {
  const impliedFee = getImpliedSwapFee({
    reference: observedQuote,
    fromPrice: ethPrice,
    toPrice: btcPrice,
  })

  it('reproduces the quote it was derived from', () => {
    expect(
      getIndicativeSwapOutputAmount({
        amount: 0.005,
        fromPrice: ethPrice,
        toPrice: btcPrice,
        impliedFee,
      })
    ).toBeCloseTo(observedQuote.output, 10)
  })

  it('lands within a fraction of a percent at half the amount', () => {
    const estimate = getIndicativeSwapOutputAmount({
      amount: 0.0025,
      fromPrice: ethPrice,
      toPrice: btcPrice,
      impliedFee,
    })

    expect(estimate).toBeCloseTo(spot(0.0025) - impliedFee, 10)

    // The flat fee does not halve, so uncorrected spot overstates the payout by
    // more than 25% here — the gap this correction closes.
    expect(spot(0.0025) / estimate).toBeGreaterThan(1.25)
  })

  it('falls back to spot when no previous quote has revealed a fee', () => {
    expect(
      getIndicativeSwapOutputAmount({
        amount: 0.005,
        fromPrice: ethPrice,
        toPrice: btcPrice,
        impliedFee: 0,
      })
    ).toBeCloseTo(spot(0.005), 10)
  })

  it('floors at zero when the trade cannot cover the flat fee', () => {
    expect(
      getIndicativeSwapOutputAmount({
        amount: 0.0000001,
        fromPrice: ethPrice,
        toPrice: btcPrice,
        impliedFee,
      })
    ).toBe(0)
  })
})
