import { Chain } from '@vultisig/core-chain/Chain'
import { SwapDiscount } from '@vultisig/core-chain/swap/discount/SwapDiscount'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { describe, expect, it } from 'vitest'

import {
  formatAffiliateBpsPercent,
  getReferralDiscountSavingBps,
  getSwapDiscountSaving,
  getSwapQuoteAffiliateBps,
} from './affiliateBps'

const vultDiscount = (tier: 'gold' | 'ultimate'): SwapDiscount => ({
  vult: { tier },
})
const referralDiscount: SwapDiscount = { referral: {} }

describe('getSwapQuoteAffiliateBps', () => {
  it('charges the base rate when no discount applies', () => {
    expect(getSwapQuoteAffiliateBps([])).toEqual({ product: 50, referral: 0 })
  })

  it('drops the product rate by the tier discount', () => {
    expect(getSwapQuoteAffiliateBps([vultDiscount('gold')])).toEqual({
      product: 30,
      referral: 0,
    })
  })

  it('waives the product rate entirely at the top tier', () => {
    expect(getSwapQuoteAffiliateBps([vultDiscount('ultimate')])).toEqual({
      product: 0,
      referral: 0,
    })
  })

  it('splits the rate with a referrer, charging less in total than the base rate', () => {
    const { product, referral } = getSwapQuoteAffiliateBps([referralDiscount])

    expect({ product, referral }).toEqual({ product: 35, referral: 10 })
    // 45 bps charged against a 50 bps base — the 5 bps gap is the user's saving.
    expect(product + referral).toBeLessThan(50)
  })

  it('stacks a tier discount on top of a referral split', () => {
    expect(
      getSwapQuoteAffiliateBps([vultDiscount('gold'), referralDiscount])
    ).toEqual({ product: 15, referral: 10 })
  })

  it('never charges a negative rate when the discount outruns the referral floor', () => {
    const { product } = getSwapQuoteAffiliateBps([
      vultDiscount('ultimate'),
      referralDiscount,
    ])

    expect(product).toBe(0)
  })
})

describe('getReferralDiscountSavingBps', () => {
  it('reports the gap between the base rate and what a referral swap charges', () => {
    const { product, referral } = getSwapQuoteAffiliateBps([referralDiscount])

    expect(getReferralDiscountSavingBps()).toBe(50 - (product + referral))
  })
})

describe('formatAffiliateBpsPercent', () => {
  it('renders basis points as a two-decimal percentage', () => {
    expect(formatAffiliateBpsPercent(50)).toBe('0.50%')
    expect(formatAffiliateBpsPercent(30)).toBe('0.30%')
    expect(formatAffiliateBpsPercent(5)).toBe('0.05%')
  })

  it('renders a fully waived rate rather than hiding it', () => {
    expect(formatAffiliateBpsPercent(0)).toBe('0.00%')
  })
})

describe('getSwapDiscountSaving', () => {
  const affiliate: SwapFee = {
    chain: Chain.Ethereum,
    amount: 300n,
    decimals: 8,
  }

  // 1_000_000 of output at 20 bps is worth 2_000.
  const notional: SwapFee = {
    chain: Chain.Ethereum,
    amount: 1_000_000n,
    decimals: 8,
  }

  it('scales the charged fee by the waived share of the rate', () => {
    // 300 charged at 30 bps means 20 bps were worth 200.
    expect(
      getSwapDiscountSaving({
        affiliate,
        notional,
        productBps: 30,
        savingBps: 20,
      })
    ).toEqual({ ...affiliate, amount: 200n })
  })

  it('charges the waived rate against the payout when the fee was never itemized', () => {
    // A provider that bakes its fee into the quoted rate still waived a real
    // amount; the row reports it rather than rendering blank.
    expect(
      getSwapDiscountSaving({
        affiliate: undefined,
        notional,
        productBps: 30,
        savingBps: 20,
      })
    ).toEqual({ ...notional, amount: 2_000n })
  })

  it('values a discount that waived the rate entirely', () => {
    // Nothing was charged, so there is no fee left to scale from — the full
    // 50 bps still came off the payout.
    expect(
      getSwapDiscountSaving({
        affiliate,
        notional,
        productBps: 0,
        savingBps: 50,
      })
    ).toEqual({ ...notional, amount: 5_000n })
  })

  it('reports nothing only when neither the fee nor the payout is known', () => {
    expect(
      getSwapDiscountSaving({
        affiliate: undefined,
        notional: undefined,
        productBps: 30,
        savingBps: 20,
      })
    ).toBeUndefined()
  })

  it('reports nothing when no rate was waived at all', () => {
    expect(
      getSwapDiscountSaving({
        affiliate,
        notional,
        productBps: 50,
        savingBps: 0,
      })
    ).toBeUndefined()
  })
})
