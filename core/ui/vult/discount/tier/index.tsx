import { getVultDiscountTier } from '@core/chain/swap/affiliate'
import {
  VultDiscountTier as VultDiscountTierType,
  vultDiscountTiers,
} from '@core/chain/swap/affiliate/config'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import React, { useMemo, useState } from 'react'

import { ActiveDiscountTierIndicator } from './active-indicator'
import { DiscountTierContainer } from './container'
import { VultDiscountTierHeader } from './header'
import { DiscountTierMinBalance } from './minBalance'
import { UnlockDiscountTier } from './unlock'

type VultDiscountTierProps = ValueProp<VultDiscountTierType> & {
  vultBalance: bigint
}

export const VultDiscountTier = ({
  value,
  vultBalance,
}: VultDiscountTierProps) => {
  const activeDiscountTier = getVultDiscountTier(vultBalance)
  const isActive = activeDiscountTier === value

  const isExpandable = useMemo(() => {
    if (!activeDiscountTier) {
      return true
    }

    const activeDiscountTierIndex =
      vultDiscountTiers.indexOf(activeDiscountTier)

    return activeDiscountTierIndex < vultDiscountTiers.indexOf(value)
  }, [activeDiscountTier, value])

  const [isExpanded, setIsExpanded] = useState(isActive)

  return (
    <DiscountTierContainer value={value}>
      <VultDiscountTierHeader
        value={value}
        onClick={isExpandable ? () => setIsExpanded(prev => !prev) : undefined}
      />
      {isExpanded && (
        <VStack gap={14}>
          {isActive ? (
            <div style={{ height: 20 }} />
          ) : (
            <DiscountTierMinBalance value={value} />
          )}
          {isActive ? (
            <HStack alignItems="center" justifyContent="space-between">
              <DiscountTierMinBalance value={value} />
              <ActiveDiscountTierIndicator />
            </HStack>
          ) : (
            <UnlockDiscountTier value={value} />
          )}
        </VStack>
      )}
    </DiscountTierContainer>
  )
}
