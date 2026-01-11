import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ProductLogo } from '@core/ui/product/ProductLogo'
import { useVaults } from '@core/ui/storage/vaults'
import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ImportVaultButton } from './ImportVaultButton'

const PageWrapper = styled(VStack)`
  position: relative;
  overflow: hidden;
`

const TopGradient = styled.div`
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(72, 121, 253, 0.5) 0%,
    rgba(2, 18, 43, 0) 100%
  );
  pointer-events: none;
`

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 19px;
  background: linear-gradient(180deg, #4879fd 0%, #0d39b1 100%);
  box-shadow: inset 0px 1.2px 1.2px 0px rgba(255, 255, 255, 0.35);
  color: white;
`

const Logo = styled(ProductLogo)`
  font-size: 34px;
`

const ButtonRow = styled(HStack)`
  > *:first-child {
    flex: 1;
  }
`

export const NewVaultPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vaults = useVaults()

  return (
    <PageWrapper fullHeight>
      <TopGradient />
      {vaults.length > 0 && (
        <PageHeader
          primaryControls={
            <PageHeaderBackButton onClick={() => navigate({ id: 'vaults' })} />
          }
        />
      )}
      <FitPageContent>
        <VStack
          flexGrow
          alignItems="center"
          justifyContent="center"
          gap={18}
          fullHeight
        >
          <LogoContainer>
            <Logo />
          </LogoContainer>
          <Text color="contrast" weight={500} size={28}>
            {t('vultisig')}
          </Text>
        </VStack>
      </FitPageContent>
      <PageFooter>
        <VStack gap={16} fullWidth>
          <ButtonRow gap={8}>
            <Button
              kind="secondary"
              onClick={() =>
                navigate({ id: 'uploadQr', state: { title: t('scan_qr') } })
              }
            >
              {t('scan_qr')}
            </Button>
            <ImportVaultButton />
          </ButtonRow>
          <Button onClick={() => navigate({ id: 'setupVault', state: {} })}>
            {t('next')}
          </Button>
        </VStack>
      </PageFooter>
    </PageWrapper>
  )
}
