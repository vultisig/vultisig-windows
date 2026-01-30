import { vult } from '@core/chain/coin/knownTokens'
import { vultDiscountTiers } from '@core/chain/swap/affiliate/config'
import { vultWebsiteUrl } from '@core/config'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { GlobusIcon } from '@lib/ui/icons/GlobusIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { PageHeaderBackButton } from '../../flow/PageHeaderBackButton'
import { useResponsiveness } from '../../providers/ResponsivenessProvider'
import { useCore } from '../../state/core'
import { useVultDiscountTierQuery } from './queries/tier'
import { VultDiscountTier } from './tier'

export const VultDiscountPage = () => {
  const { t } = useTranslation()
  const { openUrl } = useCore()

  const tierQuery = useVultDiscountTierQuery()

  const { isTabletOrLarger } = useResponsiveness()

  return (
    <VStack fullHeight gap={10}>
      <PageHeader
        title={`$${vult.ticker} ${t('discount_tiers')}`}
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <IconButton onClick={() => openUrl(vultWebsiteUrl)}>
            <GlobusIcon />
          </IconButton>
        }
      />
      <FitPageContent contentMaxWidth={isTabletOrLarger ? 600 : 360}>
        <VStack gap={24}>
          <img src="/core/images/vult-banner.png" alt="Vult Banner" />
          <VStack gap={12}>
            <Text size={14} weight={400}>
              {t('discount_tiers_description')}
            </Text>
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
        </VStack>
      </FitPageContent>
    </VStack>
  )
}
