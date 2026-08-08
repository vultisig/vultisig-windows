import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ValueProp } from '@lib/ui/props'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

import { DiscountTierFooterBox } from './container'

type ActiveDiscountTierFooterProps = ValueProp<VultDiscountTier> & {
  style?: CSSProperties
}

export const ActiveDiscountTierFooter = ({
  value,
  style,
}: ActiveDiscountTierFooterProps) => {
  const { t } = useTranslation()
  return (
    <DiscountTierFooterBox value={value} style={style}>
      <CheckIcon fontSize={18} />
      {t('active')}
    </DiscountTierFooterBox>
  )
}
