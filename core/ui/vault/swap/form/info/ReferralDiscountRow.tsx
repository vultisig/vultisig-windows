import { MegaphoneIcon } from '@lib/ui/icons/MegaphoneIcon'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { formatAffiliateBpsPercent } from '../../affiliate/affiliateBps'
import { DiscountLabel } from './DiscountLabel'
import { SwapFeeRowRenderer } from './swapFeeRow'

const StyledMegaphoneIcon = styled(MegaphoneIcon)`
  color: ${getColor('primaryAccentFour')};
`

type ReferralDiscountRowProps = {
  renderRow: SwapFeeRowRenderer
  /** Rate the referral takes off the list rate, in basis points. */
  bps: number
}

/**
 * Reports a friend referral as the share of the swap it waives. The referrer's
 * own cut is not a row of its own — it is charged inside the list rate stated
 * above, so only the user's saving belongs in the breakdown.
 */
export const ReferralDiscountRow = ({
  renderRow,
  bps,
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
        value: null,
      })}
    </>
  )
}
