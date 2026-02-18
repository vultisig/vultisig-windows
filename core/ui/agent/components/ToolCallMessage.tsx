import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { WarningIcon } from '@lib/ui/icons/WarningIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, memo, useState } from 'react'
import styled, { keyframes } from 'styled-components'

import { ToolCallInfo } from '../types'
import { formatToolName } from '../utils/formatToolName'
import { getActionIcon } from './shared/actionIcons'
import { agentCard } from './shared/agentCard'
import { DetailRow } from './shared/DetailRow'

type Props = {
  toolCall: ToolCallInfo
}

const statusLabels: Record<string, string> = {
  running: 'Running',
  success: 'Completed',
  error: 'Failed',
}

const formatParamValue = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'yes' : 'no'
  return JSON.stringify(value)
}

const formatParamKey = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const ToolCallMessageComponent: FC<Props> = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false)
  const icon = getActionIcon(toolCall.actionType)
  const displayName = formatToolName(toolCall.actionType)
  const hasResult =
    toolCall.resultData && Object.keys(toolCall.resultData).length > 0
  const hasParams = toolCall.params && Object.keys(toolCall.params).length > 0

  return (
    <Card $status={toolCall.status}>
      <HStack
        gap={12}
        alignItems="center"
        justifyContent="space-between"
        onClick={() => (hasResult || hasParams) && setExpanded(prev => !prev)}
        style={{ cursor: hasResult || hasParams ? 'pointer' : 'default' }}
      >
        <HStack gap={10} alignItems="center">
          <IconBox>{icon}</IconBox>
          <VStack gap={2}>
            <Text size={13} weight={600}>
              {displayName}
            </Text>
            <StatusRow $status={toolCall.status}>
              {toolCall.status === 'running' && <SpinnerDot />}
              {toolCall.status === 'success' && <CheckIcon />}
              {toolCall.status === 'error' && <WarningIcon />}
              <Text size={11}>{statusLabels[toolCall.status]}</Text>
            </StatusRow>
          </VStack>
        </HStack>
        {(hasResult || hasParams) && (
          <Chevron $expanded={expanded}>{'\u{25B8}'}</Chevron>
        )}
      </HStack>

      {expanded && (hasResult || hasParams) && (
        <Details>
          {hasParams && toolCall.status === 'running' && (
            <DetailSection>
              {Object.entries(toolCall.params!).map(([key, value]) => (
                <DetailRow key={key}>
                  <Text size={11} color="supporting">
                    {formatParamKey(key)}
                  </Text>
                  <Text size={11}>{formatParamValue(value)}</Text>
                </DetailRow>
              ))}
            </DetailSection>
          )}
          {hasResult && (
            <DetailSection>
              {Object.entries(toolCall.resultData!).map(([key, value]) => (
                <DetailRow key={key}>
                  <Text size={11} color="supporting">
                    {formatParamKey(key)}
                  </Text>
                  <Text size={11}>{formatParamValue(value)}</Text>
                </DetailRow>
              ))}
            </DetailSection>
          )}
          {toolCall.error && <ErrorText size={11}>{toolCall.error}</ErrorText>}
        </Details>
      )}
    </Card>
  )
}

export const ToolCallMessage = memo(ToolCallMessageComponent)

const Card = styled.div<{ $status: string }>`
  ${agentCard}
  padding: 10px 14px;
  border-radius: 10px;
  min-width: 200px;
  max-width: 100%;
  border-color: ${({ $status }) =>
    $status === 'error'
      ? 'rgba(255, 80, 80, 0.3)'
      : $status === 'success'
        ? 'rgba(51, 230, 191, 0.3)'
        : getColor('mist')};
`

const IconBox = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`

const StatusRow = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ $status }) =>
    $status === 'error'
      ? '#ff5050'
      : $status === 'success'
        ? '#33e6bf'
        : getColor('textSupporting')};

  svg {
    width: 12px;
    height: 12px;
  }
`

const SpinnerDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: ${pulse} 1.2s ease-in-out infinite;
`

const Chevron = styled.span<{ $expanded: boolean }>`
  font-size: 14px;
  color: ${getColor('textSupporting')};
  transform: rotate(${({ $expanded }) => ($expanded ? '90deg' : '0deg')});
  transition: transform 0.15s ease;
`

const Details = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid ${getColor('mist')};
  max-height: 240px;
  overflow-y: auto;
`

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ErrorText = styled(Text)`
  color: #ff5050;
  margin-top: 4px;
`
