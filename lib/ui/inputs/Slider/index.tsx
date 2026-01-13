import { InputProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { useRef } from 'react'
import styled from 'styled-components'

import { Text } from '../../text'

const thumbWidth = 38

export type SliderProps = InputProps<number> & {
  min?: number
  max?: number
  step?: number
  showLabels?: boolean
  minLabel?: string
  maxLabel?: string
  showDots?: boolean
  dotPositions?: number[]
}

export const Slider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showLabels = true,
  minLabel = '0%',
  maxLabel = '100%',
  showDots = true,
  dotPositions = [15, 33, 50, 68, 85],
}: SliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null)

  const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return

    const rect = trackRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const trackWidth = rect.width
    const newPercentage = Math.max(
      0,
      Math.min(100, (clickX / trackWidth) * 100)
    )
    const newValue = min + (newPercentage / 100) * (max - min)
    const steppedValue = Math.round(newValue / step) * step

    onChange(Math.max(min, Math.min(max, steppedValue)))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  return (
    <Container>
      {showLabels && (
        <SliderLabel size={13} color="shy">
          {minLabel}
        </SliderLabel>
      )}
      <TrackWrapper ref={trackRef} onClick={handleTrackClick}>
        <Track>
          <TrackFill style={{ width: `${percentage}%` }} />
          <HiddenInput
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleInputChange}
          />
          <Thumb
            style={{
              left: `calc(${percentage}% - ${(percentage / 100) * thumbWidth}px)`,
            }}
          />
        </Track>
        {showDots && (
          <DotsContainer>
            {dotPositions.map(pos => (
              <Dot
                key={pos}
                $active={percentage >= pos}
                style={{ left: `${pos}%` }}
              />
            ))}
          </DotsContainer>
        )}
      </TrackWrapper>
      {showLabels && (
        <SliderLabel size={13} color="shy">
          {maxLabel}
        </SliderLabel>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`

const SliderLabel = styled(Text)`
  flex-shrink: 0;
  user-select: none;
`

const TrackWrapper = styled.div`
  position: relative;
  flex: 1;
  height: 32px;
  display: flex;
  align-items: center;
  cursor: pointer;
`

const Track = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  background-color: ${getColor('foregroundSuper')};
  border-radius: 2px;
`

const TrackFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: ${getColor('buttonPrimary')};
  border-radius: 2px;
  pointer-events: none;
`

const HiddenInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
  top: 0;
  left: 0;
`

const Thumb = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: ${thumbWidth}px;
  height: 24px;
  border-radius: 100px;
  background: ${getColor('contrast')};
  box-shadow:
    0 0.5px 4px 0 rgba(0, 0, 0, 0.12),
    0 6px 13px 0 rgba(0, 0, 0, 0.12);
  pointer-events: none;
  z-index: 2;
`

const DotsContainer = styled.div`
  position: absolute;
  top: calc(50% + 4px + 6px);
  left: 0;
  right: 0;
  pointer-events: none;
`

const Dot = styled.div<{ $active: boolean }>`
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ $active, theme }) =>
    $active
      ? theme.colors.buttonPrimary.toCssValue()
      : theme.colors.foregroundSuper.toCssValue()};
  transform: translateX(-50%);
`
