import { DeviceSelectionTip } from '@core/ui/vault/create/setup-vault/DeviceSelectionTip'
import { useDeviceSelectionAnimation } from '@core/ui/vault/create/setup-vault/hooks/useDeviceSelectionAnimation'
import { Button } from '@lib/ui/buttons/Button'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { ReactNode } from 'react'
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

type DeviceCountPickerProps = {
  onBack: () => void
  onSubmit: (selectedDeviceCount: number) => void
  /** Rive `Index` to seed the slider with (0 = 1 device). */
  initialIndex?: number
  /** Lowest slider index that may be submitted; below it the CTA is disabled. */
  minSelectableIndex?: number
  submitText?: ReactNode
}

export const DeviceCountPicker = ({
  onBack,
  onSubmit,
  initialIndex,
  minSelectableIndex = 0,
  submitText,
}: DeviceCountPickerProps) => {
  const { t } = useTranslation()
  const { RiveComponent, selectedDeviceCount } = useDeviceSelectionAnimation({
    initialIndex,
  })

  return (
    <GradientWrapper>
      <TopGradient />
      <ScreenLayout
        onBack={onBack}
        footer={
          <VStack gap={16} fullWidth alignItems="center">
            <DeviceSelectionTip />
            <Button
              onClick={() => onSubmit(selectedDeviceCount)}
              disabled={selectedDeviceCount < minSelectableIndex}
              style={{ width: '100%' }}
            >
              {submitText ?? t('get_started')}
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
  )
}
