import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ValueProp } from '@lib/ui/props'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

import {
  discountTierActiveFooterHeight,
  DiscountTierFooterBox,
} from './container'

type ActiveDiscountTierFooterProps = ValueProp<VultDiscountTier> & {
  style?: CSSProperties
}

/** Footer of the tier this vault holds. */
export const ActiveDiscountTierFooter = ({
  value,
  style,
}: ActiveDiscountTierFooterProps) => {
  const { t } = useTranslation()
  return (
    <DiscountTierFooterBox
      value={value}
      style={{ height: discountTierActiveFooterHeight, ...style }}
    >
      <CheckIcon fontSize={14} style={{ margin: 3 }} />
      {t('active')}
    </DiscountTierFooterBox>
  )
}
