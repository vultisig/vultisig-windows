import { DeviceSelectionTip } from '@core/ui/vault/create/setup-vault/DeviceSelectionTip'
import { useDeviceSelectionAnimation } from '@core/ui/vault/create/setup-vault/hooks/useDeviceSelectionAnimation'
import { Button } from '@lib/ui/buttons/Button'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { PointerEvent, ReactNode, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const animationMaxWidth = 400
const sliderMinY = 0.35
const sliderMaxY = 0.45

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
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: ${animationMaxWidth}px;
  aspect-ratio: ${animationMaxWidth} / 600;
`

// The device cards + slider label live inside the Rive artboard, so a
// "threshold not met" state is drawn on top of that region instead.
const BelowMinOverlay = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 45%;
  bottom: 0;
  background: ${getColor('background')};
  display: flex;
  flex-direction: column;
  align-items: center;
`

type DeviceCountPickerProps = {
  onBack: () => void
  onSubmit: (selectedDeviceCount: number) => void
  /** Rive `Index` to seed the slider with (0 = 1 device). */
  initialIndex?: number
  /** Lowest slider index that may be submitted; below it the CTA is disabled. */
  minSelectableIndex?: number
  submitText?: ReactNode
  /** CTA label shown (disabled) while the selection is below `minSelectableIndex`. */
  belowMinSubmitText?: ReactNode
  /**
   * Rendered over the Rive device-card region while the selection is below
   * `minSelectableIndex` (receives the current slider index) — used to draw the
   * "Threshold not met" card.
   */
  renderBelowMin?: (selectedDeviceCount: number) => ReactNode
}

export const DeviceCountPicker = ({
  onBack,
  onSubmit,
  initialIndex,
  minSelectableIndex = 0,
  submitText,
  belowMinSubmitText,
  renderBelowMin,
}: DeviceCountPickerProps) => {
  const { t } = useTranslation()
  const { RiveComponent, selectedDeviceCount, setSelectedDeviceCount } =
    useDeviceSelectionAnimation({ initialIndex })
  const isDraggingSliderRef = useRef(false)

  const updateSliderSelection = (event: PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointerY = (event.clientY - bounds.top) / bounds.height

    if (pointerY < sliderMinY || pointerY > sliderMaxY) return false

    setSelectedDeviceCount(((event.clientX - bounds.left) / bounds.width) * 3)
    return true
  }

  const isBelowMin = selectedDeviceCount < minSelectableIndex

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
              disabled={isBelowMin}
              style={{ width: '100%' }}
            >
              {isBelowMin && belowMinSubmitText
                ? belowMinSubmitText
                : (submitText ?? t('get_started'))}
            </Button>
          </VStack>
        }
      >
        <VStack flexGrow alignItems="center" justifyContent="center">
          <AnimationContainer>
            <RiveComponent
              style={{ width: '100%', height: '100%' }}
              onPointerDown={event => {
                if (updateSliderSelection(event)) {
                  const canvas = event.target
                  if (canvas instanceof HTMLCanvasElement) {
                    canvas.setPointerCapture(event.pointerId)
                  }
                  isDraggingSliderRef.current = true
                }
              }}
              onPointerMove={event => {
                if (isDraggingSliderRef.current) {
                  updateSliderSelection(event)
                }
              }}
              onPointerUp={() => {
                isDraggingSliderRef.current = false
              }}
              onPointerCancel={() => {
                isDraggingSliderRef.current = false
              }}
            />
            {isBelowMin && renderBelowMin ? (
              <BelowMinOverlay>
                {renderBelowMin(selectedDeviceCount)}
              </BelowMinOverlay>
            ) : null}
          </AnimationContainer>
        </VStack>
      </ScreenLayout>
    </GradientWrapper>
  )
}
