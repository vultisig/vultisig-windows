import { Button } from '@clients/extension/src/components/button'
import { ProductLogoBlock } from '@clients/extension/src/components/shared/Logo/ProductLogoBlock'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Divider } from '@lib/ui/divider'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { useTranslation } from 'react-i18next'

export const NewVaultPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <VStack fullHeight>
      <PageContent alignItems="center" justifyContent="center" flexGrow>
        <ProductLogoBlock />
      </PageContent>
      <PageFooter gap={16}>
        <Button
          onClick={() => navigate('setupVault', { params: {} })}
          shape="round"
          size="large"
          type="primary"
          block
        >
          {t('create_new_vault')}
        </Button>
        <Divider text={t('or').toUpperCase()} />
        <VStack gap={12}>
          <Button
            onClick={() => navigate('uploadQr', { params: {} })}
            shape="round"
            size="large"
            type="secondary"
            block
          >
            {t('scan_qr')}
          </Button>
          <Button
            onClick={() => navigate('importVault')}
            shape="round"
            size="large"
            type="secondary"
            block
          >
            {t('import_vault')}
          </Button>
        </VStack>
      </PageFooter>
    </VStack>
  )
}
