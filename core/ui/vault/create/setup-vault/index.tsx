import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { DeviceSelectionTip } from '@core/ui/vault/create/setup-vault/DeviceSelectionTip'
import { useDeviceSelectionAnimation } from '@core/ui/vault/create/setup-vault/hooks/useDeviceSelectionAnimation'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const contentMaxWidth = 400

const PageWrapper = styled(VStack)`
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
`

const TopGradient = styled.div`
  position: absolute;
  z-index: -1;
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

const ContentWrapper = styled(PageContent)`
  position: relative;
  z-index: 1;
`

const FooterWrapper = styled(PageFooter)`
  position: relative;
  z-index: 1;
`

const AnimationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: ${contentMaxWidth}px;
  aspect-ratio: ${contentMaxWidth} / 600;
`

export const SetupVaultPage = () => {
  const { RiveComponent, selectedDeviceCount } = useDeviceSelectionAnimation()
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [state] = useCoreViewState<'setupVault'>()

  const handleContinue = () => {
    if (selectedDeviceCount === 0) {
      navigate({
        id: 'setupFastVault',
        state: { keyImportInput: state?.keyImportInput },
      })
    } else {
      navigate({
        id: 'setupSecureVault',
        state: {
          keyImportInput: state?.keyImportInput,
          deviceCount: selectedDeviceCount + 1,
        },
      })
    }
  }

  return (
    <PageWrapper fullHeight>
      <TopGradient />
      <ContentWrapper>
        <VStack flexGrow alignItems="center" justifyContent="center" fullWidth>
          <AnimationContainer>
            <RiveComponent style={{ width: '100%', height: '100%' }} />
          </AnimationContainer>
        </VStack>
      </ContentWrapper>
      <FooterWrapper>
        <VStack gap={16} fullWidth alignItems="center">
          <DeviceSelectionTip />
          <Button
            onClick={handleContinue}
            style={{ width: '100%', maxWidth: contentMaxWidth }}
          >
            {t('get_started')}
          </Button>
        </VStack>
      </FooterWrapper>
    </PageWrapper>
  )
}
