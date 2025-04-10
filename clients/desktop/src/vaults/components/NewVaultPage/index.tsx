import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { makeAppPath } from '../../../navigation'
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { ProductLogoBlock } from '../../../ui/logo/ProductLogoBlock'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { HorizontalLine, ScanQRCodeLink, Wrapper } from './NewVaultPage.styled'

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
          <HStack gap={18} alignItems="center">
            <HorizontalLine />
            <Text size={12} color="contrast" weight="700">
              {t('or').toUpperCase()}
            </Text>
            <HorizontalLine />
          </HStack>
          <VStack gap={12}>
            <ScanQRCodeLink
              to={makeAppPath('uploadQr', {
                title: t('scan_qr'),
              })}
              style={{ textDecoration: 'none' }}
            >
              <Button as="span" kind="secondary">
                {t('scan_qr')}
              </Button>
            </ScanQRCodeLink>
            <Button onClick={() => navigate('importVault')} kind="secondary">
              {t('import_vault')}
            </Button>
          </VStack>
        </VStack>
      </PageContent>
    </Wrapper>
  )
}
