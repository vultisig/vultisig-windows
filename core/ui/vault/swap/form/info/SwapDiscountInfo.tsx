import { SwapDiscount } from '@vultisig/core-chain/swap/discount/SwapDiscount'
import { isEmpty } from '@vultisig/lib-utils/array/isEmpty'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { SwapDiscountSaving } from '../../affiliate/affiliateBps'
import { ReferralDiscountRow } from './ReferralDiscountRow'
import { SwapFeeRowRenderer } from './swapFeeRow'
import { VultDiscountRow } from './VultDiscountRow'

type SwapDiscountInfoProps = {
  renderRow: SwapFeeRowRenderer
  savings: SwapDiscountSaving[]
}

/**
 * The discounts that bring the list rate above down to what the swap was
 * charged, under a heading of their own so they read as reductions rather than
 * as further fees.
 *
 * Emitted as siblings of the fee rows through the same row renderer so they
 * share the surrounding surface's row treatment.
 */
export const SwapDiscountInfo = ({
  renderRow,
  savings,
}: SwapDiscountInfoProps) => {
  const { t } = useTranslation()

  if (isEmpty(savings)) {
    return null
  }

  return (
    <>
      {renderRow({ label: t('swap_applied_discounts'), value: null })}
      {savings.map(({ discount, bps }, index) =>
        matchRecordUnion<SwapDiscount, ReactNode>(discount, {
          vult: ({ tier }) => (
            <VultDiscountRow
              key={index}
              renderRow={renderRow}
              tier={tier}
              bps={bps}
            />
          ),
          referral: () => (
            <ReferralDiscountRow key={index} renderRow={renderRow} bps={bps} />
          ),
        })
      )}
    </>
  )
}
