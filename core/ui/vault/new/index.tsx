import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { useVaults } from '@core/ui/storage/vaults'
import { Button } from '@lib/ui/buttons/Button'
import { Divider } from '@lib/ui/divider'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { useTranslation } from 'react-i18next'

export const NewVaultPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vaults = useVaults()

  return (
    <VStack fullHeight>
      {vaults.length > 0 && (
        <PageHeader primaryControls={<PageHeaderBackButton />} />
      )}
      <PageContent alignItems="center" justifyContent="center" flexGrow>
        <ProductLogoBlock />
      </PageContent>
      <PageFooter gap={16}>
        <Button onClick={() => navigate({ id: 'setupVault', state: {} })}>
          {t('create_new_vault')}
        </Button>
        <Divider text={t('or').toUpperCase()} />
        <VStack gap={12}>
          <Button
            kind="secondary"
            onClick={() =>
              navigate({ id: 'uploadQr', state: { title: t('scan_qr') } })
            }
          >
            {t('scan_qr')}
          </Button>
          <Button
            kind="secondary"
            onClick={() => navigate({ id: 'importVault' })}
          >
            {t('import_vault')}
          </Button>
        </VStack>
      </PageFooter>
    </VStack>
  )
}
