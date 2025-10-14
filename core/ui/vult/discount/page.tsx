import { vult } from '@core/chain/coin/knownTokens'
import { vultWebsiteUrl } from '@core/config'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { GlobusIcon } from '@lib/ui/icons/GlobusIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

import { PageHeaderBackButton } from '../../flow/PageHeaderBackButton'
import { useCore } from '../../state/core'

export const VultDiscountPage = () => {
  const { t } = useTranslation()
  const { openUrl } = useCore()

  return (
    <VStack fullHeight gap={40}>
      <PageHeader
        title={`$${vult.ticker} ${t('discount_tiers')}`}
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <IconButton onClick={() => openUrl(vultWebsiteUrl)}>
            <GlobusIcon />
          </IconButton>
        }
      />
      <FitPageContent contentMaxWidth={520}>Coming soon!</FitPageContent>
    </VStack>
  )
}
