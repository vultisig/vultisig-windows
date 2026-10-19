import { getSwapAffiliateBps } from '@vultisig/core-chain/swap/affiliate'
import {
  baseAffiliateBps,
  VultDiscountTier,
} from '@vultisig/core-chain/swap/affiliate/config'
import { SwapDiscount } from '@vultisig/core-chain/swap/discount/SwapDiscount'
import { nativeSwapAffiliateConfig } from '@vultisig/core-chain/swap/native/nativeSwapAffiliateConfig'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { sum } from '@vultisig/lib-utils/array/sum'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

import { currentProductBrand } from '../../../product/brand'
import { stationSwapAffiliateConfig } from './stationSwapAffiliateConfig'

// Mirrors the branch `buildSwapQuoteInput` takes. Every percentage the fee rows
// disclose has to come from the same config the quote request was built with,
// or the rate shown to the user drifts from the rate actually charged.
const currentNativeSwapAffiliateConfig =
  currentProductBrand === 'station'
    ? stationSwapAffiliateConfig.native
    : nativeSwapAffiliateConfig

const percentFractionDigits = 2
const bpsPerUnit = 10_000

/** How a quote's affiliate bps are split between the product and a referrer. */
export type SwapAffiliateBps = {
  /** bps the product's own affiliate account receives. */
  product: number
  /** bps routed to a friend referral; 0 when no referral applies. */
  referral: number
}

/**
 * Splits the affiliate bps a quote was requested with into the product's share
 * and the referrer's share, reproducing the arithmetic `buildAffiliateParams`
 * uses to build `affiliate_bps`.
 *
 * The split is derived, never transported: the discounts carried on the quote
 * plus the brand's affiliate config are exactly what determined the bps sent to
 * the provider, so no extra field is needed to disclose the rate. Referral
 * discounts only ever reach this function on THORChain routes, which is the
 * only place the provider honours a multi-affiliate split.
 */
export const getSwapQuoteAffiliateBps = (
  discounts: SwapDiscount[]
): SwapAffiliateBps => {
  const tier = discounts.reduce<VultDiscountTier | null>(
    (result, discount) => ('vult' in discount ? discount.vult.tier : result),
    null
  )
  const affiliateBps = getSwapAffiliateBps(tier)

  if (!discounts.some(discount => 'referral' in discount)) {
    return { product: affiliateBps, referral: 0 }
  }

  const { referrerFeeRateBps, referralDiscountAffiliateFeeRateBps } =
    currentNativeSwapAffiliateConfig

  return {
    product: Math.max(
      0,
      affiliateBps - (baseAffiliateBps - referralDiscountAffiliateFeeRateBps)
    ),
    referral: referrerFeeRateBps,
  }
}

/** Renders affiliate basis points as the percentage shown in a fee row title. */
export const formatAffiliateBpsPercent = (bps: number): string =>
  `${(bps / 100).toFixed(percentFractionDigits)}%`

type FormatFeeRateLabelInput = {
  name: string
  bps: number
}

/**
 * Titles a fee row with the rate it charges. Composed here rather than
 * interpolated into the translation so the surrounding punctuation cannot drift
 * per locale.
 */
export const formatFeeRateLabel = ({
  name,
  bps,
}: FormatFeeRateLabelInput): string =>
  `${name} (${formatAffiliateBpsPercent(bps)})`

/**
 * Basis points a friend referral takes off the base affiliate rate. Applying a
 * referral moves `referrerFeeRateBps` to the referrer and drops the product's
 * own share to `referralDiscountAffiliateFeeRateBps`, so the swap costs less in
 * total than the undiscounted base rate — that difference is the user's saving.
 */
const getReferralDiscountSavingBps = (): number => {
  const { referrerFeeRateBps, referralDiscountAffiliateFeeRateBps } =
    currentNativeSwapAffiliateConfig

  return Math.max(
    0,
    baseAffiliateBps - referralDiscountAffiliateFeeRateBps - referrerFeeRateBps
  )
}

/** A discount itemized beneath the swap fee row, with the rate it waives. */
export type SwapDiscountSaving = {
  discount: SwapDiscount
  bps: number
}

/** Every rate the expanded fee breakdown puts on screen. */
export type SwapFeeDisclosure = {
  /** bps the swap fee row is titled with, before the savings listed below it. */
  listBps: number
  /** bps the quote was actually requested with, across every affiliate. */
  chargedBps: number
  /** One entry per discount shown under the fee row, largest concern first. */
  savings: SwapDiscountSaving[]
}

