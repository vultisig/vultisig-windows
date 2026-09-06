import { useTranslation } from 'react-i18next'

import { currentProductBrandConfig } from '../../../../product/brand'
import {
  formatFeeRateLabel,
  getSwapListRateFee,
  SwapFeeDisclosure,
} from '../../affiliate/affiliateBps'
import { SwapProviderFees } from '../../queries/resolveSwapFees'
import { SwapFeeRowRenderer } from './swapFeeRow'
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

type SwapProviderFeeRowsProps = {
  renderRow: SwapFeeRowRenderer
  fees: SwapProviderFees
  disclosure: SwapFeeDisclosure
}

/**
 * The provider-side fee rows, one per recipient of the money.
 *
 * The affiliate row always renders — including at a fully discounted rate — so
 * the product's cut is disclosed on every route rather than only where it
 * happens to be non-zero. It quotes the list rate and the undiscounted amount;
 * the discounts that bring it down to what was charged are itemized below by
 * `SwapDiscountInfo`, so a reduction is never counted twice.
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

  const listRateFee = getSwapListRateFee({
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

  return (
    <>
      {renderRow({
        // A route that charges nothing at all must not advertise a rate it
        // never applied, so it keeps the bare name against its zero.
        label:
          listRateFee?.amount === 0n
            ? name
            : formatFeeRateLabel({ name, bps: disclosure.listBps }),
        value: listRateFee ? (
          <SwapFeeFiatValue value={[listRateFee]} />
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
    </>
  )
}
