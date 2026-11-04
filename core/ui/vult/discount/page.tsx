import { IconButton } from '@lib/ui/buttons/IconButton'
import { GlobusIcon } from '@lib/ui/icons/GlobusIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import { vultDiscountTiers } from '@vultisig/core-chain/swap/affiliate/config'
import { vultWebsiteUrl } from '@vultisig/core-config'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { currentProductBrand } from '../../product/brand'
import { useResponsiveness } from '../../providers/ResponsivenessProvider'
import { SettingsPageHeader } from '../../settings/SettingsPageHeader'
import { useCore } from '../../state/core'
import { useVultDiscountTierQuery } from './queries/tier'
import { VultDiscountTier } from './tier'

/** The $VULT tier list; Station has no VULT discounts, so it renders nothing there. */
export const VultDiscountPage = () => {
  if (currentProductBrand === 'station') {
    return null
  }

  return <VultDiscountPageContent />
}

const VultDiscountPageContent = () => {
  const { t } = useTranslation()
  const { openUrl } = useCore()

  const tierQuery = useVultDiscountTierQuery()

  const { isTabletOrLarger } = useResponsiveness()

  return (
    <VStack fullHeight>
      <SettingsPageHeader
        title={t('discount_tiers', { ticker: `$${vult.ticker}` })}
        secondaryControls={
          <GlobeButton onClick={() => openUrl(vultWebsiteUrl)}>
            <GlobusIcon />
          </GlobeButton>
        }
      />
      <Body alignItems="center" scrollable>
        <Hero alt="" src="/core/images/vult-tiers-hero.webp" />
        <VStack
          fullWidth
          gap={13}
          maxWidth={isTabletOrLarger ? 600 : undefined}
          style={{ position: 'relative' }}
        >
          <VStack gap={4}>
            <Text height={20 / 14} size={14} weight={400}>
              {t('discount_tiers_description')}
            </Text>
            <Text color="shyExtra" variant="caption">
              {t('discount_tiers_thorguard_boost')}
            </Text>
          </VStack>
          <MatchQuery
            value={tierQuery}
            pending={() => <Spinner />}
            error={() => t('failed_to_load')}
            success={activeDiscountTier => (
              <VStack gap={12}>
                {vultDiscountTiers.map(tier => (
                  <VultDiscountTier
                    key={tier}
                    value={tier}
                    activeDiscountTier={activeDiscountTier}
                  />
                ))}
              </VStack>
            )}
          />
        </VStack>
      </Body>
    </VStack>
  )
}

const heroWidth = 360
const heroHeight = 280
// Where the frame's art starts and the text below it, measured from the page body.
const heroTop = -11
const heroClearance = 213

const GlobeButton = styled(IconButton)`
  font-size: 20px;
`

const Body = styled(PageContent)`
  padding-top: ${heroClearance}px;
  position: relative;
`

const Hero = styled.img`
  height: ${heroHeight}px;
  left: 50%;
  mask-image: linear-gradient(
    90deg,
    transparent,
    black 8%,
    black 92%,
    transparent
  );
  pointer-events: none;
  position: absolute;
  top: ${heroTop}px;
  transform: translateX(-50%);
  width: ${heroWidth}px;
`
