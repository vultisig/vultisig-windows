import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { SvgProps, ValueProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import { FC } from 'react'
import styled, { keyframes } from 'styled-components'

import { ToastStatus } from './ToastStatus'

const ringSize = 24
const ringStrokeWidth = 2
const ringRadius = (ringSize - ringStrokeWidth) / 2
const ringCircumference = 2 * Math.PI * ringRadius

type ToastStatusAppearance = {
  Icon: FC<SvgProps>
  color: ThemeColor
  iconSize: number
}

const appearances: Record<ToastStatus, ToastStatusAppearance> = {
  success: { Icon: CheckIcon, color: 'primary', iconSize: 14 },
  warning: { Icon: TriangleAlertIcon, color: 'idle', iconSize: 12 },
  error: { Icon: CrossIcon, color: 'danger', iconSize: 13 },
}

type ToastStatusIconProps = ValueProp<ToastStatus> & {
  duration: number
}

/**
 * Status icon wrapped in a ring that fills over `duration`, so the ring
 * completing tells the user the toast is about to dismiss.
 */
export const ToastStatusIcon = ({ value, duration }: ToastStatusIconProps) => {
  const { Icon, color, iconSize } = appearances[value]

  return (
    <Wrapper color={color} style={{ fontSize: iconSize }}>
      <Ring aria-hidden viewBox={`0 0 ${ringSize} ${ringSize}`}>
        <Track cx={ringSize / 2} cy={ringSize / 2} r={ringRadius} />
        <Progress
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={ringRadius}
          style={{ animationDuration: `${duration}ms` }}
        />
      </Ring>
      <Icon />
    </Wrapper>
  )
}

const popIn = keyframes`
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
`

const fillRing = keyframes`
  from {
    stroke-dashoffset: ${ringCircumference};
  }
  to {
    stroke-dashoffset: 0;
  }
`

const Wrapper = styled.div<{ color: ThemeColor }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${ringSize}px;
  height: ${ringSize}px;
  line-height: 1;
  color: ${({ color, theme }) => theme.colors[color].toCssValue()};
  animation: ${popIn} 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Ring = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
`

const Track = styled.circle`
  fill: none;
  stroke: ${getColor('foregroundSuper')};
  stroke-width: ${ringStrokeWidth};
`

const Progress = styled.circle`
  fill: none;
  stroke: currentColor;
  stroke-width: ${ringStrokeWidth};
  stroke-linecap: round;
  stroke-dasharray: ${ringCircumference};
  animation-name: ${fillRing};
  animation-timing-function: linear;
  animation-fill-mode: forwards;
`
