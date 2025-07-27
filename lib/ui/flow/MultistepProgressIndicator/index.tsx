import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { HStack } from '@lib/ui/layout/Stack'
import { IsActiveProp, ValueProp } from '@lib/ui/props'
import { matchColor } from '@lib/ui/theme/getters'
import { range } from '@lib/utils/array/range'
import styled, { css } from 'styled-components'

type MultistepProgressIndicatorProps = ValueProp<number> & {
  steps: number
  variant?: 'dots' | 'bars'
  markPreviousStepsAsCompleted?: boolean
}

const Step = styled.div<
  IsActiveProp & {
    variant: 'dots' | 'bars'
  }
>`
  ${({ variant }) =>
    variant === 'dots'
      ? css`
          ${sameDimensions(8)};
          ${round};
        `
      : css`
          flex: 1;
          height: 2px;
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
  markPreviousStepsAsCompleted = false,
}: MultistepProgressIndicatorProps) => {
  return (
    <HStack gap={8}>
      {range(steps).map(index => (
        <Step
          key={index}
          variant={variant}
          isActive={
            markPreviousStepsAsCompleted ? index < value : index === value
          }
        />
      ))}
    </HStack>
  )
}
