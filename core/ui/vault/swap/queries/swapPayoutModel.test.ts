import { Chain } from '@vultisig/core-chain/Chain'
import { NativeSwapQuote } from '@vultisig/core-chain/swap/native/NativeSwapQuote'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { describe, expect, it } from 'vitest'

import { getSwapPayoutEstimate, getSwapPayoutModel } from './swapPayoutModel'

const toCoinKey = { chain: Chain.Bitcoin }
const btcDecimals = 8

/** THORChain reports the target side in 8 decimals regardless of the token. */
const sats = (btc: number) => Math.round(btc * 1e8).toString()

type NativeQuoteInput = {
  expectedAmountOut: number
  outboundFee: number
  totalFee: number
}

const nativeQuote = ({
  expectedAmountOut,
  outboundFee,
  totalFee,
}: NativeQuoteInput): { native: NativeSwapQuote } => ({
  native: {
    swapChain: 'THORChain',
    expected_amount_out: sats(expectedAmountOut),
    expiry: 1_700_000_000,
    fees: {
      affiliate: '0',
      asset: 'BTC.BTC',
      outbound: sats(outboundFee),
      total: sats(totalFee),
    },
    memo: '=:BTC.BTC:bc1qexample',
    notes: '',
    outbound_delay_blocks: 0,
    outbound_delay_seconds: 0,
    recommended_min_amount_in: '0',
    warning: '',
  },
})

const fit = (
  quote: Parameters<typeof getSwapPayoutModel>[0]['quote'],
  input: number
) =>
  shouldBePresent(
    getSwapPayoutModel({
      quote,
      input,
      toCoinKey,
      toCoinDecimals: btcDecimals,
    }),
    'payout model'
  )

// A real ETH -> BTC quote observed while investigating #4785: a $12 trade whose
// cost is almost entirely the flat BTC outbound fee.
const smallTrade = {
  input: 0.005,
  quote: nativeQuote({
    expectedAmountOut: 0.00013805,
    outboundFee: 0.0000166,
    totalFee: 0.0000182,
  }),
}

// The same pair quoted at 100x the size. The flat outbound fee is unchanged;
// the liquidity fee that scales with size now dominates the total.
const largeTrade = {
  input: 0.5,
  quote: nativeQuote({
    expectedAmountOut: 0.01556153,
    outboundFee: 0.0000166,
    totalFee: 0.00006347,
  }),
}

describe('getSwapPayoutModel', () => {
  it('separates the flat outbound fee from the fees that scale with size', () => {
    const model = fit(largeTrade.quote, largeTrade.input)

    expect(model.flatFee).toBeCloseTo(0.0000166, 10)
    expect(model.proportionalFeeFraction).toBeCloseTo(0.003, 4)
    expect(model.rate).toBeCloseTo(0.03125, 5)
  })

  it('folds an aggregator quote into the rate, since it reports no breakdown', () => {
    const model = fit(
      {
        general: {
          dstAmount: sats(0.00013805),
          provider: 'li.fi',
          tx: { evm: { from: '0x', to: '0x', data: '0x', value: '0' } },
        },
      },
      0.005
    )

    expect(model.flatFee).toBe(0)
    expect(model.proportionalFeeFraction).toBe(0)
    expect(model.rate).toBeCloseTo(0.00013805 / 0.005, 10)
  })

  it('declines to fit a quote whose amounts cannot be read', () => {
    expect(
      getSwapPayoutModel({
        quote: nativeQuote({
          expectedAmountOut: 0.0001,
          outboundFee: 0,
          totalFee: 0,
        }),
        input: 0,
        toCoinKey,
        toCoinDecimals: btcDecimals,
      })
    ).toBeNull()
  })

  it('declines to fit a quote whose proportional fee is not plausible', () => {
    expect(
      getSwapPayoutModel({
        quote: nativeQuote({
          expectedAmountOut: 0.00005,
          outboundFee: 0,
          totalFee: 0.0001,
        }),
        input: 0.005,
        toCoinKey,
        toCoinDecimals: btcDecimals,
      })
    ).toBeNull()
  })
})

describe('getSwapPayoutEstimate', () => {
  it('reproduces the quote it was fitted to', () => {
    expect(
      getSwapPayoutEstimate({
        amount: smallTrade.input,
        model: fit(smallTrade.quote, smallTrade.input),
      })
    ).toBeCloseTo(0.00013805, 10)
  })

  it('halves the proportional fee with the amount and keeps the flat one whole', () => {
    const model = fit(smallTrade.quote, smallTrade.input)
    const estimate = getSwapPayoutEstimate({ amount: 0.0025, model })

    const grossAtHalf = 0.0025 * model.rate

    expect(estimate).toBeCloseTo(
      grossAtHalf * (1 - model.proportionalFeeFraction) - model.flatFee,
      10
    )
    // Spot alone would show a payout a third higher than this.
    expect(grossAtHalf / estimate).toBeGreaterThan(1.25)
  })

  it('stays accurate at an amount far below the one it was fitted to', () => {
    const model = fit(largeTrade.quote, largeTrade.input)
    const estimate = getSwapPayoutEstimate({ amount: 0.01, model })

    // At 1/50th the size the liquidity fee is negligible, so the true payout is
    // very close to gross less the flat outbound fee.
    const truth = 0.01 * 0.03125 - 0.0000166

    expect(Math.abs(estimate / truth - 1)).toBeLessThan(0.01)

    // Carrying the large trade's whole fee over as a flat cost — the model this
    // replaces — would have understated the same payout by more than 15%.
    const flatCarryOver = 0.01 * 0.03125 - (0.5 * 0.03125 - 0.01556153)
    expect(1 - flatCarryOver / truth).toBeGreaterThan(0.15)
  })

  it('never renders a payout below zero', () => {
    expect(
      getSwapPayoutEstimate({
        amount: 0.0000001,
        model: fit(smallTrade.quote, smallTrade.input),
      })
    ).toBe(0)
  })
})
