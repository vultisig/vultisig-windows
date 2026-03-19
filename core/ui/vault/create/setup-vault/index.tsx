import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { DeviceSelectionTip } from '@core/ui/vault/create/setup-vault/DeviceSelectionTip'
import { useDeviceSelectionAnimation } from '@core/ui/vault/create/setup-vault/hooks/useDeviceSelectionAnimation'
import { Button } from '@lib/ui/buttons/Button'
import { Stepper } from '@lib/ui/inputs/Stepper'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
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

const StepperWrapper = styled.div`
  width: 100%;
  max-width: ${animationMaxWidth}px;
`

export const SetupVaultPage = () => {
  const { RiveComponent, selectedDeviceCount, setSelectedDeviceCount } =
    useDeviceSelectionAnimation()
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const goBack = useNavigateBack()
  const [state] = useCoreViewState<'setupVault'>()

  const handleGetStarted = () => {
    navigate({
      id: 'setupVaultOverview',
      state: {
        selectedDeviceCount,
        keyImportInput: state?.keyImportInput,
      },
    })
  }

  return (
    <GradientWrapper>
      <TopGradient />
      <ScreenLayout
        onBack={goBack}
        footer={
          <VStack gap={16} fullWidth alignItems="center">
            <DeviceSelectionTip />
            <Button onClick={handleGetStarted} style={{ width: '100%' }}>
              {t('get_started')}
            </Button>
          </VStack>
        }
      >
        <VStack gap={16} flexGrow alignItems="center" justifyContent="center">
          <AnimationContainer>
            <RiveComponent style={{ width: '100%', height: '100%' }} />
          </AnimationContainer>
          <StepperWrapper>
            <Stepper
              value={selectedDeviceCount + 1}
              onChange={v => {
                if (typeof v === 'number') {
                  setSelectedDeviceCount(v - 1)
                }
              }}
              min={1}
              max={4}
            />
          </StepperWrapper>
        </VStack>
      </ScreenLayout>
    </GradientWrapper>
  )
}
