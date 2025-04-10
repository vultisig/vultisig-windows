import { HStack } from '@lib/ui/layout/Stack'
import { IsActiveProp, ValueProp } from '@lib/ui/props'
import { matchColor } from '@lib/ui/theme/getters'
import { range } from '@lib/utils/array/range'
import styled, { css } from 'styled-components'

import { round } from '../css/round'
import { sameDimensions } from '../css/sameDimensions'

type MultistepProgressIndicatorProps = ValueProp<number> & {
  steps: number
  variant?: 'dots' | 'bars'
  stepWidth?: string | number
  markPreviousStepsAsCompleted?: boolean
}

const Step = styled.div<
  IsActiveProp & {
    width?: number | string
    variant: 'dots' | 'bars'
  }
>`
  ${({ variant, width }) =>
    variant === 'dots'
      ? css`
          ${sameDimensions(8)};
          ${round};
        `
      : css`
          height: 2px;
          width: ${width ?? '50px'};
        `};

  background: ${matchColor('isActive', {
    true: 'primary',
    false: 'mistExtra',
  })};
`

export const MultistepProgressIndicator = ({
  value,
  steps,
  variant = 'dots',
  stepWidth,
  markPreviousStepsAsCompleted = false,
}: MultistepProgressIndicatorProps) => {
  return (
    <HStack gap={8}>
      {range(steps).map(index => (
        <Step
          key={index}
          width={stepWidth}
          variant={variant}
          isActive={
            markPreviousStepsAsCompleted ? index < value : index === value
          }
        />
      ))}
    </HStack>
  )
}
