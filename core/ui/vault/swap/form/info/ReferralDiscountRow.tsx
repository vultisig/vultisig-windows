import { nativeSwapAffiliateConfig } from '@core/chain/swap/native/nativeSwapAffiliateConfig'
import { MegaphoneIcon } from '@lib/ui/icons/MegaphoneIcon'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { formatDiscountPercentOfBaseFee } from './discountPercent'
import { DiscountRow } from './DiscountRow'

const StyledMegaphoneIcon = styled(MegaphoneIcon)`
  color: ${getColor('primaryAccentFour')};
`

export const ReferralDiscountRow = () => {
  const { t } = useTranslation()
  const bps = nativeSwapAffiliateConfig.referrerFeeRateBps
  const discountPercent = formatDiscountPercentOfBaseFee(bps)

  return (
    <DiscountRow icon={<StyledMegaphoneIcon />}>
      {t('referrals_default_title')}: {discountPercent}
    </DiscountRow>
  )
}
