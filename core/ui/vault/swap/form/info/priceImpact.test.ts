import { Chain } from '@vultisig/core-chain/Chain'
import { SwapQuoteResult } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { describe, expect, it } from 'vitest'

import { formatPriceImpact, getSwapPriceImpact } from './priceImpact'

const nativeQuote = (slippageBps: number | undefined): SwapQuoteResult => ({
  native: {
    swapChain: Chain.THORChain,
    expected_amount_out: '1000000',
    expiry: 0,
    fees: {
      affiliate: '0',
      asset: 'ETH.ETH',
      outbound: '0',
      total: '0',
      // The fee total in bps sits right next to slippage on the wire; the row
      // used to read this one, reporting fees as price impact.
      total_bps: 999,
    },
    memo: '',
    notes: '',
    outbound_delay_blocks: 0,
    outbound_delay_seconds: 0,
    recommended_min_amount_in: '0',
    slippage_bps: slippageBps,
    warning: '',
  },
})

const generalQuote = (
  priceImpactFraction: number | undefined
): SwapQuoteResult => ({
  general: {
    dstAmount: '1000000',
    provider: 'swapkit',
    ...(priceImpactFraction === undefined ? {} : { priceImpactFraction }),
    tx: { transfer: { to: 'deposit-address', amount: 1000n } },
  },
})

describe('getSwapPriceImpact', () => {
  it('reads a native quote from its slippage, never its total fee bps', () => {
    expect(getSwapPriceImpact(nativeQuote(133))).toBeCloseTo(0.0133, 10)
  })

  it('reads a general quote from the impact its provider published', () => {
    expect(getSwapPriceImpact(generalQuote(-0.0039))).toBe(-0.0039)
  })

  it('reports nothing when the provider publishes no impact', () => {
    expect(getSwapPriceImpact(generalQuote(undefined))).toBeUndefined()
    expect(getSwapPriceImpact(nativeQuote(undefined))).toBeUndefined()
  })
})

describe('formatPriceImpact', () => {
  it('shows a swap that costs the user output as a negative percentage', () => {
    expect(formatPriceImpact(0.0133)).toEqual({
      percent: '-1.33%',
      // Past the -1% band, so a 1.33% cost is no longer "good".
      level: 'average',
    })
  })

  it('keeps a small cost inside the good band', () => {
    expect(formatPriceImpact(0.005)).toEqual({
      percent: '-0.50%',
      level: 'good',
    })
  })

  it('shows a favorable swap as an explicitly positive percentage', () => {
    expect(formatPriceImpact(-0.0039)).toEqual({
      percent: '+0.39%',
      level: 'good',
    })
  })

  it('grades impact on the iOS bands', () => {
    expect(formatPriceImpact(0.02)?.level).toBe('average')
    expect(formatPriceImpact(0.05)?.level).toBe('high')
  })

  it('keeps the band boundaries exclusive, matching iOS', () => {
    // Exactly -1% is no longer "good"; exactly -3% is no longer "average".
    expect(formatPriceImpact(0.01)?.level).toBe('average')
    expect(formatPriceImpact(0.03)?.level).toBe('high')
  })

  it('renders nothing when there is no impact to report', () => {
    expect(formatPriceImpact(undefined)).toBeUndefined()
  })
})
