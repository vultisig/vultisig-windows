import { MegaphoneIcon } from '@lib/ui/icons/MegaphoneIcon'
import { getColor } from '@lib/ui/theme/getters'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { formatAffiliateBpsPercent } from '../../affiliate/affiliateBps'
import { DiscountLabel } from './DiscountLabel'
import { SwapDiscountAmount } from './SwapDiscountAmount'
import { SwapFeeRowRenderer } from './swapFeeRow'

const StyledMegaphoneIcon = styled(MegaphoneIcon)`
  color: ${getColor('primaryAccentFour')};
`

type ReferralDiscountRowProps = {
  renderRow: SwapFeeRowRenderer
  /** Rate the referral takes off the list rate, in basis points. */
  bps: number
  /** What the referral takes off the fee row above. */
  fee: SwapFee
}

/**
 * Reports a friend referral as the share of the swap it waives, and the money
 * that share takes off the fee row. The referrer's own cut is not a row of its
 * own — it is charged inside the list rate stated above, so only the user's
 * saving belongs in the breakdown.
 */
export const ReferralDiscountRow = ({
  renderRow,
  bps,
  fee,
}: ReferralDiscountRowProps) => {
  const { t } = useTranslation()

  return (
    <>
      {renderRow({
        label: (
          <DiscountLabel icon={<StyledMegaphoneIcon />}>
            {`${t('referrals_default_title')}: ${formatAffiliateBpsPercent(bps)}`}
          </DiscountLabel>
        ),
        value: <SwapDiscountAmount value={fee} />,
      })}
    </>
  )
}
