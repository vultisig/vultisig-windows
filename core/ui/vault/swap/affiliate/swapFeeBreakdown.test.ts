import { Chain } from '@vultisig/core-chain/Chain'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { SwapDiscount } from '@vultisig/core-chain/swap/discount/SwapDiscount'
import { SwapQuoteResult } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { describe, expect, it } from 'vitest'

import { getSwapFeeEntries, resolveSwapFees } from '../queries/resolveSwapFees'
import {
  getSwapFeeDisclosure,
  getSwapListRateFee,
  getSwapQuoteAffiliateBps,
} from './affiliateBps'

const bpsPerUnit = 10_000n
const listBps = 50n

const toCoinKey: CoinKey = { chain: Chain.Ethereum }

const network: SwapFee = { chain: Chain.Ethereum, amount: 21_000n, decimals: 8 }

/** Payout the swap would produce before any affiliate takes a cut. */
const grossPayout = 1_000_000_000n
const outbound = 2_000_000n

const vultDiscount = (tier: VultDiscountTier): SwapDiscount => ({
  vult: { tier },
})
const referralDiscount: SwapDiscount = { referral: {} }

/**
 * Stands in for THORChain: charges exactly the bps the request asked for and
 * reports the combined affiliate take the way a real quote does, so the
 * displayed rows are checked against the money rather than against themselves.
 */
const quoteCharging = (chargedBps: number): SwapQuoteResult => {
  const affiliate = (grossPayout * BigInt(chargedBps)) / bpsPerUnit

  return {
    native: {
      swapChain: Chain.THORChain,
      expected_amount_out: (grossPayout - affiliate).toString(),
      expiry: 0,
      fees: {
        affiliate: affiliate.toString(),
        asset: '0',
        outbound: outbound.toString(),
        total: (affiliate + outbound).toString(),
      },
      memo: '',
      notes: '',
      outbound_delay_blocks: 0,
      outbound_delay_seconds: 0,
      recommended_min_amount_in: '0',
      warning: '',
    },
  }
}

/** The whole display path, from a quote's discounts to the rows on screen. */
const breakdownFor = (discounts: SwapDiscount[]) => {
  const affiliateBps = getSwapQuoteAffiliateBps(discounts)
  const disclosure = getSwapFeeDisclosure(discounts)
  const fees = resolveSwapFees({
    quote: quoteCharging(disclosure.chargedBps),
    network,
    toCoinKey,
    toCoin: undefined,
    fromCoin: undefined,
    affiliateBps,
  })

  const listRateFee = getSwapListRateFee({
    affiliate: fees.affiliate,
    referral: fees.referral,
    notional: fees.affiliateNotional,
    disclosure,
  })

  return {
    disclosure,
    fees,
    // Every case here charges a real, itemized affiliate fee, so a row without
    // an amount would be the bug rather than a branch worth tolerating.
    listRateFee: shouldBePresent(listRateFee, 'list rate fee'),
    affiliate: shouldBePresent(fees.affiliate, 'affiliate fee'),
  }
}

const tiers: VultDiscountTier[] = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'ultimate',
]

/** Every discount combination a THORChain quote can carry. */
const discountCases: [string, SwapDiscount[]][] = [
  ['no discount', []],
  ['referral alone', [referralDiscount]],
  ...tiers.flatMap((tier): [string, SwapDiscount[]][] => [
    [tier, [vultDiscount(tier)]],
    [`${tier} + referral`, [vultDiscount(tier), referralDiscount]],
  ]),
]

describe('swap fee breakdown', () => {
  describe.each(discountCases)('%s', (_, discounts) => {
    const { disclosure, fees, listRateFee, affiliate } = breakdownFor(discounts)

    it('quotes the undiscounted list price on the fee row', () => {
      // 0.50% of the swap, whatever the tier — the row states the price, and
      // the discounts below state what comes off it.
      expect(disclosure.listBps).toBe(50)
      expect(listRateFee.amount).toBe((grossPayout * listBps) / bpsPerUnit)
    })

    it('adds the expanded rows back up to what was charged', () => {
      const saved = disclosure.savings.reduce(
        (total, { bps }) =>
          total +
          (listRateFee.amount * BigInt(bps)) / BigInt(disclosure.listBps),
        0n
      )

      expect(listRateFee.amount - saved).toBe(
        (grossPayout * BigInt(disclosure.chargedBps)) / bpsPerUnit
      )
    })

    it('charges the referrer inside the list rate rather than beside it', () => {
      // Both cuts come out of the one rate the row states, so a referral must
      // not add a charge on top of it.
      const charged = affiliate.amount + (fees.referral?.amount ?? 0n)

      expect(charged).toBe(
        (grossPayout * BigInt(disclosure.chargedBps)) / bpsPerUnit
      )
    })

    it('keeps the total on the net charges, untouched by the list rate', () => {
      const total = getSwapFeeEntries(fees).reduce(
        (sum, { amount }) => sum + amount,
        0n
      )

      expect(total).toBe(
        network.amount +
          (grossPayout * BigInt(disclosure.chargedBps)) / bpsPerUnit +
          outbound
      )
      // The discount is real money off the bill, not just a line of text.
      expect(total).toBeLessThanOrEqual(
        network.amount + (grossPayout * listBps) / bpsPerUnit + outbound
      )
    })
  })

  it('reports no amount when the provider bakes its fee into the quoted rate', () => {
    const disclosure = getSwapFeeDisclosure([])
    const fees = resolveSwapFees({
      quote: {
        general: {
          dstAmount: grossPayout.toString(),
          provider: 'swapkit',
          tx: { transfer: { amount: 0n, memo: '', to: '' } },
        },
      },
      network,
      toCoinKey,
      toCoin: undefined,
      fromCoin: undefined,
      affiliateBps: getSwapQuoteAffiliateBps([]),
    })

    // Inventing an amount here would disclose a charge the quote never made,
    // so the row falls back to naming the rate the fee is folded into.
    expect(
      getSwapListRateFee({
        affiliate: fees.affiliate,
        referral: fees.referral,
        notional: fees.affiliateNotional,
        disclosure,
      })
    ).toBeUndefined()
  })
})
