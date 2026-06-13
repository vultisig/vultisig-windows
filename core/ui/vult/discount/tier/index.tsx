import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { VultDiscountTier as VultDiscountTierType } from '@vultisig/core-chain/swap/affiliate/config'
import { useState } from 'react'
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
import { UnlockDiscountTier } from './unlock'

type VultDiscountTierProps = ValueProp<VultDiscountTierType> & {
  activeDiscountTier: VultDiscountTierType | null
}

export const VultDiscountTier = ({
  value,
  activeDiscountTier,
}: VultDiscountTierProps) => {
  const { t } = useTranslation()
  const isActive = activeDiscountTier === value
  const [isExpanded, setIsExpanded] = useState(false)

  const showDetails = isActive || isExpanded

  const toggle = () => {
    if (!isActive) {
      setIsExpanded(prev => !prev)
    }
  }

  return (
    <DiscountTierContainer
      $clickable={!isActive}
      onClick={toggle}
      role={isActive ? undefined : 'button'}
      tabIndex={isActive ? undefined : 0}
      aria-expanded={isActive ? undefined : isExpanded}
      onKeyDown={event => {
        if (!isActive && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          toggle()
        }
      }}
    >
      <DiscountTierContent>
        <HStack alignItems="center" justifyContent="space-between" fullWidth>
          <VultDiscountTierHeader value={value} />
          <DiscountTierMinBalance value={value} />
        </HStack>
        <AnimatedVisibility isOpen={showDetails} animationConfig="exitToTop">
          <VStack alignItems="center" gap={12}>
            <DiscountTierBps value={value} />
            <Text size={13} color="shy">
              {t('more_coming_soon')}
            </Text>
          </VStack>
        </AnimatedVisibility>
      </DiscountTierContent>
      {isActive ? (
        <ActiveDiscountTierFooter value={value} />
      ) : isExpanded ? (
        <UnlockDiscountTier value={value} />
      ) : (
        <DiscountTierAccent value={value} />
      )}
    </DiscountTierContainer>
  )
}
