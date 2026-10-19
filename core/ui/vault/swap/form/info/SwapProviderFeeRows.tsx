import { isEmpty } from '@vultisig/lib-utils/array/isEmpty'
import { useTranslation } from 'react-i18next'

import { currentProductBrandConfig } from '../../../../product/brand'
import {
  formatFeeRateLabel,
  getSwapListRateBreakdown,
  SwapFeeDisclosure,
} from '../../affiliate/affiliateBps'
import { SwapProviderFees } from '../../queries/resolveSwapFees'
import { SwapDiscountInfo } from './SwapDiscountInfo'
import { SwapFeeRowRenderer } from './swapFeeRow'
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

type SwapProviderFeeRowsProps = {
  renderRow: SwapFeeRowRenderer
  fees: SwapProviderFees
  disclosure: SwapFeeDisclosure
}

/**
 * The provider-side fee rows, one per recipient of the money, followed by the
 * discounts that came off the product's cut.
 *
 * The affiliate row always renders — including at a fully discounted rate — so
 * the product's cut is disclosed on every route rather than only where it
 * happens to be non-zero. It quotes the list rate and the undiscounted amount;
 * each discount below it states the money it takes off, so the rows subtract
 * to what was charged and a reduction is never counted twice. Both are priced
 * here from one breakdown, so neither can be read off a different base.
 *
 * A fee folded into the quoted rate has no amount to take a discount off. A
 * discounted one there itemizes nothing and states no rate, as Android does: a
 * discount row would subtract from nothing, and the list rate alone would claim
 * more than was charged. Undiscounted, the list rate is what was charged.
 *
 * The referrer's share has no row of its own: it is part of the same list rate,
 * and billing it separately would make the expanded rows overshoot the total.
 */
export const SwapProviderFeeRows = ({
  renderRow,
  fees: { affiliate, referral, protocol, affiliateNotional },
  disclosure,
}: SwapProviderFeeRowsProps) => {
  const { t } = useTranslation()

  const breakdown = getSwapListRateBreakdown({
    affiliate,
    referral,
    notional: affiliateNotional,
    disclosure,
  })

  // Named after the product, as iOS is: this row is the one claim the user can
  // hold us to, so it carries our name and only our money.
  //
  // The brand is composed here rather than interpolated into the label, because
  // machine translation collapses "{{brand}} Fee" to the bare brand in some
  // locales. It reuses the existing `swap_fee` noun rather than a bespoke one
  // for the same reason: translated in isolation, a bare "Fee" came back as
  // "Payment" in Russian, leaving the row that carries our name unable to say
  // what it charges.
  const name = `${currentProductBrandConfig.name} ${t('swap_fee')}`

  // A route that charges nothing at all must not advertise a rate it never
  // applied, so it keeps the bare name against its zero — as does a discounted
  // fee folded into the rate, whose list rate nothing below brings down.
  const isRateStated = breakdown
    ? breakdown.listRateFee.amount > 0n
    : isEmpty(disclosure.savings)

  return (
    <>
      {renderRow({
        label: isRateStated
          ? formatFeeRateLabel({ name, bps: disclosure.listBps })
          : name,
        value: breakdown ? (
          <SwapFeeFiatValue value={[breakdown.listRateFee]} />
        ) : (
          <>{t('swap_fee_included_in_rate')}</>
        ),
      })}
      {protocol
        ? renderRow({
            label: t('swap_protocol_fee'),
            value: <SwapFeeFiatValue value={[protocol]} />,
          })
        : null}
      {breakdown && (
        <SwapDiscountInfo renderRow={renderRow} savings={breakdown.savings} />
      )}
    </>
  )
}
