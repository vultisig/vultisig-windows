import { SwapDiscount } from '@vultisig/core-chain/swap/discount/SwapDiscount'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { ReactNode } from 'react'

import { currentProductBrand } from '../../../../product/brand'
import {
  getReferralDiscountSavingBps,
  getSwapDiscountSaving,
  getVultDiscountSavingBps,
  SwapAffiliateBps,
} from '../../affiliate/affiliateBps'
import { ReferralDiscountRow } from './ReferralDiscountRow'
import { SwapFeeRowRenderer } from './swapFeeRow'
import { VultDiscountRow } from './VultDiscountRow'

type SwapDiscountInfoProps = {
  renderRow: SwapFeeRowRenderer
  discounts: SwapDiscount[]
  /** Fee the product actually charged, used to value each discount. */
  affiliate: SwapFee | undefined
  /** Fallback basis when the provider itemized no fee to value against. */
  notional: SwapFee | undefined
  affiliateBps: SwapAffiliateBps
}

/**
 * Discount rows, emitted as siblings of the fee rows through the same row
 * renderer so they share the surrounding surface's row treatment.
 */
export const SwapDiscountInfo = ({
  renderRow,
  discounts,
  affiliate,
  notional,
  affiliateBps,
}: SwapDiscountInfoProps) => {
  const visibleDiscounts =
    currentProductBrand === 'station'
      ? discounts.filter(discount => !('vult' in discount))
      : discounts

  const getSaving = (savingBps: number) =>
    getSwapDiscountSaving({
      affiliate,
      notional,
      productBps: affiliateBps.product,
      savingBps,
    })

  return (
    <>
      {visibleDiscounts.map((discount, index) =>
        matchRecordUnion<SwapDiscount, ReactNode>(discount, {
          vult: ({ tier }) => (
            <VultDiscountRow
              key={index}
              renderRow={renderRow}
              tier={tier}
              saving={getSaving(getVultDiscountSavingBps(tier))}
            />
          ),
          referral: () => (
            <ReferralDiscountRow
              key={index}
              renderRow={renderRow}
              saving={getSaving(getReferralDiscountSavingBps())}
            />
          ),
        })
      )}
    </>
  )
}
