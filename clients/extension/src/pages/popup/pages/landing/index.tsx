import { AnimatedVisibility } from '@clients/extension/src/components/shared/AnimatedVisibility'
import { HorizontalLine } from '@clients/extension/src/components/shared/HorizontalLine'
import { ProductLogoBlock } from '@clients/extension/src/components/shared/Logo/ProductLogoBlock'
import { PageContent } from '@clients/extension/src/components/shared/Page/PageContent'
import { PageHeader } from '@clients/extension/src/components/shared/Page/PageHeader'
import { PageHeaderBackButton } from '@clients/extension/src/components/shared/Page/PageHeaderBackButton'
import { makeAppPath } from '@clients/extension/src/navigation'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const NewVaultPage = ({ withBackButton = true }) => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()

  return (
    <Wrapper delay={200}>
      {withBackButton && (
        <PageHeader primaryControls={<PageHeaderBackButton />} />
      )}
      <PageContent>
        <VStack flexGrow alignItems="center" justifyContent="center">
          <ProductLogoBlock />
        </VStack>
        <VStack gap={20}>
          <Button onClick={() => navigate('setupVault')}>
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
            <Button
              onClick={() => navigate('import', { params: {} })}
              kind="secondary"
            >
              {t('import_vault')}
            </Button>
          </VStack>
        </VStack>
      </PageContent>
    </Wrapper>
  )
}

const Wrapper = styled(AnimatedVisibility)`
  overflow-y: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const ScanQRCodeLink = styled(Link)`
  width: 100%;
`
