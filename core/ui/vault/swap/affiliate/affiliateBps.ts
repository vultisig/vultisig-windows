import { getSwapAffiliateBps } from '@vultisig/core-chain/swap/affiliate'
import {
  baseAffiliateBps,
  VultDiscountTier,
  vultDiscountTierBps,
} from '@vultisig/core-chain/swap/affiliate/config'
import { SwapDiscount } from '@vultisig/core-chain/swap/discount/SwapDiscount'
import { nativeSwapAffiliateConfig } from '@vultisig/core-chain/swap/native/nativeSwapAffiliateConfig'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'

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

/** Basis points a VULT tier takes off the base affiliate rate. */
export const getVultDiscountSavingBps = (tier: VultDiscountTier): number =>
  vultDiscountTierBps[tier]

/**
 * Basis points a friend referral takes off the base affiliate rate. Applying a
 * referral moves `referrerFeeRateBps` to the referrer and drops the product's
 * own share to `referralDiscountAffiliateFeeRateBps`, so the swap costs less in
 * total than the undiscounted base rate — that difference is the user's saving.
 */
export const getReferralDiscountSavingBps = (): number => {
  const { referrerFeeRateBps, referralDiscountAffiliateFeeRateBps } =
    currentNativeSwapAffiliateConfig

  return Math.max(
    0,
    baseAffiliateBps - referralDiscountAffiliateFeeRateBps - referrerFeeRateBps
  )
}

type GetSwapDiscountSavingInput = {
  affiliate: SwapFee | undefined
  /** Output the rate is charged on; see `SwapProviderFees.affiliateNotional`. */
  notional: SwapFee | undefined
  productBps: number
  savingBps: number
}

/**
 * Values a discount in the coin the affiliate fee is charged in.
 *
 * Preferred form scales the fee actually charged by the share of the rate that
 * was waived — exact, and free of any second guess at the notional. That fails
 * on two routes: one where the provider bakes its fee into the quoted rate and
 * itemizes nothing, and one already discounted to zero, where no fee remains to
 * scale from. Both still waived a real amount, so they fall back to charging
 * the waived rate against the payout rather than leaving the row blank.
 */
export const getSwapDiscountSaving = ({
  affiliate,
  notional,
  productBps,
  savingBps,
}: GetSwapDiscountSavingInput): SwapFee | undefined => {
  if (savingBps <= 0) {
    return undefined
  }

  if (affiliate && productBps > 0) {
    return {
      ...affiliate,
      amount: (affiliate.amount * BigInt(savingBps)) / BigInt(productBps),
    }
  }

  return notional
    ? {
        ...notional,
        amount: (notional.amount * BigInt(savingBps)) / BigInt(bpsPerUnit),
      }
    : undefined
}
