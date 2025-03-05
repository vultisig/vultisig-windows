import { useTranslation } from 'react-i18next'

import { Button } from '../../../lib/ui/buttons/Button'
import { VStack } from '../../../lib/ui/layout/Stack'
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { ProductLogoBlock } from '../../../ui/logo/ProductLogoBlock'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { HorizontalLine, Wrapper } from './NewVaultPage.styled'

export const NewVaultPage = ({ withBackButton = true }) => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()

  return (
    <Wrapper delay={200}>
      {withBackButton && (
        <PageHeader primaryControls={<PageHeaderBackButton />} />
      )}
      <PageContent flexGrow>
        <VStack flexGrow alignItems="center" justifyContent="center">
          <ProductLogoBlock />
        </VStack>
        <VStack gap={20}>
          <Button onClick={() => navigate('setupVault', { params: {} })}>
            {t('create_new_vault')}
          </Button>

          <HorizontalLine />
          <VStack gap={12}>
            <Button onClick={() => navigate('importVault')} kind="secondary">
              {t('import_vault')}
            </Button>
            <Button onClick={() => navigate('importVault')} kind="secondary">
              {t('scan_qr')}
            </Button>
          </VStack>
        </VStack>
      </PageContent>
    </Wrapper>
  )
}
