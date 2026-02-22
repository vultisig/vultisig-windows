import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { DeviceSelectionTip } from '@core/ui/vault/create/setup-vault/DeviceSelectionTip'
import { useDeviceSelectionAnimation } from '@core/ui/vault/create/setup-vault/hooks/useDeviceSelectionAnimation'
import { VaultSetupOverviewContent } from '@core/ui/vault/create/setup-vault/vault-setup-overview/VaultSetupOverviewContent'
import { Button } from '@lib/ui/buttons/Button'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const animationMaxWidth = 400

const GradientWrapper = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;
`

const TopGradient = styled.div`
  position: absolute;
  z-index: 0;
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

const AnimationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: ${animationMaxWidth}px;
  aspect-ratio: ${animationMaxWidth} / 600;
`

const HiddenWhenInactive = styled.div<{ $active: boolean }>`
  display: ${({ $active }) => ($active ? 'contents' : 'none')};
`

export const SetupVaultPage = () => {
  const { RiveComponent, selectedDeviceCount } = useDeviceSelectionAnimation()
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [state] = useCoreViewState<'setupVault'>()
  const [showOverview, { set: goToOverview, unset: goBackToSelection }] =
    useBoolean(false)

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
    <>
      <HiddenWhenInactive $active={!showOverview}>
        <GradientWrapper>
          <TopGradient />
          <ScreenLayout
            onBack={() => navigate({ id: 'newVault' })}
            footer={
              <VStack gap={16} fullWidth alignItems="center">
                <DeviceSelectionTip />
                <Button onClick={goToOverview} style={{ width: '100%' }}>
                  {t('get_started')}
                </Button>
              </VStack>
            }
          >
            <VStack flexGrow alignItems="center" justifyContent="center">
              <AnimationContainer>
                <RiveComponent style={{ width: '100%', height: '100%' }} />
              </AnimationContainer>
            </VStack>
          </ScreenLayout>
        </GradientWrapper>
      </HiddenWhenInactive>
      {showOverview && (
        <VaultSetupOverviewContent
          selectedDeviceCount={selectedDeviceCount}
          onBack={goBackToSelection}
          onGetStarted={handleContinue}
        />
      )}
    </>
  )
}
