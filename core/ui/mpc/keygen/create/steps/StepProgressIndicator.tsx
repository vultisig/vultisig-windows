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

type GetStepStateInput = {
  stepIndex: number
  currentStepIndex: number
}

const getStepState = ({
  stepIndex,
  currentStepIndex,
}: GetStepStateInput): StepState => {
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
      const state = getStepState({ stepIndex: index, currentStepIndex })
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
  gap: 12px;
`

const stepCircleSize = 36

const stepStateStyles: Record<StepState, ReturnType<typeof css>> = {
  completed: css`
    background: rgba(19, 200, 157, 0.05);
    color: ${getColor('primary')};
  `,
  active: css`
    background: #03132c;
    color: ${getColor('buttonPrimary')};
    position: relative;

    &::before {
      content: '';
      position: absolute;
      width: 15.897px;
      height: 8.026px;
      background: #0c4eff;
      filter: blur(9.260643005371094px);
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
    }
  `,
  upcoming: css`
    color: rgba(255, 255, 255, 0.15);
  `,
}

const StepCircle = styled.div<{ $state: StepState }>`
  width: ${stepCircleSize}px;
  height: ${stepCircleSize}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  ${({ $state }) => stepStateStyles[$state]};
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 2.051px 2.051px 0 rgba(0, 0, 0, 0.25) inset;
`

const Dash = styled.div<{ $active: boolean }>`
  width: 24px;
  height: 2px;
  border-radius: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin-left: 12px;
`
