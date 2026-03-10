import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled, { css, keyframes, useTheme } from 'styled-components'

import { LoaderIcon } from '../icons/LoaderIcon'
import { categoryColor, stepIconComponent } from './agentStepConfig'
import type { AgentStep } from './TimelineEntry'

type Props = {
  step: AgentStep
}

export const AgentStepRow: FC<Props> = ({ step }) => {
  const theme = useTheme()
  const color = theme.colors[categoryColor[step.category]]
  const IconComponent = stepIconComponent[step.iconType]
  const iconStyle = { fontSize: 16, color: color.toCssValue() }

  return (
    <Row $isActive={step.isActive}>
      <IconBox>
        {step.iconType === 'loader' ? (
          <LoaderIcon spinning={step.isActive} style={iconStyle} />
        ) : (
          <IconComponent style={iconStyle} />
        )}
      </IconBox>
      <LabelContainer>
        <StepLabel style={{ color: color.toCssValue() }}>
          {step.label}
        </StepLabel>
        {step.description && (
          <StepDescription style={{ color: color.toCssValue() }}>
            {step.description}
          </StepDescription>
        )}
      </LabelContainer>
    </Row>
  )
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`

const Row = styled.div<{ $isActive?: boolean }>`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  ${({ $isActive }) =>
    $isActive &&
    css`
      animation: ${pulse} 1.2s ease-in-out infinite;
    `}
`

const IconBox = styled.div`
  flex-shrink: 0;
  width: 16px;
  padding-top: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const LabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 2px;
`

const stepLabelBase = css`
  font-family: 'LCDDot TR', monospace;
  font-size: 20px;
  line-height: 20px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
`

const StepLabel = styled.span`
  ${stepLabelBase}
  white-space: nowrap;
`

const StepDescription = styled.span`
  ${stepLabelBase}
  white-space: pre-wrap;
  color: ${getColor('textShy')};
`
