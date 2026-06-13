import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { VultDiscountTier as VultDiscountTierType } from '@vultisig/core-chain/swap/affiliate/config'
import { useTranslation } from 'react-i18next'

import { ActiveDiscountTierFooter } from './active-indicator'
import { DiscountTierBps } from './bps'
import {
  DiscountTierAccent,
  DiscountTierContainer,
  DiscountTierContent,
} from './container'
import { VultDiscountTierHeader } from './header'
import { DiscountTierMinBalance } from './minBalance'

type VultDiscountTierProps = ValueProp<VultDiscountTierType> & {
  activeDiscountTier: VultDiscountTierType | null
}

export const VultDiscountTier = ({
  value,
  activeDiscountTier,
}: VultDiscountTierProps) => {
  const { t } = useTranslation()
  const isActive = activeDiscountTier === value

  return (
    <DiscountTierContainer>
      <DiscountTierContent>
        <HStack alignItems="center" justifyContent="space-between" fullWidth>
          <VultDiscountTierHeader value={value} />
          <DiscountTierMinBalance value={value} />
        </HStack>
        {isActive && (
          <VStack alignItems="center" gap={12}>
            <DiscountTierBps value={value} />
            <Text size={13} color="shy">
              {t('more_coming_soon')}
            </Text>
          </VStack>
        )}
      </DiscountTierContent>
      {isActive ? (
        <ActiveDiscountTierFooter value={value} />
      ) : (
        <DiscountTierAccent value={value} />
      )}
    </DiscountTierContainer>
  )
}
