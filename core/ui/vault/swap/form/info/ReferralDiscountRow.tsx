import { MegaphoneIcon } from '@lib/ui/icons/MegaphoneIcon'
import { getColor } from '@lib/ui/theme/getters'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { getReferralDiscountSavingBps } from '../../affiliate/affiliateBps'
import { DiscountLabel } from './DiscountLabel'
import { SwapFeeRowRenderer } from './swapFeeRow'
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

const StyledMegaphoneIcon = styled(MegaphoneIcon)`
  color: ${getColor('primaryAccentFour')};
`

type ReferralDiscountRowProps = {
  renderRow: SwapFeeRowRenderer
  /** Fee the referral waived, omitted when it cannot be valued from the quote. */
  saving?: SwapFee
}

/**
 * Reports a friend referral as the basis points it takes off the base affiliate
 * rate — the referrer's own cut is disclosed as its own fee row, not here.
 */
export const ReferralDiscountRow = ({
  renderRow,
  saving,
}: ReferralDiscountRowProps) => {
  const { t } = useTranslation()

  return (
    <>
      {renderRow({
        label: (
          <DiscountLabel icon={<StyledMegaphoneIcon />}>
            {`${t('referrals_default_title')} (-${getReferralDiscountSavingBps()} bps)`}
          </DiscountLabel>
        ),
        value: saving ? (
          <>
            −<SwapFeeFiatValue value={[saving]} />
          </>
        ) : null,
      })}
    </>
  )
}
