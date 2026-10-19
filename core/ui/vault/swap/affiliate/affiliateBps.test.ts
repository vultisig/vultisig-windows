import { Chain } from '@vultisig/core-chain/Chain'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { SwapDiscount } from '@vultisig/core-chain/swap/discount/SwapDiscount'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { describe, expect, it } from 'vitest'

import {
  formatAffiliateBpsPercent,
  getSwapFeeDisclosure,
  getSwapListRateBreakdown,
  getSwapQuoteAffiliateBps,
  SwapListRateBreakdown,
} from './affiliateBps'

const vultDiscount = (tier: VultDiscountTier): SwapDiscount => ({
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

describe('getSwapFeeDisclosure', () => {
  it('quotes the list rate and itemizes nothing when no discount applies', () => {
    expect(getSwapFeeDisclosure([])).toEqual({
      listBps: 50,
      chargedBps: 50,
      savings: [],
    })
  })

  it('keeps the list rate on the fee row and states the tier as its own saving', () => {
    expect(getSwapFeeDisclosure([vultDiscount('gold')])).toEqual({
      listBps: 50,
      chargedBps: 30,
      savings: [{ discount: vultDiscount('gold'), bps: 20 }],
    })
  })

  it('reports a referral as the gap between the base rate and what was charged', () => {
    expect(getSwapFeeDisclosure([referralDiscount])).toEqual({
      listBps: 50,
      chargedBps: 45,
      savings: [{ discount: referralDiscount, bps: 5 }],
    })
  })

  it('itemizes a tier and a referral separately under one list rate', () => {
    expect(
      getSwapFeeDisclosure([vultDiscount('gold'), referralDiscount])
    ).toEqual({
      listBps: 50,
      chargedBps: 25,
      savings: [
        { discount: vultDiscount('gold'), bps: 20 },
        { discount: referralDiscount, bps: 5 },
      ],
    })
  })

  it('states a full waiver as the whole list rate coming off', () => {
    expect(getSwapFeeDisclosure([vultDiscount('ultimate')])).toEqual({
      listBps: 50,
      chargedBps: 0,
      savings: [{ discount: vultDiscount('ultimate'), bps: 50 }],
    })
  })

  it('claims for a tier only what the referrer left it to waive', () => {
    // The referrer still takes 10 bps, so the top tier's nominal 50 cannot all
    // be waived — it claims 35, the referral 5, and the rows still reconcile.
    expect(
      getSwapFeeDisclosure([vultDiscount('ultimate'), referralDiscount])
    ).toEqual({
      listBps: 50,
      chargedBps: 10,
      savings: [
        { discount: vultDiscount('ultimate'), bps: 35 },
        { discount: referralDiscount, bps: 5 },
      ],
    })
  })

  it('reconciles the rows against the charged rate for every tier', () => {
    const tiers: VultDiscountTier[] = [
      'bronze',
      'silver',
      'gold',
      'platinum',
      'diamond',
      'ultimate',
    ]

    tiers.forEach(tier => {
      ;[[vultDiscount(tier)], [vultDiscount(tier), referralDiscount]].forEach(
        discounts => {
          const { listBps, chargedBps, savings } =
            getSwapFeeDisclosure(discounts)
          const waived = savings.reduce((total, { bps }) => total + bps, 0)

          expect(listBps).toBe(50)
          expect(chargedBps + waived).toBe(listBps)
        }
      )
    })
  })
})

describe('getSwapListRateBreakdown', () => {
  const disclosure = getSwapFeeDisclosure([vultDiscount('gold')])
  const referredDisclosure = getSwapFeeDisclosure([
    vultDiscount('gold'),
    referralDiscount,
  ])

  // 300 charged at 30 bps puts the 50 bps list rate at 500.
  const affiliate: SwapFee = {
    chain: Chain.Ethereum,
    amount: 300n,
    decimals: 8,
  }

  // 1_000_000 of output at 50 bps is worth 5_000.
  const notional: SwapFee = {
    chain: Chain.Ethereum,
    amount: 1_000_000n,
    decimals: 8,
  }

  const savingAmounts = (breakdown: SwapListRateBreakdown | undefined) =>
    breakdown?.savings.map(({ fee }) => fee.amount)

  it('scales the charged fee up to the list rate', () => {
    const breakdown = getSwapListRateBreakdown({
      affiliate,
      referral: undefined,
      notional,
      disclosure,
    })

    expect(breakdown?.listRateFee).toEqual({ ...affiliate, amount: 500n })
    // The 20 bps Gold waives is the 200 between the list rate and the charge.
    expect(savingAmounts(breakdown)).toEqual([200n])
  })

  it('counts the referrer inside the list rate rather than beside it', () => {
    // 150 to the product and 100 to the referrer is the same 25 bps the quote
    // was requested with, so the list rate is still worth 500.
    const breakdown = getSwapListRateBreakdown({
      affiliate: { ...affiliate, amount: 150n },
      referral: { ...affiliate, amount: 100n },
      notional,
      disclosure: referredDisclosure,
    })

    expect(breakdown?.listRateFee).toEqual({ ...affiliate, amount: 500n })
    expect(savingAmounts(breakdown)).toEqual([200n, 50n])
  })

  it('subtracts to the charge exactly when the rate does not divide it', () => {
    // 7 at 25 bps is 14 at the list rate, but the savings round down to 5 and
    // 1 — scaling the list rate on its own would leave the rows one unit over.
    const breakdown = getSwapListRateBreakdown({
      affiliate: { ...affiliate, amount: 7n },
      referral: undefined,
      notional,
      disclosure: referredDisclosure,
    })

    expect(savingAmounts(breakdown)).toEqual([5n, 1n])
    expect(breakdown?.listRateFee.amount).toBe(13n)
  })

  it('charges the list rate against the payout when nothing was charged at all', () => {
    const breakdown = getSwapListRateBreakdown({
      affiliate: { ...affiliate, amount: 0n },
      referral: undefined,
      notional,
      disclosure: getSwapFeeDisclosure([vultDiscount('ultimate')]),
    })

    expect(breakdown?.listRateFee).toEqual({ ...notional, amount: 5_000n })
    expect(savingAmounts(breakdown)).toEqual([5_000n])
  })

  it('values a waived fee against the payout when the provider omits the zero', () => {
    // SwapKit and LI.FI drop a zero affiliate fee instead of itemizing it. The
    // bps sent still prove nothing was charged, so the waiver is priced rather
    // than reported as a fee hidden in the rate.
    const breakdown = getSwapListRateBreakdown({
      affiliate: undefined,
      referral: undefined,
      notional,
      disclosure: getSwapFeeDisclosure([vultDiscount('ultimate')]),
    })

    expect(breakdown?.listRateFee).toEqual({ ...notional, amount: 5_000n })
    expect(savingAmounts(breakdown)).toEqual([5_000n])
  })

  it('reports nothing when the provider bakes its fee into the quoted rate', () => {
    // Inventing an amount here would disclose a charge the quote never made.
    expect(
      getSwapListRateBreakdown({
        affiliate: undefined,
        referral: undefined,
        notional,
        disclosure,
      })
    ).toBeUndefined()
  })

  it('reports nothing when neither the fee nor the payout is known', () => {
    expect(
      getSwapListRateBreakdown({
        affiliate: { ...affiliate, amount: 0n },
        referral: undefined,
        notional: undefined,
        disclosure: getSwapFeeDisclosure([vultDiscount('ultimate')]),
      })
    ).toBeUndefined()
  })
})
