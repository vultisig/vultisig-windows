import { useTranslation } from 'react-i18next'

import { Button } from '../../../lib/ui/buttons/Button'
import { AnimatedVisibility } from '../../../lib/ui/layout/AnimatedVisibility'
import { VStack } from '../../../lib/ui/layout/Stack'
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { ProductLogoBlock } from '../../../ui/logo/ProductLogoBlock'
<<<<<<< Updated upstream
import { Wrapper } from './NoVaultsHomePage.styled'
=======
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { HorizontalLine, Wrapper } from './NoVaultsHomePage.styled'
>>>>>>> Stashed changes

export const NoVaultsHomePage = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()

  return (
<<<<<<< Updated upstream
    <Wrapper>
      <VStack flexGrow alignItems="center" justifyContent="center">
        <AnimatedVisibility delay={500}>
          <ProductLogoBlock />
        </AnimatedVisibility>
      </VStack>
      <AnimatedVisibility animationConfig="bottomToTop" delay={800}>
=======
    <Wrapper delay={200}>
      {withBackButton && (
        <PageHeader primaryControls={<PageHeaderBackButton />} />
      )}
      <PageContent>
        <VStack flexGrow alignItems="center" justifyContent="center">
          <ProductLogoBlock />
        </VStack>
>>>>>>> Stashed changes
        <VStack gap={20}>
          <Button onClick={() => navigate('setupVault', { params: {} })}>
            {t('create_new_vault')}
          </Button>
<<<<<<< Updated upstream
          <Button onClick={() => navigate('importVault')} kind="secondary">
            {t('import_vault')}
          </Button>
        </VStack>
      </AnimatedVisibility>
=======
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
>>>>>>> Stashed changes
    </Wrapper>
  )
}
