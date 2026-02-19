import { SvgProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled, { css } from 'styled-components'

type StepState = 'completed' | 'active' | 'upcoming'

type StepConfig = {
  icon: FC<SvgProps>
}

type StepProgressIndicatorProps = {
  steps: readonly StepConfig[]
  currentStepIndex: number
}

const getStepState = (
  stepIndex: number,
  currentStepIndex: number
): StepState => {
  if (stepIndex < currentStepIndex) return 'completed'
  if (stepIndex === currentStepIndex) return 'active'
  return 'upcoming'
}

export const StepProgressIndicator = ({
  steps,
  currentStepIndex,
}: StepProgressIndicatorProps) => (
  <Container>
    {steps.map((step, index) => {
      const state = getStepState(index, currentStepIndex)
      const Icon = step.icon

      return (
        <Row key={index}>
          {index > 0 && <Dash $active={index <= currentStepIndex} />}
          <StepCircle $state={state}>
            <Icon />
          </StepCircle>
        </Row>
      )
    })}
  </Container>
)

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const Row = styled.div`
  display: flex;
  align-items: center;
`

const stepCircleSize = 36

const stepStateStyles: Record<StepState, ReturnType<typeof css>> = {
  completed: css`
    background: ${getColor('foreground')};
    color: ${getColor('success')};
  `,
  active: css`
    background: transparent;
    border: 2px solid ${getColor('primary')};
    color: ${getColor('primary')};
  `,
  upcoming: css`
    background: ${getColor('foreground')};
    color: ${getColor('textShy')};
  `,
}

const StepCircle = styled.div<{ $state: StepState }>`
  width: ${stepCircleSize}px;
  height: ${stepCircleSize}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  ${({ $state }) => stepStateStyles[$state]}
`

const Dash = styled.div<{ $active: boolean }>`
  width: 24px;
  height: 2px;
  border-radius: 1px;
  background: ${({ $active }) =>
    $active ? getColor('primary') : getColor('foregroundExtra')};
`
