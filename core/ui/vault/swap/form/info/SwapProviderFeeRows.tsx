import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { useTranslation } from 'react-i18next'

import { currentProductBrandConfig } from '../../../../product/brand'
import {
  formatFeeRateLabel,
  SwapAffiliateBps,
} from '../../affiliate/affiliateBps'
import { SwapProviderFees } from '../../queries/resolveSwapFees'
import { SwapFeeRowRenderer } from './swapFeeRow'
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

type SwapAffiliateFeeValueProps = {
  fee: SwapFee | undefined
  bps: number
}

const SwapAffiliateFeeValue = ({ fee, bps }: SwapAffiliateFeeValueProps) => {
  const { t } = useTranslation()

  // A fully waived rate costs the user nothing whether or not the provider
  // itemizes it, so the waiver wins over the included-in-rate wording.
  if (bps === 0) {
    return <>{t('complete_fee_waive')}</>
  }

  return fee ? (
    <SwapFeeFiatValue value={[fee]} />
  ) : (
    <>{t('swap_fee_included_in_rate')}</>
  )
}

type SwapProviderFeeRowsProps = {
  renderRow: SwapFeeRowRenderer
  fees: SwapProviderFees
  affiliateBps: SwapAffiliateBps
}

/**
 * The provider-side fee rows, one per recipient of the money.
 *
 * The affiliate row always renders — including at a fully discounted rate — so
 * the product's cut is disclosed on every route rather than only where it
 * happens to be non-zero. Providers that bake the fee into the quoted rate
 * still get the row, carrying the percentage in place of an amount.
 */
export const SwapProviderFeeRows = ({
  renderRow,
  fees: { affiliate, referral, protocol },
  affiliateBps: { product, referral: referralBps },
}: SwapProviderFeeRowsProps) => {
  const { t } = useTranslation()

  return (
    <>
      {renderRow({
        // Named after the product, as iOS is: this row is the one claim the
        // user can hold us to, so it carries our name and only our money.
        //
        // The brand is composed here rather than interpolated into the label,
        // because machine translation collapses "{{brand}} Fee" to the bare
        // brand in some locales. It reuses the existing `swap_fee` noun rather
        // than a bespoke one for the same reason: translated in isolation, a
        // bare "Fee" came back as "Payment" in Russian, leaving the row that
        // carries our name unable to say what it charges.
        label: formatFeeRateLabel({
          name: `${currentProductBrandConfig.name} ${t('swap_fee')}`,
          bps: product,
        }),
        value: <SwapAffiliateFeeValue fee={affiliate} bps={product} />,
      })}
      {referral && referralBps > 0
        ? renderRow({
            label: formatFeeRateLabel({
              name: t('swap_referral_fee'),
              bps: referralBps,
            }),
            value: <SwapFeeFiatValue value={[referral]} />,
          })
        : null}
      {protocol
        ? renderRow({
            label: t('swap_protocol_fee'),
            value: <SwapFeeFiatValue value={[protocol]} />,
          })
        : null}
    </>
  )
}