/**
 * Prices a quote's discounts as the rates the breakdown discloses: a list rate
 * on the fee row, and the savings that bring it down to what was charged.
 *
 * Savings are derived from the gap between the base rate and the bps actually
 * requested rather than read off the tier table, so the rows always reconcile
 * with the money. The two differ wherever a tier would waive more than the
 * quote still had left to waive — a referred Ultimate swap keeps 10 bps for the
 * referrer, leaving the tier 35 of its nominal 50 to claim.
 *
 * A discount the brand does not disclose comes off the list rate instead of
 * appearing as a saving, so a hidden row can never break the reconciliation.
 */
export const getSwapFeeDisclosure = (
  discounts: SwapDiscount[]
): SwapFeeDisclosure => {
  const { product, referral } = getSwapQuoteAffiliateBps(discounts)
  const chargedBps = product + referral

  const visibleDiscounts =
    currentProductBrand === 'station'
      ? discounts.filter(discount => !('vult' in discount))
      : discounts

  const waivedBps = Math.max(0, baseAffiliateBps - chargedBps)
  const referralSavingBps = visibleDiscounts.some(
    discount => 'referral' in discount
  )
    ? Math.min(getReferralDiscountSavingBps(), waivedBps)
    : 0

  const savings = visibleDiscounts
    .map(discount => ({
      discount,
      bps: matchRecordUnion<SwapDiscount, number>(discount, {
        vult: () => waivedBps - referralSavingBps,
        referral: () => referralSavingBps,
      }),
    }))
    .filter(({ bps }) => bps > 0)

  return {
    chargedBps,
    listBps: chargedBps + sum(savings.map(({ bps }) => bps)),
    savings,
  }
}

/** A discount priced as the amount it takes off the swap fee row. */
export type PricedSwapDiscountSaving = SwapDiscountSaving & {
  fee: SwapFee
}

/** The swap fee row at the list rate, and what each discount takes off it. */
export type SwapListRateBreakdown = {
  listRateFee: SwapFee
  savings: PricedSwapDiscountSaving[]
}

type GetSwapListRateBreakdownInput = {
  affiliate: SwapFee | undefined
  referral: SwapFee | undefined
  /** Output the rate is charged on; see `SwapProviderFees.affiliateNotional`. */
  notional: SwapFee | undefined
  disclosure: SwapFeeDisclosure
}

/**
 * Values the list rate and every saving in the coin the affiliate fee is
 * charged in, so the fee row can quote the undiscounted price, each discount
 * row the money it takes off, and the total stay net.
 *
 * Preferred form scales what every affiliate was actually charged by each
 * saving's share of it — exact, and free of any second guess at the notional.
 * The list rate is then the charge plus the savings rather than scaled on its
 * own, so the rows subtract to the charge to the last base unit instead of
 * drifting by a rounding.
 *
 * A rate discounted all the way to zero leaves nothing to scale from, so the
 * savings are charged against the payout instead — whether or not the provider
 * itemized the zero. The bps sent already prove nothing was charged, and
 * SwapKit and LI.FI drop a zero affiliate fee from the quote rather than report
 * it; requiring one would tell a fully discounted user that the fee is hidden
 * in the rate.
 *
 * Above zero, a provider that itemizes no affiliate fee gets nothing: its cut
 * is inside the quoted rate, and inventing an amount for it would disclose a
 * charge the quote never made.
 */
export const getSwapListRateBreakdown = ({
  affiliate,
  referral,
  notional,
  disclosure: { chargedBps, savings },
}: GetSwapListRateBreakdownInput): SwapListRateBreakdown | undefined => {
  const chargedFee = affiliate && {
    ...affiliate,
    amount: affiliate.amount + (referral?.amount ?? 0n),
  }

  // `base` is worth `baseBps` of the swap; every saving is a share of it.
  const basis =
    chargedBps > 0
      ? chargedFee && {
          charged: chargedFee,
          base: chargedFee.amount,
          baseBps: chargedBps,
        }
      : notional && {
          charged: { ...notional, amount: 0n },
          base: notional.amount,
          baseBps: bpsPerUnit,
        }

  if (!basis) {
    return undefined
  }

  const { charged, base, baseBps } = basis

  const pricedSavings = savings.map(saving => ({
    ...saving,
    fee: {
      ...charged,
      amount: (base * BigInt(saving.bps)) / BigInt(baseBps),
    },
  }))

  return {
    listRateFee: {
      ...charged,
      amount: pricedSavings.reduce(
        (total, { fee }) => total + fee.amount,
        charged.amount
      ),
    },
    savings: pricedSavings,
  }
}
