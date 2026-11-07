import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { VultDiscountTier as VultDiscountTierType } from '@vultisig/core-chain/swap/affiliate/config'
import { CSSProperties, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ActiveDiscountTierFooter } from './active-indicator'
import {
  DiscountTierContainer,
  DiscountTierContent,
  DiscountTierDarkSection,
  discountTierFooterHeight,
  discountTierFooterOverlap,
  discountTierFooterPeek,
} from './container'
import { VultDiscountTierHeader } from './header'
import { DiscountTierMinBalance } from './minBalance'
import { DiscountTierPercent } from './percent'
import { UnlockDiscountTier } from './unlock'

type VultDiscountTierProps = ValueProp<VultDiscountTierType> & {
  activeDiscountTier: VultDiscountTierType | null
}

// The coloured footer only starts sliding out once the dark section has
// finished expanding (~300ms) plus a short pause.
const footerRevealDelayMs = 600

const expandedContentBottomPadding = 15
const collapsedContentBottomPadding = 22

const collapsedFooterMargin = -(
  discountTierFooterHeight - discountTierFooterPeek
)
const revealedFooterMargin = -discountTierFooterOverlap

/** One tier's card: collapsed to its threshold, or expanded with its discount and footer. */
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

  const footerStyle: CSSProperties = {
    marginTop: showDetails ? revealedFooterMargin : collapsedFooterMargin,
    transition: 'margin-top 350ms ease',
    transitionDelay:
      !isActive && isExpanded ? `${footerRevealDelayMs}ms` : '0ms',
    pointerEvents: showDetails ? 'auto' : 'none',
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
      <DiscountTierDarkSection $isExpanded={showDetails}>
        <DiscountTierContent
          style={{
            paddingBottom: showDetails
              ? expandedContentBottomPadding
              : collapsedContentBottomPadding,
          }}
        >
          <HStack
            alignItems="center"
            justifyContent="space-between"
            fullWidth
            style={{ marginBottom: showDetails ? 12 : undefined }}
          >
            <VultDiscountTierHeader value={value} />
            <DiscountTierMinBalance value={value} />
          </HStack>
          <AnimatedVisibility isOpen={showDetails} animationConfig="exitToTop">
            <VStack alignItems="center" gap={12}>
              <DiscountTierPercent value={value} />
              <Text color="shy" height={16 / 12} size={12} weight={500}>
                {t('more_coming_soon')}
              </Text>
            </VStack>
          </AnimatedVisibility>
        </DiscountTierContent>
      </DiscountTierDarkSection>
      {isActive ? (
        <ActiveDiscountTierFooter value={value} style={footerStyle} />
      ) : (
        <UnlockDiscountTier value={value} style={footerStyle} />
      )}
    </DiscountTierContainer>
  )
}
